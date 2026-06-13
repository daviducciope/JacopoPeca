import type { Metadata } from "next";

import { getStorefrontCategories, getStorefrontProducts } from "@/lib/product-data";
import { ensureDynamicRendering } from "@/lib/render-mode";
import { ShopCatalog } from "@/components/ShopCatalog";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop ufficiale Jacopo Peca: denim streetwear handmade, pezzi unici e limited edition made in Italy.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Jacopo Peca",
    description: "Denim streetwear handmade, pezzi unici e limited edition made in Italy.",
    url: "/shop",
  },
};

export default async function ShopPage() {
  await ensureDynamicRendering();

  const [categories, products] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontProducts(),
  ]);

  return <ShopCatalog categories={categories} products={products} />;
}
