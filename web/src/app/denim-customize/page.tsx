import type { Metadata } from "next";
import Image from "@/components/StoreImage";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";

import ContactQuickForm from "@/components/ContactQuickForm";
import { categoryHref } from "@/lib/category-seo";
import {
  contactInfo,
  customizeFaqs,
  customizeOptions,
  customizePaths,
  customizeSteps,
} from "@/lib/editorial-data";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";

const heroImage = "/images/atelier/atelier-embroidery-hero.webp";
const customizeTitle = "Personalizzazione Jeans e Giacche su Misura – Denim Customize";
const customizeDescription =
  "Servizio di personalizzazione jeans e giacche di jeans a mano: ricamo Cornely stile tattoo, dipinti ad aerografo, strappi, patchwork e fit su misura nel laboratorio Jacopo Peca di Montesilvano (PE).";

export const metadata: Metadata = {
  title: customizeTitle,
  description: customizeDescription,
  keywords: [
    "personalizzare jeans",
    "personalizzare giacca di jeans",
    "jeans su misura",
    "giacca di jeans personalizzata",
    "ricamo su jeans",
    "upcycling denim Italia",
    "custom denim Jacopo Peca",
    "denim customize Montesilvano",
  ],
  alternates: {
    canonical: "/denim-customize",
  },
  openGraph: {
    title: `${customizeTitle} | Jacopo Peca`,
    description: customizeDescription,
    url: "/denim-customize",
    type: "website",
    images: [{ url: absoluteUrl(heroImage), alt: "Ricamo su denim nel laboratorio Jacopo Peca" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${customizeTitle} | Jacopo Peca`,
    description: customizeDescription,
    images: [absoluteUrl(heroImage)],
  },
};

const related = [
  { href: categoryHref("jeans-2"), label: "Jeans" },
  { href: categoryHref("giacca-denim"), label: "Giacche" },
  { href: categoryHref("camicia-jeans"), label: "Camicie" },
];

export default function DenimCustomizePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": absoluteUrl("/denim-customize#service"),
        name: "Denim Customize – Personalizzazione jeans e giacche a mano",
        serviceType: "Personalizzazione e customizzazione di jeans, giacche in denim e capi streetwear",
        description: customizeDescription,
        url: absoluteUrl("/denim-customize"),
        image: absoluteUrl(heroImage),
        areaServed: ["IT", "EU", "FR", "DE", "ES", "AT", "CH", "BE", "NL", "GB"],
        provider: { "@id": absoluteUrl("/#atelier") },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Lavorazioni Denim Customize",
          itemListElement: customizeOptions.map((opt) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: opt.title,
              description: opt.text,
            },
          })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl("/denim-customize#faq"),
        mainEntity: customizeFaqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Denim Customize", path: "/denim-customize" },
      ]),
    ],
  };

  return (
    <main className="flex flex-1 flex-col bg-black text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative isolate min-h-[calc(100svh-7.5rem)] overflow-hidden border-b border-white/10">
        <Image
          src={heroImage}
          alt="Jacopo Peca al lavoro sul ricamo di un capo denim"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-black/25" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-7.5rem)] w-full max-w-7xl flex-col justify-end px-5 pt-16 pb-10 sm:px-6 lg:px-10 lg:pb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">
            Laboratorio · Montesilvano
          </p>
          <h1 className="mt-3 max-w-5xl font-display text-[clamp(3.4rem,14vw,7.5rem)] leading-[0.82] text-white">
            Il tuo denim,
            <br />
            lavorato a mano.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
            Non è un configuratore. Porti un capo, o ne scegliamo uno, e lo apriamo insieme: ricamo, painting, fit, pezzi 1/1.
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
            <a
              href="#richiesta"
              className="home-primary inline-flex min-h-12 items-center justify-center gap-3 px-6 text-sm font-semibold uppercase tracking-widest"
            >
              Racconta il capo <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a
              href={contactInfo.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-white/70 px-6 text-sm font-bold uppercase tracking-widest text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              <MessageCircle size={16} aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto grid max-w-7xl grid-cols-3">
          {[
            { value: "1/1", label: "Niente serie" },
            { value: "Prima", label: "Prezzo e tempi" },
            { value: "PE", label: "Montesilvano" },
          ].map((item) => (
            <div key={item.label} className="border-r border-white/10 px-3 py-6 last:border-r-0 sm:px-6 sm:py-8 lg:px-10">
              <p className="font-display text-[clamp(2.1rem,8vw,4.5rem)] leading-none">{item.value}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-xs sm:tracking-[0.22em]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-14 lg:px-10 lg:py-24">
        <div className="relative aspect-4/5 overflow-hidden border border-white/12 bg-[#141414] lg:col-span-5">
          <Image
            src="/images/atelier/atelier-jacket-jp.jpg"
            alt="Giacca denim finita a mano nel laboratorio Jacopo Peca"
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover"
          />
          <p className="absolute bottom-0 left-0 bg-black/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em]">
            Pezzo finito · non un preset
          </p>
        </div>
        <div className="lg:col-span-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">Due strade</p>
          <h2 className="mt-3 font-display text-[clamp(2.6rem,8vw,5rem)] leading-[0.88]">
            Il capo c&apos;è già, oppure lo troviamo.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {customizePaths.map((path) => (
              <article key={path.title} className="border border-white/12 bg-[#111] p-5">
                <h3 className="text-lg font-semibold">{path.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{path.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">Come funziona</p>
          <h2 className="mt-3 max-w-3xl font-display text-[clamp(2.6rem,8vw,5rem)] leading-[0.88]">
            Quattro passi, nessun automatismo.
          </h2>
          <ol className="mt-8 grid gap-px bg-white/10 sm:grid-cols-2">
            {customizeSteps.map((step) => (
              <li key={step.title} className="bg-[#0f0f0f] p-5 sm:p-7">
                <p className="font-display text-4xl text-red-600">{step.index}</p>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">Lavorazioni</p>
        <h2 className="mt-3 font-display text-[clamp(2.6rem,8vw,5rem)] leading-[0.88]">Cosa succede sul capo.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {customizeOptions.map((item) => (
            <article key={item.title} className="group overflow-hidden border border-white/12 bg-[#111]">
              <div className="relative aspect-16/10">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="richiesta" className="scroll-mt-24 border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:py-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">Richiesta</p>
            <h2 className="mt-3 font-display text-[clamp(2.6rem,8vw,4.6rem)] leading-[0.88]">
              Mandami il pezzo, non un modulo vuoto.
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-white/80">
              <li>Foto fronte, retro e un dettaglio del tessuto.</li>
              <li>Taglia, fit che cerchi e se il capo è già tuo.</li>
              <li>Un riferimento visivo, anche solo una palette.</li>
              <li>La data, se c&apos;è uno shooting o una consegna fissa.</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-2">
              {related.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:border-white/40 hover:text-white"
                >
                  {item.label} in shop
                </Link>
              ))}
            </div>
          </div>
          <ContactQuickForm
            defaultTopic="custom"
            eyebrow="Diretto in laboratorio"
            title="Apri la custom"
            intro="Il messaggio arriva su WhatsApp o email, già pronto. Più foto e dettagli mandi, più la proposta è precisa."
          />
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">Prima di partire</p>
          <h2 className="mt-3 font-display text-[clamp(2.4rem,7vw,4.2rem)] leading-[0.88]">Domande corte.</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {customizeFaqs.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer list-none text-base font-semibold marker:content-none sm:text-lg">
                  <span className="flex items-center justify-between gap-4">
                    {item.question}
                    <span className="text-red-500 transition group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
