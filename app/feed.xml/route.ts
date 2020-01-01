import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      category: true,
      author: { select: { name: true } },
    },
  });

  const host = "https://www.prni.org.pl";
  const now = new Date().toUTCString();

  const items = announcements
    .map(
      (a) => `    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${host}/announcements/${a.slug}</link>
      <guid isPermaLink="true">${host}/announcements/${a.slug}</guid>
      <description><![CDATA[${a.excerpt || ""}]]></description>
      <category>${a.category}</category>
      ${a.publishedAt ? `<pubDate>${a.publishedAt.toUTCString()}</pubDate>` : ""}
      ${a.author?.name ? `<author>${a.author.name}</author>` : ""}
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PRNI — Polski Ruch Narodowo-Integralistyczny</title>
    <link>${host}</link>
    <description>Komunikaty PRNI (Polski Ruch Narodowo-Integralistyczny) — Przyszłość zaczyna się teraz</description>
    <language>pl</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${host}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${host}/logo.png</url>
      <title>PRNI</title>
      <link>${host}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
