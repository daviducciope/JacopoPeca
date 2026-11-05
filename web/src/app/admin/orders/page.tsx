import { AdminOrdersManager } from "@/components/admin/AdminOrdersManager";
import { getAdminOrdersPageData } from "@/lib/order-data";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const data = await getAdminOrdersPageData();

  return (
    <AdminOrdersManager
      initialOrders={data.orders}
      databaseEnabled={data.databaseEnabled}
      usingFallbackData={data.usingFallbackData}
    />
  );
}
