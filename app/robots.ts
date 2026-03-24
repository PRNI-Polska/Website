import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/members/", "/calls/"],
      },
    ],
    sitemap: "https://www.prni.org.pl/sitemap.xml",
  };
}
