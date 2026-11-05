"use client";

import { Fragment, startTransition, useState } from "react";

import { AdminNav } from "@/components/admin/AdminNav";
import { formatPrice } from "@/lib/catalog";
import type { AdminOrder, OrderAddress, ShippingSettings } from "@/lib/order-data";
import type { AppProduct } from "@/lib/product-data";

const ORDER_STATUS_OPTIONS = [
  { value: "PAID", label: "💳 Pagato (Da spedire)" },
  { value: "FULFILLED", label: "📦 Spedito / Completato" },
  { value: "PENDING", label: "⏳ In attesa di pagamento" },
  { value: "CANCELLED", label: "✕ Annullato" },
  { value: "REFUNDED", label: "↩ Rimborsato" },
] as const;

const CARRIER_PRESETS = [
  "SDA / Poste Italiane",
  "BRT Bartolini",
  "GLS",
  "DHL Express",
  "UPS",
  "Consegna a mano in Store",
];

export function AdminOrdersManager({
  initialOrders,
  initialShippingSettings,
  products,
  databaseEnabled,
  usingFallbackData,
}: {
  initialOrders: AdminOrder[];
  initialShippingSettings: ShippingSettings;
  products: AppProduct[];
  databaseEnabled: boolean;
  usingFallbackData: boolean;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Drawer Gestione Spedizione singolo ordine
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [carrierInput, setCarrierInput] = useState("SDA / Poste Italiane");
  const [trackingCodeInput, setTrackingCodeInput] = useState("");
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrCountry, setAddrCountry] = useState("IT");
  const [sendEmailToggle, setSendEmailToggle] = useState(true);

  // Pannello Impostazioni Tariffe Spedizione
  const [showShippingSettings, setShowShippingSettings] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(initialShippingSettings);
  const [italyEur, setItalyEur] = useState((initialShippingSettings.italyStandardCents / 100).toFixed(2));
  const [freeThresholdEur, setFreeThresholdEur] = useState(
    (initialShippingSettings.freeThresholdCents / 100).toFixed(2),
  );
  const [europeEur, setEuropeEur] = useState((initialShippingSettings.europeCents / 100).toFixed(2));
  const [shippingEnabled, setShippingEnabled] = useState(initialShippingSettings.enabled);
  const [isSavingShipping, setIsSavingShipping] = useState(false);

  // Pannello Registra Vendita Diretta (Store / Instagram / WhatsApp)
  const [showManualSale, setShowManualSale] = useState(false);
  const activeProducts = products.filter((p) => p.status !== "ARCHIVED");
  const [saleProductId, setSaleProductId] = useState(activeProducts[0]?.id ?? "");
  const selectedSaleProduct = activeProducts.find((p) => p.id === saleProductId) ?? activeProducts[0];
  const [saleVariantId, setSaleVariantId] = useState(selectedSaleProduct?.sizes[0]?.id ?? "");
  const [saleChannel, setSaleChannel] = useState<"STORE" | "INSTAGRAM" | "WHATSAPP">("INSTAGRAM");
  const [salePriceEur, setSalePriceEur] = useState(
    selectedSaleProduct ? (selectedSaleProduct.priceCents / 100).toFixed(2) : "",
  );
  const [saleQty, setSaleQty] = useState("1");
  const [saleCustomerName, setSaleCustomerName] = useState("");
  const [saleCustomerPhone, setSaleCustomerPhone] = useState("");
  const [saleCustomerEmail, setSaleCustomerEmail] = useState("");
  const [saleAddressLine, setSaleAddressLine] = useState("");
  const [saleCity, setSaleCity] = useState("");
  const [saleZip, setSaleZip] = useState("");
  const [saleNotes, setSaleNotes] = useState("");
  const [isCreatingSale, setIsCreatingSale] = useState(false);

  // Modal di Stampa Etichetta / Distinta Pacco
  const [printOrder, setPrintOrder] = useState<AdminOrder | null>(null);

  const normalizedSearch = search.trim().toLowerCase();
  const canWrite = databaseEnabled && !usingFallbackData;

  const counts = {
    all: orders.length,
    to_ship: orders.filter((o) => o.status === "PAID").length,
    fulfilled: orders.filter((o) => o.status === "FULFILLED").length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED" || o.status === "REFUNDED").length,
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "to_ship" && order.status !== "PAID") return false;
    if (statusFilter === "fulfilled" && order.status !== "FULFILLED") return false;
    if (statusFilter === "pending" && order.status !== "PENDING") return false;
    if (
      statusFilter === "cancelled" &&
      order.status !== "CANCELLED" &&
      order.status !== "REFUNDED"
    ) {
      return false;
    }
    if (!normalizedSearch) return true;
    return [
      order.orderNumber,
      order.customerEmail,
      order.customerName,
      order.customerPhone ?? "",
      order.trackingCode ?? "",
      order.address?.city ?? "",
      ...order.items.map((i) => i.productName),
    ].some((v) => v.toLowerCase().includes(normalizedSearch));
  });

  function openShippingDrawer(order: AdminOrder) {
    if (shippingOrderId === order.id) {
      setShippingOrderId(null);
      return;
    }
    setShippingOrderId(order.id);
    setCarrierInput(order.carrier || "SDA / Poste Italiane");
    setTrackingCodeInput(order.trackingCode || "");
    setAdminNotesInput(order.adminNotes || "");
    setPhoneInput(order.customerPhone || "");
    setAddrLine1(order.address?.line1 || "");
    setAddrCity(order.address?.city || "");
    setAddrZip(order.address?.postal_code || "");
    setAddrState(order.address?.state || "");
    setAddrCountry(order.address?.country || "IT");
    setSendEmailToggle(Boolean(order.customerEmail && !order.customerEmail.endsWith(".local")));
  }

  async function handleSaveShippingAndTracking(markAsShipped: boolean) {
    if (!shippingOrderId) return;
    setUpdatingId(shippingOrderId);
    setError(null);
    setFeedback(null);

    try {
      const targetOrder = orders.find((o) => o.id === shippingOrderId);
      const nextAddress: OrderAddress | null =
        addrLine1.trim() || addrCity.trim()
          ? {
              name: targetOrder?.customerName || null,
              line1: addrLine1.trim() || null,
              city: addrCity.trim() || null,
              postal_code: addrZip.trim() || null,
              state: addrState.trim() || null,
              country: addrCountry.trim() || "IT",
            }
          : targetOrder?.address ?? null;

      const res = await fetch(`/api/admin/orders/${shippingOrderId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(markAsShipped ? { status: "FULFILLED" } : {}),
          carrier: carrierInput.trim() || null,
          trackingCode: trackingCodeInput.trim() || null,
          adminNotes: adminNotesInput.trim() || null,
          customerPhone: phoneInput.trim() || null,
          address: nextAddress,
          sendTrackingEmail: markAsShipped && sendEmailToggle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore salvataggio spedizione.");
      const updated = data.order as AdminOrder;
      startTransition(() => {
        setOrders((curr) => curr.map((o) => (o.id === updated.id ? updated : o)));
      });
      setShippingOrderId(null);
      setFeedback(
        markAsShipped
          ? `Ordine ${updated.orderNumber} segnato come SPEDITO${
              data.emailSent ? " (Email inviata al cliente)" : data.emailQueued ? " (Email automatica in coda)" : ""
            }!`
          : `Dati di spedizione salvati per ${updated.orderNumber}.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleQuickStatusChange(order: AdminOrder, newStatus: string) {
    let restoreStock = false;
    if (
      (newStatus === "CANCELLED" || newStatus === "REFUNDED") &&
      !order.stockRestored
    ) {
      restoreStock = window.confirm(
        `Vuoi rimettere automaticamente in stock nello shop gli articoli dell'ordine ${order.orderNumber}?`,
      );
    }

    setUpdatingId(order.id);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, restoreStock }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore aggiornamento ordine.");
      const updated = data.order as AdminOrder;
      startTransition(() => {
        setOrders((curr) => curr.map((o) => (o.id === updated.id ? updated : o)));
      });
      setFeedback(
        `Ordine ${updated.orderNumber} aggiornato a "${statusLabel(updated.status)}"${
          restoreStock ? " (Stock ripristinato nello shop)" : ""
        }.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSyncFromStripe() {
    setIsSyncing(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/orders/sync/", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossibile sincronizzare da Stripe.");
      startTransition(() => {
        setOrders(data.orders as AdminOrder[]);
      });
      setFeedback(
        data.imported > 0
          ? `Sincronizzazione completata: ${data.imported} nuovi ordini importati da Stripe!`
          : `Sincronizzazione completata (${data.checked} sessioni verificate): tutti gli ordini Stripe sono già presenti.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sincronizzazione Stripe.");
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleSaveShippingSettings(e: { preventDefault(): void }) {
    e.preventDefault();
    setIsSavingShipping(true);
    setError(null);
    setFeedback(null);

    try {
      const italyStandardCents = Math.round(
        (Number.parseFloat(italyEur.replace(",", ".")) || 0) * 100,
      );
      const freeThresholdCents = Math.round(
        (Number.parseFloat(freeThresholdEur.replace(",", ".")) || 0) * 100,
      );
      const europeCents = Math.round(
        (Number.parseFloat(europeEur.replace(",", ".")) || 0) * 100,
      );

      const res = await fetch("/api/admin/shipping/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          italyStandardCents,
          freeThresholdCents,
          europeCents,
          enabled: shippingEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore salvataggio tariffe.");
      setShippingSettings(data.settings);
      setShowShippingSettings(false);
      setFeedback("Tariffe di spedizione salvate! Saranno applicate subito ai prossimi checkout.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore salvataggio spedizioni.");
    } finally {
      setIsSavingShipping(false);
    }
  }

  async function handleCreateManualSale(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!selectedSaleProduct) return;
    setIsCreatingSale(true);
    setError(null);
    setFeedback(null);

    try {
      const priceCents = Math.round(
        (Number.parseFloat(salePriceEur.replace(",", ".")) || 0) * 100,
      );
      const variantId = saleVariantId || selectedSaleProduct.sizes[0]?.id || "";

      const res = await fetch("/api/admin/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedSaleProduct.id,
          variantId,
          quantity: Math.max(1, Number.parseInt(saleQty || "1", 10) || 1),
          priceCents,
          channel: saleChannel,
          customerName: saleCustomerName.trim() || undefined,
          customerPhone: saleCustomerPhone.trim() || undefined,
          customerEmail: saleCustomerEmail.trim() || undefined,
          adminNotes: saleNotes.trim() || undefined,
          address:
            saleAddressLine.trim() || saleCity.trim()
              ? {
                  name: saleCustomerName.trim() || null,
                  line1: saleAddressLine.trim() || null,
                  city: saleCity.trim() || null,
                  postal_code: saleZip.trim() || null,
                  country: "IT",
                }
              : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossibile registrare la vendita.");

      const createdOrder = data.order as AdminOrder;
      startTransition(() => {
        setOrders((curr) => [createdOrder, ...curr]);
      });
      setShowManualSale(false);
      setSaleCustomerName("");
      setSaleCustomerPhone("");
      setSaleCustomerEmail("");
      setSaleAddressLine("");
      setSaleCity("");
      setSaleZip("");
      setSaleNotes("");
      setFeedback(
        `Vendita registrata (${createdOrder.orderNumber})! Lo stock di "${selectedSaleProduct.name}" è stato aggiornato.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore registrazione vendita.");
    } finally {
      setIsCreatingSale(false);
    }
  }

  function copyAddressToClipboard(order: AdminOrder) {
    const lines = [
      order.customerName || "Cliente",
      order.address?.line1,
      order.address?.line2,
      [order.address?.postal_code, order.address?.city, order.address?.state]
        .filter(Boolean)
        .join(" "),
      order.address?.country,
      order.customerPhone ? `Tel: ${order.customerPhone}` : null,
      order.customerEmail && !order.customerEmail.endsWith(".local")
        ? `Email: ${order.customerEmail}`
        : null,
    ].filter(Boolean);

    void navigator.clipboard.writeText(lines.join("\n"));
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminNav />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-7 px-6 py-8 lg:px-10 print:hidden">
        {/* ── HEADER & PULSANTI OPERATIVI ── */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff5252]">
              Vendite, Corrieri & Tracking
            </p>
            <h1 className="mt-1 font-display text-4xl tracking-wider text-white md:text-5xl">
              Gestione Ordini e Spedizioni
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Prepara i pacchi, inserisci il tracking corriere, registra vendite da Instagram/Store e configura le tariffe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={!canWrite}
              onClick={() => {
                setShowManualSale((v) => !v);
                setShowShippingSettings(false);
              }}
              className="cursor-pointer border-2 border-[#e01010] bg-[#e01010] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b80d0d] disabled:opacity-40"
            >
              ⚡ + Registra Vendita (Store / IG / WA)
            </button>

            <button
              type="button"
              disabled={isSyncing || !canWrite}
              onClick={handleSyncFromStripe}
              className="cursor-pointer border border-white/25 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white/85 disabled:opacity-40"
            >
              {isSyncing ? "Sincronizzazione…" : "🔄 Sincronizza da Stripe"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowShippingSettings((v) => !v);
                setShowManualSale(false);
              }}
              className="cursor-pointer border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white/85 transition hover:bg-white/15"
            >
              🚚 Tariffe Spedizione (
              {shippingSettings.enabled
                ? `€${(shippingSettings.italyStandardCents / 100).toFixed(0)} / Gratis > €${(
                    shippingSettings.freeThresholdCents / 100
                  ).toFixed(0)}`
                : "Off"}
              )
            </button>
          </div>
        </div>

        {/* ── BANNER FEEDBACK / ERRORI ── */}
        {feedback && (
          <div className="flex items-center justify-between border border-emerald-400/40 bg-emerald-500/15 px-5 py-4 text-sm text-emerald-100">
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
          <div className="flex items-center justify-between border border-red-400/40 bg-red-500/15 px-5 py-4 text-sm text-red-100">
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

        {/* ── PANNELLO 1: REGISTRA VENDITA DIRETTA (STORE / INSTAGRAM / WHATSAPP) ── */}
        {showManualSale && (
          <form
            onSubmit={handleCreateManualSale}
            className="border-2 border-[#e01010]/50 bg-[#151515] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="bg-[#e01010] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                  Vendita Diretta & Scarico Magazzino
                </span>
                <h2 className="mt-1.5 text-xl font-bold text-white">
                  Registra Capo Venduto in Laboratorio, Instagram DM o WhatsApp
                </h2>
                <p className="text-xs text-white/50">
                  Scala automaticamente lo stock dallo shop online e aggiunge l&apos;ordine al registro vendite e spedizioni.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualSale(false)}
                className="cursor-pointer border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:text-white"
              >
                ✕ Chiudi
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="block lg:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Prodotto Venduto *
                </span>
                <select
                  value={saleProductId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setSaleProductId(pid);
                    const prod = activeProducts.find((p) => p.id === pid);
                    if (prod) {
                      setSaleVariantId(prod.sizes[0]?.id ?? "");
                      setSalePriceEur((prod.priceCents / 100).toFixed(2));
                    }
                  }}
                  className="input-admin"
                >
                  {activeProducts.map((p) => {
                    const st = p.sizes.reduce((s, v) => s + v.stock, 0);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatPrice(p.priceCents)} ({st} pz disponibili)
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Taglia *
                </span>
                <select
                  value={saleVariantId}
                  onChange={(e) => setSaleVariantId(e.target.value)}
                  className="input-admin"
                >
                  {selectedSaleProduct?.sizes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} (Stock: {s.stock})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Canale di Vendita *
                </span>
                <select
                  value={saleChannel}
                  onChange={(e) =>
                    setSaleChannel(e.target.value as "STORE" | "INSTAGRAM" | "WHATSAPP")
                  }
                  className="input-admin"
                >
                  <option value="INSTAGRAM">📸 Instagram DM</option>
                  <option value="WHATSAPP">💬 WhatsApp</option>
                  <option value="STORE">🏪 Negozio / Laboratorio</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Prezzo Incassato (€) *
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={salePriceEur}
                  onChange={(e) => setSalePriceEur(e.target.value)}
                  className="input-admin font-bold"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Quantità
                </span>
                <input
                  type="number"
                  min="1"
                  value={saleQty}
                  onChange={(e) => setSaleQty(e.target.value)}
                  className="input-admin"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Nome Cliente / @Instagram
                </span>
                <input
                  type="text"
                  value={saleCustomerName}
                  onChange={(e) => setSaleCustomerName(e.target.value)}
                  placeholder="es. Mario Rossi / @mariorossi"
                  className="input-admin"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Telefono Cliente (per corriere/WA)
                </span>
                <input
                  type="tel"
                  value={saleCustomerPhone}
                  onChange={(e) => setSaleCustomerPhone(e.target.value)}
                  placeholder="es. +39 333 1234567"
                  className="input-admin"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Via e Civico Spedizione (se da spedire)
                </span>
                <input
                  type="text"
                  value={saleAddressLine}
                  onChange={(e) => setSaleAddressLine(e.target.value)}
                  placeholder="es. Via Roma 15"
                  className="input-admin"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Città
                </span>
                <input
                  type="text"
                  value={saleCity}
                  onChange={(e) => setSaleCity(e.target.value)}
                  placeholder="es. Milano"
                  className="input-admin"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  CAP
                </span>
                <input
                  type="text"
                  value={saleZip}
                  onChange={(e) => setSaleZip(e.target.value)}
                  placeholder="es. 20121"
                  className="input-admin"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setShowManualSale(false)}
                className="cursor-pointer border border-white/20 px-4 py-2.5 text-xs font-bold uppercase text-white/70"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isCreatingSale}
                className="cursor-pointer bg-[#e01010] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b80d0d]"
              >
                {isCreatingSale ? "Registrazione…" : "✓ Registra Vendita e Scala Stock"}
              </button>
            </div>
          </form>
        )}

        {/* ── PANNELLO 2: IMPOSTAZIONI TARIFFE SPEDIZIONE CHECKOUT ── */}
        {showShippingSettings && (
          <form
            onSubmit={handleSaveShippingSettings}
            className="border border-white/20 bg-[#151515] p-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  🚚 Configurazione Tariffe di Spedizione al Checkout
                </h2>
                <p className="text-xs text-white/50">
                  Queste tariffe vengono applicate automaticamente quando il cliente paga con Stripe sul sito.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShippingSettings(false)}
                className="cursor-pointer border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:text-white"
              >
                ✕ Chiudi
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Spedizione Standard Italia (€)
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={italyEur}
                  onChange={(e) => setItalyEur(e.target.value)}
                  className="input-admin font-bold"
                  placeholder="7.00"
                />
                <span className="mt-1 block text-[11px] text-white/40">
                  Applicata agli ordini sotto la soglia gratuita
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Soglia Spedizione Gratuita (€)
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={freeThresholdEur}
                  onChange={(e) => setFreeThresholdEur(e.target.value)}
                  className="input-admin font-bold"
                  placeholder="100.00"
                />
                <span className="mt-1 block text-[11px] text-white/40">
                  Sopra questo importo la spedizione Italia diventa €0
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">
                  Spedizione Europa UE (€)
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={europeEur}
                  onChange={(e) => setEuropeEur(e.target.value)}
                  className="input-admin font-bold"
                  placeholder="15.00"
                />
                <span className="mt-1 block text-[11px] text-white/40">
                  Opzione per ordini da Germania, Francia, Spagna, ecc.
                </span>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={shippingEnabled}
                  onChange={(e) => setShippingEnabled(e.target.checked)}
                  className="h-4 w-4 accent-[#e01010]"
                />
                Abilita calcolo spese di spedizione nel Checkout Stripe
              </label>

              <button
                type="submit"
                disabled={isSavingShipping}
                className="cursor-pointer bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-white/90"
              >
                {isSavingShipping ? "Salvataggio…" : "💾 Salva Tariffe Spedizione"}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB STATO E RICERCA ORDINI ── */}
        <section className="flex flex-col gap-4 border border-white/10 bg-[#111] p-5">
          <div className="flex flex-wrap gap-2">
            <FilterTab
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              label="Tutti gli ordini"
              count={counts.all}
            />
            <FilterTab
              active={statusFilter === "to_ship"}
              onClick={() => setStatusFilter("to_ship")}
              label="💳 Da Spedire (Pagati)"
              count={counts.to_ship}
            />
            <FilterTab
              active={statusFilter === "fulfilled"}
              onClick={() => setStatusFilter("fulfilled")}
              label="📦 Spediti / Completati"
              count={counts.fulfilled}
            />
            <FilterTab
              active={statusFilter === "pending"}
              onClick={() => setStatusFilter("pending")}
              label="⏳ In attesa"
              count={counts.pending}
            />
            <FilterTab
              active={statusFilter === "cancelled"}
              onClick={() => setStatusFilter("cancelled")}
              label="✕ Annullati / Rimborsati"
              count={counts.cancelled}
            />
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cerca per numero ordine, nome, email, telefono, città, tracking o capo acquistato…"
            className="input-admin w-full"
          />
        </section>

        {/* ── TABELLA ORDINI E SPEDIZIONI ── */}
        <section className="overflow-hidden border border-white/10 bg-[#111]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/4">
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-[0.16em] text-white/40">
                    Ordine & Canale
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-[0.16em] text-white/40">
                    Cliente & Contatti
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-[0.16em] text-white/40">
                    Indirizzo di Spedizione
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-[0.16em] text-white/40">
                    Articoli & Totale
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-[0.16em] text-white/40">
                    Stato & Tracking
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs uppercase tracking-[0.16em] text-white/40">
                    Azioni Spedizione
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isDrawerOpen = shippingOrderId === order.id;
                  const hasAddress = Boolean(order.address?.line1 || order.address?.city);
                  const cleanPhone = order.customerPhone?.replace(/[^0-9+]/g, "") || "";
                  const whatsappText = encodeURIComponent(
                    `Ciao ${order.customerName || ""}! Ti scriviamo da Jacopo Peca per il tuo ordine ${
                      order.orderNumber
                    }.${
                      order.trackingCode
                        ? ` Il tuo pacco è stato spedito con ${
                            order.carrier || "corriere"
                          }, codice tracking: ${order.trackingCode}${
                            order.trackingUrl ? ` (${order.trackingUrl})` : ""
                          }`
                        : ""
                    }`,
                  );

                  return (
                    <Fragment key={order.id}>
                      <tr className="border-b border-white/6 align-top transition hover:bg-white/3">
                        {/* Ordine & Canale */}
                        <td className="px-4 py-4">
                          <p className="font-bold text-white">{order.orderNumber}</p>
                          <p className="mt-0.5 text-xs text-white/40">
                            {new Intl.DateTimeFormat("it-IT", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(order.createdAt))}
                          </p>
                          <span className="mt-2 inline-block border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/75">
                            {channelLabel(order.channel)}
                          </span>
                        </td>

                        {/* Cliente & Contatti */}
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">
                            {order.customerName || "Cliente"}
                          </p>
                          {!order.customerEmail.endsWith(".local") && (
                            <a
                              href={`mailto:${order.customerEmail}`}
                              className="mt-0.5 block text-xs text-white/55 underline hover:text-white"
                            >
                              {order.customerEmail}
                            </a>
                          )}
                          {order.customerPhone ? (
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <span className="text-xs font-medium text-white/80">
                                📞 {order.customerPhone}
                              </span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone.replace(/^\+/, "")}?text=${whatsappText}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300 hover:bg-emerald-500/25"
                                >
                                  💬 WhatsApp
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-white/30">Nessun telefono</p>
                          )}
                        </td>

                        {/* Indirizzo di Spedizione */}
                        <td className="px-4 py-4">
                          {hasAddress ? (
                            <div className="text-xs leading-5 text-white/80">
                              <p className="font-medium text-white">{order.address?.line1}</p>
                              {order.address?.line2 && <p>{order.address.line2}</p>}
                              <p>
                                {[
                                  order.address?.postal_code,
                                  order.address?.city,
                                  order.address?.state ? `(${order.address.state})` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}{" "}
                                {order.address?.country ? `— ${order.address.country}` : ""}
                              </p>
                              <button
                                type="button"
                                onClick={() => copyAddressToClipboard(order)}
                                className="mt-1.5 cursor-pointer border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:bg-white/15 hover:text-white"
                              >
                                {copiedId === order.id ? "✓ Copiato!" : "📋 Copia Indirizzo"}
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-white/35">
                              <p>Non specificato / Ritiro in sede</p>
                              <button
                                type="button"
                                onClick={() => openShippingDrawer(order)}
                                className="mt-1 cursor-pointer text-[11px] text-white/60 underline hover:text-white"
                              >
                                + Aggiungi indirizzo
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Articoli & Totale */}
                        <td className="px-4 py-4">
                          <ul className="space-y-1 text-xs text-white/85">
                            {order.items.map((item) => (
                              <li key={item.id}>
                                <strong className="text-white">{item.quantity}×</strong>{" "}
                                {item.productName}
                                {item.sizeLabel ? (
                                  <span className="ml-1 border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/65">
                                    {item.sizeLabel}
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 border-t border-white/8 pt-1.5">
                            <p className="text-sm font-bold text-white">
                              Totale: {formatPrice(order.totalCents)}
                            </p>
                            {order.shippingCents > 0 && (
                              <p className="text-[11px] text-white/45">
                                (di cui {formatPrice(order.shippingCents)} spedizione)
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Stato & Tracking */}
                        <td className="px-4 py-4">
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
                              onChange={(e) => handleQuickStatusChange(order, e.target.value)}
                              className="input-admin py-1.5 text-xs"
                            >
                              {ORDER_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            {order.trackingCode && (
                              <div className="mt-1 border border-blue-400/25 bg-blue-500/10 p-2 text-xs text-blue-200">
                                <p className="font-bold">{order.carrier || "Corriere"}</p>
                                <p className="font-mono text-[11px]">{order.trackingCode}</p>
                                {order.trackingUrl && (
                                  <a
                                    href={order.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 inline-block text-[11px] font-bold underline hover:text-white"
                                  >
                                    Traccia pacco ↗
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Azioni Spedizione */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={() => openShippingDrawer(order)}
                              className={`cursor-pointer border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                                isDrawerOpen
                                  ? "border-blue-400 bg-blue-500/20 text-blue-200"
                                  : "border-white/25 bg-white text-black hover:bg-white/85"
                              }`}
                            >
                              🚚 {order.trackingCode ? "Modifica Spedizione" : "Spedisci / Tracking"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setPrintOrder(order)}
                              className="cursor-pointer border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/15 hover:text-white"
                            >
                              🖨️ Stampa Foglio Pacco
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Drawer Gestione Spedizione, Corriere, Tracking e Indirizzo */}
                      {isDrawerOpen && (
                        <tr className="border-b border-blue-400/30 bg-blue-950/15">
                          <td colSpan={6} className="p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                              <h3 className="text-base font-bold text-white">
                                🚚 Gestione Spedizione & Tracking — Ordine {order.orderNumber}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setShippingOrderId(null)}
                                className="cursor-pointer text-xs text-white/60 hover:text-white"
                              >
                                Chiudi ✕
                              </button>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase text-white/55">
                                  Corriere
                                </span>
                                <input
                                  list="carrier-presets"
                                  value={carrierInput}
                                  onChange={(e) => setCarrierInput(e.target.value)}
                                  placeholder="es. SDA / Poste, BRT, GLS, DHL"
                                  className="input-admin"
                                />
                                <datalist id="carrier-presets">
                                  {CARRIER_PRESETS.map((c) => (
                                    <option key={c} value={c} />
                                  ))}
                                </datalist>
                              </label>

                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase text-white/55">
                                  Codice Tracking (Lettera di Vettura)
                                </span>
                                <input
                                  type="text"
                                  value={trackingCodeInput}
                                  onChange={(e) => setTrackingCodeInput(e.target.value)}
                                  placeholder="es. 1Z999AA10123456784"
                                  className="input-admin font-mono"
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase text-white/55">
                                  Telefono Destinatario
                                </span>
                                <input
                                  type="tel"
                                  value={phoneInput}
                                  onChange={(e) => setPhoneInput(e.target.value)}
                                  placeholder="+39 333 ..."
                                  className="input-admin"
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase text-white/55">
                                  Note Ordine / Consegna
                                </span>
                                <input
                                  type="text"
                                  value={adminNotesInput}
                                  onChange={(e) => setAdminNotesInput(e.target.value)}
                                  placeholder="Citofono, note interne..."
                                  className="input-admin"
                                />
                              </label>

                              <label className="block lg:col-span-2">
                                <span className="mb-1 block text-xs font-semibold uppercase text-white/55">
                                  Indirizzo (Via e Civico)
                                </span>
                                <input
                                  type="text"
                                  value={addrLine1}
                                  onChange={(e) => setAddrLine1(e.target.value)}
                                  placeholder="Via e numero civico"
                                  className="input-admin"
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase text-white/55">
                                  Città e Provincia
                                </span>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={addrCity}
                                    onChange={(e) => setAddrCity(e.target.value)}
                                    placeholder="Città"
                                    className="input-admin flex-1"
                                  />
                                  <input
                                    type="text"
                                    value={addrState}
                                    onChange={(e) => setAddrState(e.target.value)}
                                    placeholder="Prov"
                                    className="input-admin w-20"
                                  />
                                </div>
                              </label>

                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase text-white/55">
                                  CAP e Nazione
                                </span>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={addrZip}
                                    onChange={(e) => setAddrZip(e.target.value)}
                                    placeholder="CAP"
                                    className="input-admin flex-1"
                                  />
                                  <input
                                    type="text"
                                    value={addrCountry}
                                    onChange={(e) => setAddrCountry(e.target.value)}
                                    placeholder="IT"
                                    className="input-admin w-16 uppercase"
                                  />
                                </div>
                              </label>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                              <label className="flex cursor-pointer items-center gap-2.5 text-xs text-white/80">
                                <input
                                  type="checkbox"
                                  checked={sendEmailToggle}
                                  onChange={(e) => setSendEmailToggle(e.target.checked)}
                                  className="h-4 w-4 accent-[#e01010]"
                                />
                                ✉️ Invia email automatica di conferma spedizione e tracking al cliente (
                                {order.customerEmail})
                              </label>

                              <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                  type="button"
                                  disabled={updatingId === order.id}
                                  onClick={() => handleSaveShippingAndTracking(false)}
                                  className="cursor-pointer border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20"
                                >
                                  Salva Solo Dati
                                </button>
                                <button
                                  type="button"
                                  disabled={updatingId === order.id}
                                  onClick={() => handleSaveShippingAndTracking(true)}
                                  className="cursor-pointer bg-emerald-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-emerald-400"
                                >
                                  {updatingId === order.id
                                    ? "Salvataggio…"
                                    : "📦 Salva Tracking e Segna come SPEDITO"}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-white/40">
                      {orders.length === 0
                        ? "Nessun ordine registrato finora. Puoi cliccare 'Sincronizza da Stripe' o '+ Registra Vendita'."
                        : "Nessun ordine corrisponde ai filtri selezionati."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ── MODALE / FOGLIO DI STAMPA PACCO & ETICHETTA DESTINATARIO ── */}
      {printOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 print:static print:bg-white print:p-0">
          <div className="w-full max-w-2xl border border-white/20 bg-white p-8 text-black shadow-2xl print:max-w-none print:border-0 print:shadow-none">
            <div className="mb-6 flex items-center justify-between border-b border-black/15 pb-4 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-black/60">
                Anteprima Foglio Spedizione / Etichetta Pacco
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="cursor-pointer bg-[#e01010] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white"
                >
                  🖨️ Stampa Ora
                </button>
                <button
                  type="button"
                  onClick={() => setPrintOrder(null)}
                  className="cursor-pointer border border-black/20 px-4 py-2 text-xs font-bold uppercase text-black"
                >
                  Chiudi ✕
                </button>
              </div>
            </div>

            {/* Intestazione Mittente */}
            <div className="flex items-start justify-between border-b-2 border-black pb-5">
              <div>
                <h2 className="text-3xl font-black tracking-widest uppercase">JACOPO PECA</h2>
                <p className="text-xs text-black/70">
                  Handcrafted Denim Streetwear — Montesilvano (PE), Italia
                </p>
                <p className="text-xs text-black/70">www.jacopopeca.com</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase text-black/60">Riferimento Ordine</p>
                <p className="text-lg font-black">{printOrder.orderNumber}</p>
                <p className="text-xs text-black/70">
                  {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(
                    new Date(printOrder.createdAt),
                  )}
                </p>
              </div>
            </div>

            {/* Riquadro Destinatario Grande (Etichetta Corriere) */}
            <div className="mt-6 border-2 border-black p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-black/60">
                DESTINATARIO SPEDIZIONE:
              </p>
              <p className="mt-2 text-2xl font-black uppercase">
                {printOrder.customerName || "Cliente"}
              </p>
              {printOrder.address?.line1 ? (
                <div className="mt-1 text-lg leading-snug font-medium">
                  <p>{printOrder.address.line1}</p>
                  {printOrder.address.line2 && <p>{printOrder.address.line2}</p>}
                  <p className="mt-1 font-bold">
                    {[
                      printOrder.address.postal_code,
                      printOrder.address.city,
                      printOrder.address.state ? `(${printOrder.address.state})` : null,
                    ]
                      .filter(Boolean)
                      .join(" ")}{" "}
                    — {printOrder.address.country || "IT"}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm italic text-black/60">
                  Indirizzo non specificato (Ritiro in sede)
                </p>
              )}
              {printOrder.customerPhone && (
                <p className="mt-3 text-base font-bold">TEL: {printOrder.customerPhone}</p>
              )}
            </div>

            {/* Tabella Articoli nel Pacco */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-black/60">
                RIEPILOGO ARTICOLI NEL PACCO:
              </p>
              <table className="mt-2 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-black text-left text-xs uppercase">
                    <th className="py-2">Qtà</th>
                    <th className="py-2">Articolo</th>
                    <th className="py-2">Taglia</th>
                    <th className="py-2 text-right">Importo</th>
                  </tr>
                </thead>
                <tbody>
                  {printOrder.items.map((item) => (
                    <tr key={item.id} className="border-b border-black/15">
                      <td className="py-2.5 font-bold">{item.quantity}×</td>
                      <td className="py-2.5 font-semibold">{item.productName}</td>
                      <td className="py-2.5">{item.sizeLabel || "UNI"}</td>
                      <td className="py-2.5 text-right">
                        {formatPrice(item.unitPriceCents * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <p className="text-base font-black">
                  TOTALE ORDINE: {formatPrice(printOrder.totalCents)}
                </p>
              </div>
            </div>

            {printOrder.trackingCode && (
              <div className="mt-6 border-t border-black/20 pt-4 text-xs">
                <strong>Corriere:</strong> {printOrder.carrier || "Espresso"} —{" "}
                <strong>Tracking:</strong> {printOrder.trackingCode}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${
        active
          ? "border-white bg-white text-black"
          : "border-white/12 bg-white/4 text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label} <span className="ml-1 opacity-70">({count})</span>
    </button>
  );
}

function channelLabel(channel: string) {
  switch (channel) {
    case "INSTAGRAM":
      return "📸 Instagram DM";
    case "WHATSAPP":
      return "💬 WhatsApp";
    case "STORE":
      return "🏪 Negozio Fisico";
    default:
      return "💳 Sito Web (Stripe)";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "PAID":
      return "Pagato (Da spedire)";
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
