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
          <p className="text-xs uppercase tracking-[0.45em] text-white/40">Il mio metodo</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-none md:text-7xl">
            Fatto a mano nel mio store, con il denim come tela.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/65">
            Ogni capo nasce dalla mia visione e dalle mie mani. Uso materiali selezionati,
            costruisco pezzi unici o serie limitate e porto nel prodotto finale il rapporto
            diretto tra laboratorio, strada e identita visiva.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/denim-customize" className="border-2 border-white bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white">
              Richiedi una customizzazione
            </Link>
            <Link href="/shop" className="border border-white/15 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white/75 transition hover:border-white/40 hover:text-white">
              Vai allo shop
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/35">Studio</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Montesilvano, lavoro manuale, pezzi con carattere.</h2>
          <p className="mt-6 text-base leading-8 text-white/60">
            Il progetto Jacopo Peca nasce dall'idea di trattare lo streetwear come una materia viva:
            non solo abiti, ma superfici da costruire, modificare, sporcare e rifinire con criterio.
            Il denim resta il punto centrale, ma il metodo si estende a felpe, camicie, upcycling e capsule personalizzate.
          </p>
          <p className="mt-5 text-base leading-8 text-white/60">
            La relazione con chi compra o commissiona e diretta. Per questo le richieste custom,
            i dettagli di vestibilita e le finiture vengono discusse caso per caso, senza automatismi inutili.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {aboutHighlights.map((item) => (
            <div key={item} className="border border-white/8 bg-[#111] p-5 text-sm leading-7 text-white/70">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Punto fermo</p>
              <p className="mt-3 font-medium text-white">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#0f0f0f]">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          {aboutStats.map((item) => (
            <div key={item.label} className="border border-white/8 bg-black/40 p-5">
              <p className="text-4xl font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/35">Laboratorio</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Dietro al capo c'e sempre una lavorazione reale.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/50">
            Alcune immagini recuperate dal sito originario mostrano il contesto corretto: mani, tavolo di lavoro, prove, materiali e interventi diretti sul capo.
          </p>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          {aboutGallery.map((image, index) => (
            <div key={image.src} className={`relative overflow-hidden border border-white/8 bg-[#111] ${index === 0 ? "min-h-[26rem]" : "min-h-[18rem]"}`}>
              <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
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