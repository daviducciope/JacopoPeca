"use client";

import { startTransition, useState } from "react";

import { AdminNav } from "@/components/admin/AdminNav";
import { formatPrice } from "@/lib/catalog";
import type { AdminOrder } from "@/lib/order-data";

const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "⏳ In attesa" },
  { value: "PAID", label: "💳 Pagato" },
  { value: "FULFILLED", label: "📦 Spedito / Completato" },
  { value: "CANCELLED", label: "✕ Annullato" },
  { value: "REFUNDED", label: "↩ Rimborsato" },
] as const;

export function AdminOrdersManager({
  initialOrders,
  databaseEnabled,
  usingFallbackData,
}: {
  initialOrders: AdminOrder[];
  databaseEnabled: boolean;
  usingFallbackData: boolean;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (!normalizedSearch) return true;
    return [
      order.orderNumber,
      order.customerEmail,
      order.customerName,
      ...order.items.map((i) => i.productName),
    ].some((v) => v.toLowerCase().includes(normalizedSearch));
  });

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore aggiornamento ordine.");
      const updated = data.order as AdminOrder;
      startTransition(() => {
        setOrders((curr) => curr.map((o) => (o.id === updated.id ? updated : o)));
      });
      setFeedback(`Ordine ${updated.orderNumber} aggiornato a "${statusLabel(updated.status)}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminNav />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff5252]">
              Gestione Vendite
            </p>
            <h1 className="mt-1 font-display text-4xl tracking-wider text-white md:text-5xl">
              Ordini Clienti
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Consulta gli ordini ricevuti tramite Stripe Checkout e aggiorna lo stato di spedizione.
            </p>
          </div>
        </div>

        {(!databaseEnabled || usingFallbackData) && (
          <section className="border border-amber-400/25 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
            {!databaseEnabled
              ? "DATABASE_URL non configurato: gli ordini richiedono il database attivo."
              : "Il database non è raggiungibile al momento: impossibile caricare gli ordini."}
          </section>
        )}

        {feedback && (
          <div className="flex items-center justify-between border border-emerald-400/35 bg-emerald-500/15 px-5 py-3.5 text-sm text-emerald-100">
            <span>✅ {feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="cursor-pointer text-xs uppercase text-white/60 hover:text-white"
            >
              Chiudi ✕
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between border border-red-400/35 bg-red-500/15 px-5 py-3.5 text-sm text-red-100">
            <span>⚠️ {error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="cursor-pointer text-xs uppercase text-white/60 hover:text-white"
            >
              Chiudi ✕
            </button>
          </div>
        )}

        {/* Filtri Ordini */}
        <section className="flex flex-col gap-4 border border-white/10 bg-[#111] p-5 lg:flex-row lg:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cerca per numero ordine, nome/email cliente o articolo…"
            className="input-admin flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-admin lg:w-64"
          >
            <option value="all">Tutti gli stati ({orders.length})</option>
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </section>

        {/* Tabella Ordini */}
        <section className="overflow-hidden border border-white/10 bg-[#111]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/4">
                  <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Ordine & Data
                  </th>
                  <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Cliente
                  </th>
                  <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Articoli Acquistati
                  </th>
                  <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Totale
                  </th>
                  <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Stato Ordine
                  </th>
                  <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Riferimenti Stripe
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/6 align-top hover:bg-white/3">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-white/40">
                        {new Intl.DateTimeFormat("it-IT", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(order.createdAt))}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{order.customerName || "Cliente Stripe"}</p>
                      <a
                        href={`mailto:${order.customerEmail}`}
                        className="mt-0.5 block text-xs text-white/50 underline hover:text-white"
                      >
                        {order.customerEmail}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <ul className="space-y-1.5 text-white/75">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            <strong className="text-white">{item.quantity}×</strong> {item.productName}
                            {item.sizeLabel ? (
                              <span className="ml-1.5 border border-white/15 bg-white/5 px-1.5 py-0.5 text-xs text-white/60">
                                Taglia: {item.sizeLabel}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-4 font-bold text-white">{formatPrice(order.totalCents)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-block w-fit border px-2.5 py-1 text-xs font-bold uppercase ${statusBadgeClass(
                            order.status,
                          )}`}
                        >
                          {statusLabel(order.status)}
                        </span>
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="input-admin py-1.5 text-xs"
                        >
                          {ORDER_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-white/45">
                      {order.stripeCheckoutId ? (
                        <p className="max-w-48 truncate" title={order.stripeCheckoutId}>
                          Session: {order.stripeCheckoutId}
                        </p>
                      ) : null}
                      {order.stripePaymentIntentId ? (
                        <p className="mt-1 max-w-48 truncate" title={order.stripePaymentIntentId}>
                          Payment: {order.stripePaymentIntentId}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-white/40">
                      {orders.length === 0
                        ? "Nessun ordine registrato finora. Gli ordini pagati su Stripe compariranno automaticamente qui."
                        : "Nessun ordine corrisponde ai filtri di ricerca."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "PAID":
      return "Pagato";
    case "FULFILLED":
      return "Spedito";
    case "PENDING":
      return "In attesa";
    case "CANCELLED":
      return "Annullato";
    case "REFUNDED":
      return "Rimborsato";
    default:
      return status;
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "PAID":
      return "border-emerald-400/35 bg-emerald-400/10 text-emerald-300";
    case "FULFILLED":
      return "border-blue-400/35 bg-blue-400/10 text-blue-300";
    case "PENDING":
      return "border-amber-400/35 bg-amber-400/10 text-amber-300";
    case "CANCELLED":
    case "REFUNDED":
      return "border-red-400/35 bg-red-400/10 text-red-300";
    default:
      return "border-white/15 bg-white/5 text-white/60";
  }
}

