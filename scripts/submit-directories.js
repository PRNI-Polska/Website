/**
 * Submits www.prni.org.pl to free web directories and search engines.
 * Run manually: node scripts/submit-directories.js
 *
 * These are all legitimate, free directory/search engine submissions
 * that create real indexed backlinks.
 */

const SITE = {
  url: "https://www.prni.org.pl",
  name: "PRNI — Polski Ruch Narodowo-Integralistyczny",
  description:
    "PRNI (Polski Ruch Narodowo-Integralistyczny) — Polish National-Integralist Movement. Political movement for national sovereignty, tradition, and integral unity of Poland.",
  descriptionPL:
    "PRNI (Polski Ruch Narodowo-Integralistyczny) — ruch polityczny na rzecz suwerenności, tradycji i integralności narodowej Polski. Przyszłość zaczyna się teraz.",
  sitemap: "https://www.prni.org.pl/sitemap.xml",
  rss: "https://www.prni.org.pl/feed.xml",
};

const SEARCH_ENGINES = [
  {
    name: "IndexNow (Bing/Yandex/DuckDuckGo)",
    url: "https://api.indexnow.org/indexnow",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: "www.prni.org.pl",
      key: "6088913f53984a629f75d5860ad322e6",
      keyLocation:
        "https://www.prni.org.pl/6088913f53984a629f75d5860ad322e6.txt",
      urlList: [
        "https://www.prni.org.pl",
        "https://www.prni.org.pl/about",
        "https://www.prni.org.pl/manifesto",
        "https://www.prni.org.pl/announcements",
        "https://www.prni.org.pl/events",
        "https://www.prni.org.pl/recruitment",
        "https://www.prni.org.pl/contact",
        "https://www.prni.org.pl/merch",
        "https://www.prni.org.pl/wings",
      ],
    }),
  },
];

async function submitToSearchEngines() {
  console.log("=== Submitting to search engines ===\n");
  for (const engine of SEARCH_ENGINES) {
    try {
      const res = await fetch(engine.url, {
        method: engine.method,
        headers: engine.headers,
        body: engine.body,
      });
      console.log(`✓ ${engine.name}: ${res.status}`);
    } catch (e) {
      console.log(`✗ ${engine.name}: ${e.message}`);
    }
  }
}

function printDirectoryInstructions() {
  console.log("\n=== Manual directory submissions for backlinks ===\n");
  console.log("Submit your site to these free directories for real backlinks:\n");

  const directories = [
    {
      name: "Google Business Profile",
      url: "https://business.google.com",
      note: "Create an organization listing — can trigger Knowledge Panel",
    },
    {
      name: "Bing Places",
      url: "https://www.bingplaces.com",
      note: "Bing's equivalent of Google Business Profile",
    },
    {
      name: "Panorama Firm (Polish)",
      url: "https://panoramafirm.pl",
      note: "Largest Polish business directory — high-authority .pl backlink",
    },
    {
      name: "PKT.pl (Polish)",
      url: "https://www.pkt.pl",
      note: "Polish Yellow Pages — trusted .pl domain backlink",
    },
    {
      name: "Firmy.net (Polish)",
      url: "https://www.firmy.net",
      note: "Free Polish business directory",
    },
    {
      name: "Hotfrog",
      url: "https://www.hotfrog.com",
      note: "International business directory — free listing",
    },
    {
      name: "Cylex",
      url: "https://www.cylex.pl",
      note: "Polish business directory with dofollow links",
    },
    {
      name: "About.me",
      url: "https://about.me",
      note: "Create an organization profile page with link",
    },
    {
      name: "Linktree",
      url: "https://linktr.ee",
      note: "Create a link page for all PRNI social profiles + website",
    },
    {
      name: "GitHub Pages",
      url: "https://github.com/PRNI-Polska",
      note: "Your GitHub org page — make sure website link is in the org profile",
    },
  ];

  directories.forEach((d, i) => {
    console.log(`${i + 1}. ${d.name}`);
    console.log(`   URL: ${d.url}`);
    console.log(`   → ${d.note}\n`);
  });

  console.log("=== Social profiles to create/update ===\n");
  console.log("Make sure each profile has:");
  console.log(`  - Name: "PRNI — Polski Ruch Narodowo-Integralistyczny"`);
  console.log(`  - Bio: "${SITE.descriptionPL}"`);
  console.log(`  - Website: ${SITE.url}`);
  console.log(`  - Location: Poland\n`);

  console.log("Platforms:");
  console.log("  1. Twitter/X — link in bio + pinned tweet with website");
  console.log("  2. Instagram — link in bio");
  console.log("  3. Telegram — channel description + pinned message");
  console.log("  4. YouTube — About section (even with 0 videos, it's a backlink)");
  console.log("  5. Reddit — create r/PRNI or a user profile with link");
  console.log("  6. LinkedIn — create a company page\n");
}

async function main() {
  await submitToSearchEngines();
  printDirectoryInstructions();

  console.log("\n=== RSS Feed ===\n");
  console.log(`Your RSS feed is at: ${SITE.rss}`);
  console.log("Submit it to these RSS aggregators for automatic content syndication:");
  console.log("  - https://feedly.com (paste your RSS URL)");
  console.log("  - https://feedburner.google.com");
  console.log("  - https://www.newsblur.com\n");

  console.log("Done! Each backlink from a different domain strengthens your");
  console.log('Google ranking for "PRNI". Aim for 10-20 quality backlinks.\n');
}

main();
