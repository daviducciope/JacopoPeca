"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useEffect } from "react";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20">
      <div className="flex h-20 w-20 items-center justify-center border-2 border-emerald-400 bg-emerald-400/10">
        <span className="text-4xl text-emerald-400">✓</span>
      </div>
      <div className="text-center">
        <h1 className="font-display text-5xl text-white md:text-6xl">Ordine confermato!</h1>
        <p className="mt-4 max-w-md text-lg text-white/50">
          Grazie per il tuo acquisto. Riceverai una email di conferma con i dettagli dell&apos;ordine.
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
