"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

function CheckoutSuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [confirmed, setConfirmed] = useState(false);
  const [checking, setChecking] = useState(Boolean(sessionId));

  useEffect(() => {
    if (!sessionId) return;
    fetch("/api/checkout/confirm/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.confirmed && data?.orderNumber) {
          setConfirmed(true);
          clearCart();
          setOrderNumber(data.orderNumber);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [sessionId, clearCart]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20">
      <div className="flex h-20 w-20 items-center justify-center border-2 border-emerald-400 bg-emerald-400/10">
        <span className="text-4xl text-emerald-400">{confirmed ? "✓" : "…"}</span>
      </div>
      <div className="text-center">
        <h1 className="font-display text-5xl text-white md:text-6xl">{checking ? "Verifica pagamento…" : confirmed ? "Ordine confermato!" : "Pagamento da verificare"}</h1>
        {orderNumber && (
          <p className="mt-3 inline-block border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-bold tracking-wider text-emerald-300">
            Riferimento Ordine: {orderNumber}
          </p>
        )}
        <p className="mt-4 max-w-md text-lg text-white/50">
          {confirmed ? "Grazie per il tuo acquisto. Riceverai i dettagli dell’ordine via email e il tracking alla spedizione." : "Il carrello è conservato finché il pagamento non risulta confermato. Se hai già pagato, attendi qualche istante e aggiorna questa pagina oppure contattaci."}
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/shop"
          className="border-2 border-white bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white"
        >
          Torna allo shop
        </Link>
        <Link
          href="/"
          className="border-2 border-white/20 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white hover:text-black"
        >
          Homepage
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center py-20 text-white/50">
          Conferma ordine in corso…
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
