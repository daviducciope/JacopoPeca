import Link from "next/link";
import { products, categories, formatPrice } from "@/lib/catalog";

const inStock = products.filter((p) => p.inStock);
const outOfStock = products.filter((p) => !p.inStock);
const totalRevenuePotential = inStock.reduce((sum, p) => sum + p.priceCents, 0);

const adminOverview = {
  revenue: formatPrice(totalRevenuePotential),
  products: products.length,
  inStock: inStock.length,
  categories: categories.length,
  topProducts: inStock.slice(0, 3).map((p) => p.name),
  lowStock: outOfStock.slice(0, 3).map((p) => ({
    name: p.name,
    category: p.categoryName,
  })),
  byCat: categories.map((c) => ({
    name: c.name,
    count: c.count,
  })),
};

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <section className="border border-white/10 bg-[#111] p-8 text-white">
        <p className="text-sm uppercase tracking-[0.35em] text-white/40">Superadmin</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl md:text-6xl">
              Controllo completo su catalogo, ordini e performance.
            </h1>
            <p className="mt-4 text-base leading-7 text-white/50">
              Dashboard collegata al catalogo reale WooCommerce con checkout Stripe attivo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/products" className="border-2 border-white bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-white">
                Gestione prodotti
              </Link>
              <Link href="/shop" className="border border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/8">
                Vai allo shop
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Prodotti totali" value={String(adminOverview.products)} />
            <MetricCard label="In stock" value={String(adminOverview.inStock)} />
            <MetricCard label="Categorie" value={String(adminOverview.categories)} />
            <MetricCard label="Valore catalogo" value={adminOverview.revenue} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-white/8 bg-[#111] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/30">Prodotti per categoria</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Distribuzione catalogo reale</h2>
            </div>
            <span className="border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              {products.length} prodotti
            </span>
          </div>
          <div className="mt-8 flex h-72 items-end gap-4 border border-dashed border-white/10 bg-white/3 p-6">
            {adminOverview.byCat.map((entry) => (
              <div key={entry.name} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full bg-white"
                    style={{ height: `${Math.max((entry.count / Math.max(...adminOverview.byCat.map(e => e.count))) * 100, 14)}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">{entry.count}</p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">{entry.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <Panel title="Prodotti top" badge="Vendite">
            <ul className="space-y-3 text-sm text-white/60">
              {adminOverview.topProducts.map((product, index) => (
                <li key={product} className="flex items-center justify-between border border-white/8 bg-white/3 px-4 py-3">
                  <span>{product}</span>
                  <span className="border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/80">#{index + 1}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Esauriti" badge="Alert">
            <ul className="space-y-3 text-sm text-white/60">
              {adminOverview.lowStock.map((item) => (
                <li key={item.name} className="flex items-center justify-between border border-red-400/20 bg-red-400/5 px-4 py-3">
                  <span>{item.name}</span>
                  <span className="border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">{item.category}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>

      <section className="border border-white/8 bg-[#111] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">Catalogo</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Catalogo prodotti reali — {products.length} pezzi</h2>
          </div>
          <div className="border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/50">
            Dati importati da WooCommerce
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {products.slice(0, 9).map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="border border-white/8 bg-white/3 p-5 transition hover:bg-white/6">
              <p className="text-xs uppercase tracking-[0.2em] text-white/30">{product.categoryName}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{product.name}</h3>
              <div className="mt-3 text-sm leading-6 text-white/40">
                {product.sizes.length > 0 && <span>{product.sizes.length} taglie · </span>}
                {product.inStock ? "In stock" : "Esaurito"}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{formatPrice(product.priceCents)}</span>
                <span className="border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  {product.inStock ? "attivo" : "esaurito"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
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
  children: React.ReactNode;
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
