import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal2026", "/api", "/cart", "/checkout", "/order-confirmation"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
