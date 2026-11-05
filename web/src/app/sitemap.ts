import type { MetadataRoute } from "next";

import { categoryHref } from "@/lib/category-seo";
import { getStorefrontCategories, getStorefrontProducts } from "@/lib/product-data";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "/", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/shop", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/denim-customize", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/contatti", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/cookie-policy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/termini-e-condizioni", changeFrequency: "yearly" as const, priority: 0.3 },
  ].map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(categoryHref(category.slug)),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.slug}`),
    lastModified: new Date(product.createdAt),
    changeFrequency: "weekly",
    priority: product.inStock ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
