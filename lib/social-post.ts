const HOST = "https://www.prni.org.pl";

interface PostContent {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: string | null;
}

function buildMessage(post: PostContent): string {
  return [
    `📢 ${post.title}`,
    "",
    post.excerpt,
    "",
    `🔗 ${HOST}/announcements/${post.slug}`,
    "",
    "#PRNI #PolskiRuchNarodowoIntegralistyczny #NarródPonadWszystkim",
  ].join("\n");
}

function buildShortMessage(post: PostContent): string {
  const url = `${HOST}/announcements/${post.slug}`;
  const tags = " #PRNI #NaródPonadWszystkim";
  const maxTitle = 280 - url.length - tags.length - 5;
  const title =
    post.title.length > maxTitle
      ? post.title.slice(0, maxTitle - 1) + "…"
      : post.title;
  return `📢 ${title}\n\n${url}${tags}`;
}

// ─── Telegram ────────────────────────────────────────────

async function postToTelegram(post: PostContent): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !chatId) return false;

  const text = buildMessage(post);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  });

  if (!res.ok) {
    console.error("Telegram post failed:", await res.text());
  }
  return res.ok;
}

// ─── Twitter / X ─────────────────────────────────────────

async function postToTwitter(post: PostContent): Promise<boolean> {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) return false;

  const text = buildShortMessage(post);

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const params: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const baseUrl = "https://api.twitter.com/2/tweets";

  const paramString = Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");

  const signatureBase = [
    "POST",
    encodeURIComponent(baseUrl),
    encodeURIComponent(paramString),
  ].join("&");

  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingKey),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signatureBase));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));

  const authHeader =
    "OAuth " +
    [
      ...Object.entries(params),
      ["oauth_signature", signature],
    ]
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ");

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    console.error("Twitter post failed:", await res.text());
  }
  return res.ok;
}

// ─── Instagram (via Meta Graph API) ─────────────────────

async function postToInstagram(post: PostContent): Promise<boolean> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  if (!accessToken || !accountId) return false;

  const caption = buildMessage(post);
  const imageUrl = post.featuredImage || `${HOST}/logo.png`;

  const createRes = await fetch(
    `https://graph.facebook.com/v19.0/${accountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      }),
    }
  );

  if (!createRes.ok) {
    console.error("Instagram media creation failed:", await createRes.text());
    return false;
  }

  const { id: mediaId } = await createRes.json();

  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${accountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: mediaId,
        access_token: accessToken,
      }),
    }
  );

  if (!publishRes.ok) {
    console.error("Instagram publish failed:", await publishRes.text());
  }
  return publishRes.ok;
}

// ─── Main entry point ────────────────────────────────────

export async function shareToSocials(post: PostContent) {
  const results = await Promise.allSettled([
    postToTelegram(post),
    postToTwitter(post),
    postToInstagram(post),
  ]);

  return {
    telegram: results[0].status === "fulfilled" && results[0].value,
    twitter: results[1].status === "fulfilled" && results[1].value,
    instagram: results[2].status === "fulfilled" && results[2].value,
  };
}
