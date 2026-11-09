import { AdminProductsManager } from "@/components/admin/AdminProductsManager";
import { getAdminProductsPageData } from "@/lib/product-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    new?: string;
    edit?: string;
    filter?: string;
    cat?: string;
    categories?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const [data, params] = await Promise.all([getAdminProductsPageData(), searchParams]);

  const validFilters = ["all", "active", "in_stock", "out_of_stock", "draft", "archived"] as const;
  const initialStatusFilter = validFilters.includes(params.filter as (typeof validFilters)[number])
    ? (params.filter as (typeof validFilters)[number])
    : "all";

  return (
    <AdminProductsManager
      initialProducts={data.products}
      categories={data.categories}
      databaseEnabled={data.databaseEnabled}
      usingFallbackData={data.usingFallbackData}
      initialOpenNew={params.new === "1" || params.new === "true"}
      initialOpenCategories={params.categories === "1" || params.categories === "true"}
      initialEditId={params.edit ?? null}
      initialStatusFilter={initialStatusFilter}
      initialCategoryFilter={params.cat ?? "all"}
    />
  );
}
