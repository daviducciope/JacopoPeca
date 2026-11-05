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
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">Legal</p>
        <h1 className="mt-3 font-display text-5xl">Termini e Condizioni</h1>
      </div>
      <section>
        <h2 className="text-2xl font-bold text-white">Spedizioni</h2>
        <ul className="mt-4 space-y-3 text-base leading-8 text-white/80">
          {shippingPolicy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-white">Resi e cambi</h2>
        <ul className="mt-4 space-y-3 text-base leading-8 text-white/80">
          {returnPolicy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="text-base leading-8 text-white/80">
        <p>
          L&apos;acquisto di <strong className="font-semibold text-white">capi unici o personalizzati</strong> può
          richiedere <em className="italic text-white">conferme specifiche su misure, tempi e modalità di consegna</em>{" "}
          prima dell&apos;avvio del lavoro in laboratorio.
        </p>
      </section>
    </main>
  );
}
