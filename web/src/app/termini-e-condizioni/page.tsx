import type { Metadata } from "next";

import { returnPolicy, shippingPolicy } from "@/lib/editorial-data";

export const metadata: Metadata = {
  title: "Termini e Condizioni - Jacopo Peca",
  description: "Condizioni generali di vendita e gestione ordini per Jacopo Peca.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-16 text-white lg:px-10">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/35">Legal</p>
        <h1 className="mt-3 font-display text-5xl">Termini e Condizioni</h1>
      </div>
      <section>
        <h2 className="text-2xl font-semibold">Spedizioni</h2>
        <ul className="mt-4 space-y-3 text-sm leading-8 text-white/65">
          {shippingPolicy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Resi e cambi</h2>
        <ul className="mt-4 space-y-3 text-sm leading-8 text-white/65">
          {returnPolicy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="text-sm leading-8 text-white/65">
        <p>
          L'acquisto di capi unici o personalizzati puo richiedere conferme specifiche su misure, tempi e modalita di consegna prima dell'avvio del lavoro.
        </p>
      </section>
    </main>
  );
}