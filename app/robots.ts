import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/members", "/calls"],
      },
    ],
    sitemap: "https://prni.org.pl/sitemap.xml",
  };
}
