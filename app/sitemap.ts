import type { MetadataRoute } from "next";
import { getAllPages, getAllProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

function baseUrl(): string {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const [products, pages] = await Promise.all([getAllProducts(), getAllPages()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/shop/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const pageRoutes: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${base}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...pageRoutes];
}
