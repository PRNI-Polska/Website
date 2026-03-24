import { NextResponse } from "next/server";

const INDEXNOW_KEY = "6088913f53984a629f75d5860ad322e6";
const HOST = "www.prni.org.pl";

const URLS = [
  `https://${HOST}`,
  `https://${HOST}/about`,
  `https://${HOST}/manifesto`,
  `https://${HOST}/announcements`,
  `https://${HOST}/events`,
  `https://${HOST}/recruitment`,
  `https://${HOST}/contact`,
  `https://${HOST}/merch`,
  `https://${HOST}/wings`,
  `https://${HOST}/wings/main`,
  `https://${HOST}/wings/international`,
];

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: URLS,
  };

  const results = await Promise.allSettled([
    fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    fetch("https://yandex.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  ]);

  const summary = results.map((r, i) => {
    const engine = ["IndexNow API", "Bing", "Yandex"][i];
    if (r.status === "fulfilled") {
      return { engine, status: r.value.status, ok: r.value.ok };
    }
    return { engine, error: (r as PromiseRejectedResult).reason?.message };
  });

  return NextResponse.json({ submitted: URLS.length, results: summary });
}
