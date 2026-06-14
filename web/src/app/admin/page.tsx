import type { ReactNode } from "react";
import Link from "next/link";

import { getAdminDashboardData } from "@/lib/product-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  const maxCategoryCount = Math.max(...data.byCat.map((item) => item.count), 1);
  const hasOrderData = data.ordersTotal > 0;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <section className="border border-white/10 bg-[#111] p-8 text-white">
        <p className="text-sm uppercase tracking-[0.35em] text-white/40">Admin</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl md:text-6xl">Dashboard</h1>
            <p className="mt-4 text-base leading-7 text-white/50">
              Catalogo, ordini e performance del negozio.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/products"
                className="border-2 border-white bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-white"
              >
                Gestione prodotti
              </Link>
              <Link
                href="/admin/orders"
                className="border border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/8"
              >
                Ordini
              </Link>
              <Link
                href="/shop"
                className="border border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/8"
              >
                Vai allo shop
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Prodotti totali" value={String(data.products)} />
            <MetricCard label="In stock" value={String(data.inStock)} />
            <MetricCard label="Categorie" value={String(data.categories)} />
            <MetricCard
              label="Fatturato reale"
              value={data.revenueFormatted}
              dim={!hasOrderData}
            />
            <MetricCard
              label="Ordini (30gg)"
              value={data.ordersLast30 > 0 ? String(data.ordersLast30) : "—"}
              dim={data.ordersLast30 === 0}
            />
            <MetricCard
              label="Media ordine"
              value={data.aovFormatted}
              dim={!hasOrderData}
            />
          </div>
        </div>
      </section>

      {(data.usingFallbackData || !data.databaseEnabled) && (
        <section className="border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
          {!data.databaseEnabled
            ? "DATABASE_URL non configurato: la dashboard sta leggendo il catalogo statico in fallback."
            : "Il database non è raggiungibile al momento: la dashboard sta mostrando il catalogo statico di fallback."}
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-white/8 bg-[#111] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/30">Distribuzione</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Prodotti per categoria</h2>
            </div>
            <span className="border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              {data.products} prodotti
            </span>
          </div>
          <div className="mt-8 flex h-64 items-end gap-3 border border-dashed border-white/10 bg-white/3 p-6">
            {data.byCat.map((entry) => (
              <div key={entry.name} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full bg-white"
                    style={{ height: `${Math.max((entry.count / maxCategoryCount) * 100, 10)}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">{entry.count}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">{entry.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <Panel
            title={hasOrderData ? "Top venduti" : "Top catalogo"}
            badge={hasOrderData ? "Vendite reali" : "In stock"}
          >
            {data.topProducts.length > 0 ? (
              <ul className="space-y-3 text-sm text-white/60">
                {data.topProducts.map((product, index) => (
                  <li
                    key={product.name}
                    className="flex items-center justify-between border border-white/8 bg-white/3 px-4 py-3"
                  >
                    <span>{product.name}</span>
                    <span className="border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/80">
                      {hasOrderData && product.qty > 0 ? `${product.qty} pz` : `#${index + 1}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/30">Nessun ordine ancora registrato.</p>
            )}
          </Panel>

          <Panel title="Esauriti" badge="Alert">
            {data.lowStock.length > 0 ? (
              <ul className="space-y-3 text-sm text-white/60">
                {data.lowStock.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between border border-red-400/20 bg-red-400/5 px-4 py-3"
                  >
                    <span>{item.name}</span>
                    <span className="border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                      {item.category}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/30">Tutti i prodotti hanno stock disponibile.</p>
            )}
          </Panel>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  dim = false,
}: {
  label: string;
  value: string;
  dim?: boolean;
}) {
  return (
    <div className="border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${dim ? "text-white/30" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-white/8 bg-[#111] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <span className="border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          {badge}
        </span>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
