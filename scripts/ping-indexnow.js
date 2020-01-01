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

async function ping() {
  const body = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: URLS,
  });

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      console.log(`${url}: ${res.status}`);
    } catch (e) {
      console.error(`${url}: ${e.message}`);
    }
  }
}

ping();
