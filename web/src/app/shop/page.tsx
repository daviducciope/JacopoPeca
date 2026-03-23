import { getStorefrontCategories, getStorefrontProducts } from "@/lib/product-data";
import { ensureDynamicRendering } from "@/lib/render-mode";
import { ShopCatalog } from "@/components/ShopCatalog";

export default async function ShopPage() {
  await ensureDynamicRendering();

  const [categories, products] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontProducts(),
  ]);

  return <ShopCatalog categories={categories} products={products} />;
}
