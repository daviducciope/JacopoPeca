import type { Metadata } from "next";
import Link from "next/link";

import { contactInfo, customizeOptions, customizeSteps } from "@/lib/editorial-data";

export const metadata: Metadata = {
  title: "Denim Customize - Jacopo Peca",
  description:
    "Richiedi una customizzazione denim o un pezzo su misura: processo, lavorazioni disponibili e contatti diretti con Jacopo Peca.",
};

export default function DenimCustomizePage() {
  return (
    <main className="flex flex-1 flex-col bg-black text-white">
      <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,#1d3557,transparent_35%),radial-gradient(circle_at_bottom_right,#6b4423,transparent_30%),#090909]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-red-500">Denim Customize</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-none md:text-7xl">
            Customizzazione vera, non un configuratore finto.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
            Se vuoi un <strong className="font-semibold text-white">intervento su denim</strong>, una{" "}
            <em className="italic text-white">trasformazione su un capo esistente</em> o un pezzo costruito a
            partire da un&apos;idea, il processo parte da un{" "}
            <strong className="font-semibold text-white">confronto diretto</strong>. Ogni custom è definita{" "}
            <em className="italic text-white">sul singolo caso</em>, senza automatismi e senza preset rigidi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={contactInfo.whatsappHref} target="_blank" rel="noopener noreferrer" className="border-2 border-white bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white">
              Scrivi su WhatsApp
            </a>
            <a href={`mailto:${contactInfo.email}`} className="border border-white/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white/85 transition hover:border-white/50 hover:text-white">
              Invia una mail
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div className="border border-white/12 bg-[#111] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Come funziona</p>
          <div className="mt-6 grid gap-4">
            {customizeSteps.map((step, index) => (
              <div key={step.title} className="border border-white/10 bg-black/40 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-500">Step 0{index + 1}</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="border border-white/12 bg-[#111] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Lavorazioni</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Cosa posso fare sul capo</h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-white/85 sm:text-base">
              {customizeOptions.map((item) => (
                <li key={item} className="border border-white/10 bg-black/40 px-4 py-4 font-medium text-white/90">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-white/12 bg-[#111] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Prima di scrivere</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/80 sm:text-base">
              <li>
                Indica se hai <strong className="font-semibold text-white">già il capo base</strong> o se deve essere{" "}
                <em className="italic text-white">selezionato in laboratorio</em>.
              </li>
              <li>
                Allega <strong className="font-semibold text-white">foto di riferimento</strong>,{" "}
                <em className="italic text-white">palette e preferenze di fit</em>.
              </li>
              <li>
                Segnala eventuali <strong className="font-semibold text-white">deadline</strong> per{" "}
                <em className="italic text-white">shooting, live o consegne speciali</em>.
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contatti" className="border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/75 transition hover:border-white/40 hover:text-white">
                Vai ai contatti
              </Link>
              <Link href="/shop?cat=denim-shorts" className="border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/75 transition hover:border-white/40 hover:text-white">
                Vedi il catalogo correlate
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
