import type { ReactNode } from "react";
import Image from "@/components/StoreImage";
import Link from "next/link";

import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminDashboardData } from "@/lib/product-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  const maxCategoryCount = Math.max(...data.byCat.map((item) => item.count), 1);
  const hasOrderData = data.ordersTotal > 0;

  return (
    <div className="flex flex-1 flex-col">
      <AdminNav />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10">
        {/* ── HERO DASHBOARD ── */}
        <section className="border border-white/12 bg-[#121212] p-7 text-white lg:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff5252]">
                Pannello di Controllo
              </p>
              <h1 className="mt-2 font-display text-5xl tracking-wider md:text-6xl">
                Dashboard Admin
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Gestisci il catalogo Jacopo Peca in modo rapido: carica nuovi capi con foto, aggiorna
                le taglie disponibili e controlla gli ordini dei clienti.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/admin/products?new=1"
                  className="border-2 border-[#e01010] bg-[#e01010] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#b80d0d]"
                >
                  + Carica Nuovo Prodotto
                </Link>
                <Link
                  href="/admin/products"
                  className="border-2 border-white bg-white px-5 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-white"
                >
                  👕 Gestisci Catalogo ({data.products})
                </Link>
                <Link
                  href="/admin/orders"
                  className="border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white/85 transition hover:bg-white/15 hover:text-white"
                >
                  📦 Ordini ({data.ordersTotal})
                </Link>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="Prodotti Totali"
                value={String(data.products)}
                href="/admin/products"
                sub={data.draftCount > 0 ? `${data.draftCount} in bozza` : "Vedi tutti →"}
              />
              <MetricCard
                label="Disponibili in Stock"
                value={String(data.inStock)}
                href="/admin/products?filter=in_stock"
                accent="emerald"
                sub="Acquistabili ora →"
              />
              <MetricCard
                label="Esauriti (0 pz)"
                value={String(data.outOfStock)}
                href="/admin/products?filter=out_of_stock"
                accent={data.outOfStock > 0 ? "red" : "default"}
                sub={data.outOfStock > 0 ? "Ricarica stock →" : "Nessun esaurito"}
              />
              <MetricCard
                label="Fatturato Pagato"
                value={data.revenueFormatted}
                href="/admin/orders"
                dim={!hasOrderData}
              />
              <MetricCard
                label="Ordini (ultimi 30gg)"
                value={data.ordersLast30 > 0 ? String(data.ordersLast30) : "0"}
                href="/admin/orders"
                dim={data.ordersLast30 === 0}
              />
              <MetricCard
                label="Scontrino Medio"
                value={data.aovFormatted}
                href="/admin/orders"
                dim={!hasOrderData}
              />
            </div>
          </div>
        </section>

        {data.unfulfilledCount > 0 && (
          <section className="border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm text-amber-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">
                {data.unfulfilledCount === 1
                  ? "1 ordine pagato da spedire"
                  : `${data.unfulfilledCount} ordini pagati da spedire`}
              </p>
              <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-wider text-white underline">
                Apri gli ordini
              </Link>
            </div>
            <ul className="mt-3 space-y-1.5 text-amber-100/90">
              {data.unfulfilledOrders.map((order) => (
                <li key={order.id}>
                  <Link href="/admin/orders" className="font-semibold text-white hover:underline">
                    {order.orderNumber}
                  </Link>
                  {" · "}
                  {order.totalFormatted}
                  {" · "}
                  {new Date(order.createdAt).toLocaleString("it-IT", {
                    timeZone: "Europe/Rome",
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(data.usingFallbackData || !data.databaseEnabled) && (
          <section className="border border-amber-400/25 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
            {!data.databaseEnabled
              ? "DATABASE_URL non configurato: la dashboard sta leggendo il catalogo statico in fallback."
              : "Il database non è raggiungibile al momento: la dashboard sta mostrando il catalogo statico di fallback."}
          </section>
        )}

        {/* ── SEZIONE OPERATIVA: ULTIMI PRODOTTI & ESAURITI ── */}
        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          {/* Ultimi prodotti caricati */}
          <div className="border border-white/10 bg-[#111] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Catalogo Rapido</p>
                <h2 className="mt-1 text-2xl font-bold text-white">Ultimi Prodotti</h2>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/products?new=1"
                  className="bg-[#e01010] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#b80d0d]"
                >
                  + Nuovo
                </Link>
                <Link
                  href="/admin/products"
                  className="border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 transition hover:bg-white/15 hover:text-white"
                >
                  Vedi tutti →
                </Link>
              </div>
            </div>

            <div className="mt-5 divide-y divide-white/8 border border-white/8 bg-black/30">
              {data.recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition hover:bg-white/4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-white/12 bg-[#1a1a1a]">
                      {product.thumb ? (
                        <Image
                          src={product.thumb}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-white/30">
                          Foto
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-white/45">
                        {product.category} · <strong className="text-white/80">{product.priceFormatted}</strong> ·{" "}
                        {product.stock} pz
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`border px-2 py-0.5 text-[11px] font-semibold ${
                        product.status === "ARCHIVED"
                          ? "border-white/15 bg-white/5 text-white/45"
                          : product.status === "DRAFT"
                            ? "border-amber-400/35 bg-amber-400/10 text-amber-300"
                            : product.inStock
                              ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-300"
                              : "border-red-400/35 bg-red-400/10 text-red-300"
                      }`}
                    >
                      {product.status === "ARCHIVED"
                        ? "Archiviato"
                        : product.status === "DRAFT"
                          ? "Bozza"
                          : product.inStock
                            ? "Attivo"
                            : "Esaurito"}
                    </span>
                    <Link
                      href={`/admin/products?edit=${product.id}`}
                      className="border border-white/25 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white/85"
                    >
                      ✏️ Modifica
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonna destra: Prodotti Esauriti + Top Venduti */}
          <div className="flex flex-col gap-6">
            <Panel
              title="Taglie esaurite (0 pz)"
              badge={data.soldOutSizes.length > 0 ? `${data.soldOutSizes.length} da ricaricare` : "Tutto ok"}
              badgeColor={data.soldOutSizes.length > 0 ? "red" : "emerald"}
            >
              {data.soldOutSizes.length > 0 ? (
                <ul className="space-y-2.5 text-sm">
                  {data.soldOutSizes.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 border border-red-400/20 bg-red-500/8 px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-white/45">
                          Taglia {item.size} · {item.category}
                        </p>
                      </div>
                      <Link
                        href={`/admin/products?edit=${item.productId}`}
                        className="shrink-0 border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-black"
                      >
                        Ricarica →
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-300/80">
                  ✓ Tutte le taglie attive hanno stock disponibile.
                </p>
              )}
            </Panel>

            <Panel
              title={hasOrderData ? "Più Venduti" : "Prodotti in Vetrina"}
              badge={hasOrderData ? "Vendite reali" : "In stock"}
            >
              {data.topProducts.length > 0 ? (
                <ul className="space-y-2.5 text-sm text-white/75">
                  {data.topProducts.map((product, index) => (
                    <li
                      key={product.name}
                      className="flex items-center justify-between border border-white/8 bg-white/3 px-4 py-2.5"
                    >
                      <span className="font-medium text-white">{product.name}</span>
                      <span className="border border-white/12 bg-white/8 px-2.5 py-0.5 text-xs font-semibold text-white/80">
                        {hasOrderData && product.qty > 0 ? `${product.qty} venduti` : `#${index + 1}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/40">Nessun ordine ancora registrato.</p>
              )}
            </Panel>
          </div>
        </section>

        {/* ── DISTRIBUZIONE PER CATEGORIA (CLICCABILE) ── */}
        <section className="border border-white/10 bg-[#111] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Esplora per Reparto</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Prodotti per Categoria</h2>
              <p className="text-xs text-white/45">
                Clicca su una categoria per filtrare subito i suoi prodotti.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                {data.categories} categorie
              </span>
              <Link
                href="/admin/products?categories=1"
                className="border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
              >
                🏷️ Gestisci Categorie →
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {data.byCat.map((entry) => {
              const pct = Math.round((entry.count / maxCategoryCount) * 100);
              return (
                <Link
                  key={entry.id}
                  href={`/admin/products?cat=${entry.id}`}
                  className="group flex flex-col justify-between border border-white/10 bg-white/3 p-4 transition hover:border-white/35 hover:bg-white/8"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80 group-hover:text-white">
                      {entry.name}
                    </span>
                    <span className="text-lg font-bold text-white">{entry.count}</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden bg-white/10">
                    <div
                      className="h-full bg-[#e01010] transition-all group-hover:bg-white"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  href,
  sub,
  dim = false,
  accent = "default",
}: {
  label: string;
  value: string;
  href: string;
  sub?: string;
  dim?: boolean;
  accent?: "default" | "emerald" | "red";
}) {
  const borderClass =
    accent === "emerald"
      ? "border-emerald-400/30 bg-emerald-500/8 hover:border-emerald-400/60"
      : accent === "red"
        ? "border-red-400/35 bg-red-500/10 hover:border-red-400/60"
        : "border-white/12 bg-white/5 hover:border-white/30";

  return (
    <Link href={href} className={`block border p-4 transition ${borderClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className={`mt-1.5 text-3xl font-bold ${dim ? "text-white/35" : "text-white"}`}>{value}</p>
      {sub && <p className="mt-1 text-[11px] font-medium text-white/50">{sub}</p>}
    </Link>
  );
}

function Panel({
  title,
  badge,
  badgeColor = "default",
  children,
}: {
  title: string;
  badge: string;
  badgeColor?: "default" | "red" | "emerald";
  children: ReactNode;
}) {
  const badgeClasses =
    badgeColor === "red"
      ? "border-red-400/35 bg-red-500/15 text-red-300"
      : badgeColor === "emerald"
        ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
        : "border-white/12 bg-white/5 text-white/65";

  return (
    <div className="border border-white/10 bg-[#111] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <span className={`border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${badgeClasses}`}>
          {badge}
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
