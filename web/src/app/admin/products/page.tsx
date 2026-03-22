import { AdminProductsManager } from "@/components/admin/AdminProductsManager";
import { getAdminProductsPageData } from "@/lib/product-data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const data = await getAdminProductsPageData();

  return (
    <AdminProductsManager
      initialProducts={data.products}
      categories={data.categories}
      databaseEnabled={data.databaseEnabled}
      usingFallbackData={data.usingFallbackData}
    />
  );
}