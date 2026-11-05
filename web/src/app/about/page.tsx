import type { Metadata } from "next";
import Image from "@/components/StoreImage";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { aboutGallery, aboutHighlights, aboutStats, contactInfo, socials } from "@/lib/editorial-data";

export const metadata: Metadata = {
  title: "About - Jacopo Peca",
  description:
    "Jacopo Peca, nato a Pescara nel 1984. Denim e streetwear fatti a mano nel laboratorio di Montesilvano: strappi, cuciture, tattoo clothing.",
};

export default function AboutPage() {
  return (
    <main className="about-page flex flex-1 flex-col bg-black text-white">
      <section className="relative isolate min-h-[calc(100svh-7.5rem)] overflow-hidden border-b border-white/10">
        <Image
          src={aboutGallery[0].src}
          alt={aboutGallery[0].alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[28%_42%] sm:object-center"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/55 to-black/20" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-7.5rem)] w-full max-w-7xl flex-col justify-end px-5 pt-16 pb-10 sm:px-6 lg:px-10 lg:pb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">Jacopo Peca</p>
          <h1 className="mt-3 max-w-5xl font-display text-[clamp(3.6rem,16vw,8rem)] leading-[0.82] text-white">
            Le mani<br />sul denim.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
            Nato a Pescara, laboratorio a Montesilvano. Streetwear costruito a mano: strappi, cuciture, tattoo clothing. Niente serie infinite.
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
            <Link
              href="/denim-customize"
              className="home-primary inline-flex min-h-12 items-center justify-center gap-3 px-6 text-sm font-semibold uppercase tracking-widest"
            >
              Customizza un capo <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center border-2 border-white/70 px-6 text-sm font-bold uppercase tracking-widest text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Vai allo shop
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto grid max-w-7xl grid-cols-3">
          {aboutStats.map((item) => (
            <div key={item.label} className="border-r border-white/10 px-3 py-6 last:border-r-0 sm:px-6 sm:py-8 lg:px-10">
              <p className="font-display text-[clamp(2.1rem,8vw,4.5rem)] leading-none text-white">{item.value}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-xs sm:tracking-[0.22em]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-14 lg:px-10 lg:py-24">
        <div className="relative aspect-4/5 overflow-hidden border border-white/12 bg-[#141414] lg:col-span-5 lg:aspect-3/4">
          <Image
            src="/images/atelier/atelier-singer.jpg"
            alt="Cucitura a mano sul denim strappato nel laboratorio di Montesilvano"
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover object-[30%_35%]"
          />
          <p className="absolute bottom-0 left-0 bg-black/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
            Laboratorio · Montesilvano
          </p>
        </div>
        <div className="lg:col-span-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">La storia</p>
          <h2 className="mt-3 font-display text-[clamp(2.6rem,8vw,5rem)] leading-[0.88]">
            Dal banco al tavolo da lavoro.
          </h2>
          <p className="mt-6 text-base leading-8 text-white/85">
            Jacopo Peca nasce a Pescara nel 1984, in una famiglia già dentro la moda e la cultura denim. Per vent&apos;anni ha lavorato nei negozi della costa adriatica, tra banco e clienti.
          </p>
          <p className="mt-4 text-base leading-8 text-white/85">
            Poi ha spostato lo stesso sguardo sul tavolo da lavoro. Con le macchine da cucire incide le capsule e dà forma a Identity Denim JP: pezzi unici o piccole serie, mai una produzione industriale.
          </p>
          <p className="mt-4 text-base leading-8 text-white/85">
            Il passaggio da chi vende il capo a chi lo costruisce lo racconta anche nel seminario-laboratorio «Il Contrario», alla UED di Pescara.
          </p>
          <blockquote className="mt-8 border-l-2 border-red-600 pl-4 font-display text-3xl leading-none text-white sm:text-4xl">
            A colpi di strappi, cuciture e tattoo clothing.
          </blockquote>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">Il metodo</p>
          <h2 className="mt-3 max-w-3xl font-display text-[clamp(2.6rem,8vw,5rem)] leading-[0.88]">
            Come nasce un pezzo.
          </h2>
          <ol className="mt-8 grid gap-px bg-white/10 sm:grid-cols-2">
            {aboutHighlights.map((item) => (
              <li key={item.index} className="bg-[#0f0f0f] p-5 sm:p-7">
                <p className="font-display text-4xl text-red-600">{item.index}</p>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-14 md:px-6 lg:px-10 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">Laboratorio</p>
            <h2 className="mt-3 font-display text-[clamp(2.6rem,8vw,5rem)] leading-[0.88]">
              Dietro al capo.
            </h2>
          </div>
          <p className="pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55 md:hidden">
            Scorri di lato
          </p>
        </div>
        <div className="about-rail mt-7">
          {aboutGallery.map((image) => (
            <figure key={image.src} className="about-shot border border-white/10">
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 84vw, 50vw" className="object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/70 to-transparent px-4 pt-16 pb-4">
                <p className="font-display text-3xl leading-none">{image.caption}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">{image.detail}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-white text-black">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-12 lg:px-10 lg:py-20">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-600">Contatto diretto</p>
            <h2 className="mt-3 font-display text-[clamp(2.8rem,9vw,5.2rem)] leading-[0.86]">
              Scrivimi.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-black/70">
              Per una custom, una capsula o una collaborazione si parte da un messaggio. Niente form lunghi.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:col-span-7">
            <a
              href={contactInfo.whatsappHref}
              className="home-primary inline-flex min-h-14 items-center justify-between gap-3 px-5 text-sm font-semibold uppercase tracking-widest"
            >
              WhatsApp <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a
              href={`mailto:${contactInfo.email}`}
              className="inline-flex min-h-14 items-center justify-between gap-3 border-2 border-black px-5 text-sm font-semibold"
            >
              {contactInfo.email}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a
              href={contactInfo.phoneHref}
              className="inline-flex min-h-14 items-center justify-between gap-3 border-2 border-black px-5 text-sm font-semibold"
            >
              {contactInfo.phoneDisplay}
              <span className="text-[11px] uppercase tracking-[0.18em] text-black/55">Chiama</span>
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(contactInfo.address)}`}
              className="inline-flex min-h-14 items-center justify-between gap-3 border-2 border-black px-5 text-left text-sm font-semibold"
            >
              <span>{contactInfo.address}</span>
              <ArrowUpRight size={18} className="shrink-0" aria-hidden="true" />
            </a>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em]">
              {socials.map((social) => (
                <a key={social.name} href={social.href} className="underline-offset-4 hover:underline">
                  {social.name}
                </a>
              ))}
              <Link href="/contatti" className="underline-offset-4 hover:underline">
                Tutti i contatti
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
