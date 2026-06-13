import Link from "next/link";

import { formatPrice } from "@/lib/catalog";
import { getAdminOrdersPageData } from "@/lib/order-data";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const data = await getAdminOrdersPageData();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/30">Superadmin</p>
          <h1 className="mt-1 font-display text-4xl text-white">Ordini</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            Ultimi ordini Stripe registrati dal webhook checkout.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="admin-link">Dashboard</Link>
          <Link href="/admin/products" className="admin-link">Prodotti</Link>
        </div>
      </div>

      {(!data.databaseEnabled || data.usingFallbackData) && (
        <section className="border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
          {!data.databaseEnabled
            ? "DATABASE_URL non configurato: gli ordini richiedono il database runtime."
            : "Il database non e raggiungibile: impossibile caricare gli ordini."}
        </section>
      )}

      <section className="overflow-hidden border border-white/8 bg-[#111]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Ordine</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Cliente</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Articoli</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Totale</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Stato</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Stripe</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 align-top">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-white/35">{new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-white">{order.customerName || "Cliente Stripe"}</p>
                    <p className="mt-1 text-xs text-white/40">{order.customerEmail}</p>
                  </td>
                  <td className="px-5 py-4">
                    <ul className="space-y-2 text-white/55">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity}x {item.productName}
                          {item.sizeLabel ? <span className="text-white/35"> / {item.sizeLabel}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-5 py-4 font-semibold text-white">{formatPrice(order.totalCents)}</td>
                  <td className="px-5 py-4">
                    <span className="border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                      {order.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-white/45">
                    {order.stripeCheckoutId ? <p>Checkout: {order.stripeCheckoutId}</p> : null}
                    {order.stripePaymentIntentId ? <p className="mt-1">Payment: {order.stripePaymentIntentId}</p> : null}
                  </td>
                </tr>
              ))}
              {data.orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-white/40">
                    Nessun ordine registrato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
