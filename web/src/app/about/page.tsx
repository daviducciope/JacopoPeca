import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { aboutGallery, aboutHighlights, aboutStats, contactInfo } from "@/lib/editorial-data";

export const metadata: Metadata = {
  title: "About - Jacopo Peca",
  description:
    "Scopri il metodo di lavoro di Jacopo Peca: capi streetwear e denim fatti a mano nel laboratorio di Montesilvano.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0">
          <Image
            src={aboutGallery[0].src}
            alt={aboutGallery[0].alt}
            fill
            className="object-cover opacity-30"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.55),rgba(0,0,0,.88))]" />
        </div>
        <div className="relative mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-center px-6 py-20 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-red-500">Il mio metodo</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-none md:text-7xl">
            Fatto a mano nel mio store, con il denim come tela.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
            Ogni capo nasce <strong className="font-semibold text-white">dalla mia visione e dalle mie mani</strong>.
            Uso materiali selezionati, costruisco{" "}
            <strong className="font-semibold text-white">pezzi unici o serie limitate</strong> e porto nel
            prodotto finale il <em className="italic text-white">rapporto diretto tra laboratorio, strada e identità visiva</em>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/denim-customize" className="border-2 border-white bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white">
              Richiedi una customizzazione
            </Link>
            <Link href="/shop" className="border border-white/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white/85 transition hover:border-white/50 hover:text-white">
              Vai allo shop
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">Studio</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Montesilvano, lavoro manuale, pezzi con carattere.</h2>
          <p className="mt-6 text-base leading-8 text-white/80">
            Il progetto <strong className="font-semibold text-white">Jacopo Peca</strong> nasce dall&apos;idea di
            trattare lo streetwear come una <em className="italic text-white">materia viva</em>: non solo abiti,
            ma <strong className="font-semibold text-white">superfici da costruire, modificare, sporcare e rifinire con criterio</strong>.
            Il denim resta il punto centrale, ma il metodo si estende a{" "}
            <em className="italic text-white/95">felpe, camicie, upcycling e capsule personalizzate</em>.
          </p>
          <p className="mt-5 text-base leading-8 text-white/80">
            La relazione con chi compra o commissiona è <strong className="font-semibold text-white">diretta</strong>.
            Per questo le richieste custom, i dettagli di <em className="italic text-white">vestibilità</em> e le
            finiture vengono discusse <strong className="font-semibold text-white">caso per caso</strong>, senza automatismi inutili.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {aboutHighlights.map((item) => (
            <div key={item} className="border border-white/12 bg-[#111] p-5 text-sm leading-7 text-white/85">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">Punto fermo</p>
              <p className="mt-3 text-base font-semibold text-white">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0f0f0f]">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-12 sm:grid-cols-3 lg:px-10">
          {aboutStats.map((item, idx) => (
            <div
              key={item.label}
              className={`border p-6 ${
                idx === 0
                  ? "border-red-600/50 bg-gradient-to-br from-red-600/15 to-black/60"
                  : "border-white/10 bg-black/40"
              }`}
            >
              <p className="font-display text-5xl text-white">{item.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">Laboratorio</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Dietro al capo c&apos;è sempre una lavorazione reale.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            Gli scatti del laboratorio mostrano il contesto autentico:{" "}
            <strong className="font-semibold text-white">mani, tavolo di lavoro, macchine da cucire</strong>,{" "}
            <em className="italic text-white">prove, materiali e interventi diretti sul capo</em>.
          </p>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          {aboutGallery.map((image, index) => (
            <div key={image.src} className={`relative overflow-hidden border border-white/8 bg-[#111] ${index === 0 ? "min-h-[26rem]" : "min-h-[18rem]"}`}>
              <Image src={image.src} alt={image.alt} fill className="object-cover opacity-80" sizes="(max-width: 1024px) 100vw, 33vw" />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/8 bg-[#111]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/35">Contatto diretto</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Per capsule, custom o collaborazioni si parte da qui.</h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-white/60">
            <p>
              Email: <a href={`mailto:${contactInfo.email}`} className="text-white underline-offset-4 hover:underline">{contactInfo.email}</a>
            </p>
            <p>
              Telefono: <a href={contactInfo.phoneHref} className="text-white underline-offset-4 hover:underline">{contactInfo.phoneDisplay}</a>
            </p>
            <p>{contactInfo.address}</p>
            <p>
              Se preferisci, trovi un riepilogo completo nella pagina <Link href="/contatti" className="text-white underline-offset-4 hover:underline">Contatti</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
