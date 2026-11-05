import { AdminOrdersManager } from "@/components/admin/AdminOrdersManager";
import { getAdminOrdersPageData } from "@/lib/order-data";
import { getAdminProductsPageData } from "@/lib/product-data";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [ordersData, productsData] = await Promise.all([
    getAdminOrdersPageData(),
    getAdminProductsPageData(),
  ]);

  return (
    <AdminOrdersManager
      initialOrders={ordersData.orders}
      initialShippingSettings={ordersData.shippingSettings}
      products={productsData.products}
      databaseEnabled={ordersData.databaseEnabled}
      usingFallbackData={ordersData.usingFallbackData}
    />
  );
}
