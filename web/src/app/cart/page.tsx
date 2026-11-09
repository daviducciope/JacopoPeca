"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "@/components/StoreImage";
import { useCart } from "@/lib/cart";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default function CartPage() {
  const { items, totalItems, totalCents, removeItem, updateQty, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [marketingOpt, setMarketingOpt] = useState(false);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("IT");
  const [honeypot, setHoneypot] = useState("");
  const [shipping, setShipping] = useState<{ enabled: boolean; italyStandardCents: number; europeCents: number; freeThresholdCents: number } | null>(null);
  useEffect(() => { fetch("/api/shipping").then(r => r.ok ? r.json() : null).then(setShipping).catch(() => {}); }, []);
  const shippingCents = shipping ? !shipping.enabled ? 0 : country !== "IT" ? shipping.europeCents : shipping.freeThresholdCents > 0 && totalCents >= shipping.freeThresholdCents ? 0 : shipping.italyStandardCents : null;

  async function tryServerCheckout() {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        marketingOpt,
        ...(email.trim() ? { email: email.trim() } : {}),
        country,
        website: honeypot,
        items: items.map((item) => ({
          slug: item.slug,
          qty: item.qty,
          size: item.size,
        })),
      }),
    });

    let payload: { error?: string; url?: string } | null = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(payload?.error ?? "Errore checkout");
    }

    if (!payload?.url) {
      throw new Error("Checkout temporaneamente non disponibile. Il carrello è conservato.");
    }

    window.location.href = payload.url;
    return true;
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      await tryServerCheckout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/30">Carrello</p>
            <h1 className="mt-2 font-display text-5xl text-white md:text-7xl">
              {totalItems === 0 ? "Carrello vuoto" : `${totalItems} articol${totalItems === 1 ? "o" : "i"}`}
            </h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-400 underline-offset-4 hover:underline"
            >
              Svuota carrello
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-6 border border-white/8 bg-[#111] p-12">
            <p className="text-base text-white/40">Nessun prodotto nel carrello.</p>
            <Link
              href="/shop"
              className="border-2 border-white bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white"
            >
              Vai allo shop
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Items list */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size ?? ""}`}
                  className="flex gap-5 border border-white/8 bg-[#111] p-4"
                >
                  <Link href={`/product/${item.slug}`} className="shrink-0">
                    <div className="relative h-28 w-24 overflow-hidden border border-white/8 bg-[#1a1a1a]">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-display text-xl text-white hover:underline"
                      >
                        {item.name}
                      </Link>
                      {item.size && (
                        <p className="mt-1 text-sm text-white/30">Taglia: {item.size}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 border border-white/10 bg-white/5 px-1">
                        <button
                          aria-label={`Riduci quantità di ${item.name}`}
                          onClick={() => updateQty(item.productId, item.size, item.qty - 1)}
                          className="px-2.5 py-1.5 text-lg font-medium text-white/60 hover:text-white"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-semibold text-white">
                          {item.qty}
                        </span>
                        <button
                          aria-label={`Aumenta quantità di ${item.name}`}
                          disabled={item.qty >= 20}
                          onClick={() => updateQty(item.productId, item.size, item.qty + 1)}
                          className="px-2.5 py-1.5 text-lg font-medium text-white/60 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold text-white">
                          {formatPrice(item.priceCents * item.qty)}
                        </p>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="h-fit space-y-6 border border-white/8 bg-[#111] p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-white/30">Riepilogo ordine</p>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-white/50">
                  <span>Subtotale</span>
                  <span>{formatPrice(totalCents)}</span>
                </div>
                <div className="flex justify-between text-sm text-white/50">
                  <span>Spedizione</span>
                  <span>{shippingCents === null ? "Calcolata al checkout" : shippingCents === 0 ? "Gratuita" : formatPrice(shippingCents)}</span>
                </div>
                <div className="border-t border-white/8 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-white">Totale</span>
                    <span className="text-lg font-semibold text-white">{formatPrice(totalCents + (shippingCents ?? 0))}</span>
                  </div>
                </div>
              </div>

              <label className="block text-sm text-white/80">Paese di spedizione
                <select value={country} onChange={event => setCountry(event.target.value)} className="mt-2 w-full border border-white/30 bg-[#111] p-3">
                  {[["IT", "Italia"], ["DE", "Germania"], ["FR", "Francia"], ["ES", "Spagna"], ["AT", "Austria"], ["NL", "Paesi Bassi"], ["BE", "Belgio"]].filter(([code]) => code === "IT" || (shipping && shipping.europeCents > 0)).map(([code, name]) => <option value={code} key={code}>{name}</option>)}
                </select>
              </label>
              <label className="block text-sm text-white/80">Email (facoltativa, la confermerai al pagamento)<input type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="nome@esempio.it" className="mt-2 w-full border border-white/30 bg-transparent p-3" /></label>
              <input name="website" value={honeypot} onChange={event => setHoneypot(event.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <label className="flex items-start gap-3 text-sm text-white/80"><input type="checkbox" checked={marketingOpt} onChange={event => setMarketingOpt(event.target.checked)} className="mt-1" /><span>Iscriviti alla newsletter: nuove uscite e selezioni dal laboratorio. Facoltativo; confermerai via email. <Link href="/privacy-policy" className="underline">Privacy</Link></span></label>
              <p className="text-xs leading-relaxed text-white/70">
                Prezzi IVA inclusa; disponibilità verificata al checkout con pagamento sicuro Stripe. Procedendo dichiari di aver letto i{" "}
                <Link href="/termini-e-condizioni" className="text-white underline underline-offset-4 hover:text-red-400">
                  Termini e Condizioni di Vendita
                </Link>{" "}
                (incluso il diritto di recesso di 14 giorni per i capi standard) e la{" "}
                <Link href="/privacy-policy" className="text-white underline underline-offset-4 hover:text-red-400">
                  Privacy Policy
                </Link>
                .
              </p>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full border-2 border-white bg-white py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Reindirizzamento…" : "Procedi al checkout"}
              </button>

              {error && (
                <p role="alert" className="text-center text-sm text-red-400">{error}</p>
              )}

              <Link
                href="/shop"
                className="block text-center text-sm text-white/40 underline-offset-4 hover:text-white hover:underline"
              >
                Continua gli acquisti
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
