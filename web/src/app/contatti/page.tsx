import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";

import Image from "@/components/StoreImage";
import ContactQuickForm from "@/components/ContactQuickForm";
import { contactInfo, socials } from "@/lib/editorial-data";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contatti & Atelier — Parla Direttamente con Jacopo Peca",
  description:
    "Contatta direttamente Jacopo Peca nel laboratorio di Montesilvano (PE): WhatsApp diretto, email, telefono, indirizzo dell'atelier per capi streetwear, denim custom su misura e assistenza ordini.",
  keywords: [
    "contatti Jacopo Peca",
    "laboratorio Jacopo Peca Montesilvano",
    "denim custom su misura contatti",
    "atelier streetwear Pescara Montesilvano",
    "tattoo clothing Jacopo Peca",
  ],
  alternates: {
    canonical: "/contatti",
  },
  openGraph: {
    title: "Contatti & Atelier — Jacopo Peca Handcrafted Denim Streetwear",
    description:
      "Linea diretta con il laboratorio di Jacopo Peca a Montesilvano (PE) per ordini, informazioni sulle taglie, customizzazioni 1/1 e collaborazioni.",
    url: "/contatti",
    type: "website",
    images: [
      {
        url: absoluteUrl("/images/atelier/atelier-airbrush.jpg"),
        alt: "Laboratorio Jacopo Peca — Montesilvano (PE)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contatti & Atelier — Jacopo Peca",
    description:
      "WhatsApp, Email, Telefono e indirizzo del laboratorio artigianale Jacopo Peca a Montesilvano (PE).",
    images: [absoluteUrl("/images/atelier/atelier-airbrush.jpg")],
  },
};

const googleMapsSearchUrl =
  "https://www.google.com/maps/search/?api=1&query=Via+Benedetto+Croce+18+65016+Montesilvano+PE";

export default function ContattiPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": absoluteUrl("/contatti#contactpage"),
        url: absoluteUrl("/contatti"),
        name: "Contatti & Atelier — Jacopo Peca",
        description:
          "Canali di contatto ufficiali del laboratorio artigianale Jacopo Peca a Montesilvano (PE).",
        mainEntity: {
          "@id": absoluteUrl("/#atelier"),
        },
      },
      {
        "@type": "ClothingStore",
        "@id": absoluteUrl("/#atelier"),
        name: "Jacopo Peca — Handcrafted Denim Streetwear Atelier",
        url: absoluteUrl("/"),
        image: absoluteUrl("/images/atelier/atelier-airbrush.jpg"),
        email: contactInfo.email,
        telephone: "+390852934313",
        priceRange: "€€",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Via B. Croce 18",
          addressLocality: "Montesilvano",
          addressRegion: "PE",
          postalCode: "65016",
          addressCountry: "IT",
        },
        sameAs: socials.map((s) => s.href),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Contatti",
            item: absoluteUrl("/contatti"),
          },
        ],
      },
    ],
  };

  return (
    <main className="flex flex-1 flex-col bg-[#0a0a0a] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero & Primary Contact Channels ── */}
      <section className="relative overflow-hidden border-b border-white/12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-red-600/10 blur-[120px]"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-10 lg:py-16">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/60"
          >
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="text-white/30">/</span>
            <span className="font-semibold text-red-500">Contatti</span>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
            {/* Left Copy & 4 Direct Action Cards */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-500">
                  Linea Diretta // Nessun Intermediario
                </p>
              </div>

              <h1 className="mt-3 font-display text-5xl leading-[0.92] text-white sm:text-6xl md:text-7xl">
                Parliamone in modo diretto.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg sm:leading-8">
                Dietro ogni capo c&apos;è{" "}
                <strong className="font-semibold text-white">
                  un laboratorio reale e una persona reale
                </strong>
                . Per informazioni su{" "}
                <strong className="font-semibold text-white">
                  ordini, misure in centimetri, richieste custom 1/1,
                  disponibilità
                </strong>{" "}
                o{" "}
                <em className="italic text-white">
                  collaborazioni per shooting e live
                </em>
                , rispondo direttamente dal mio studio di{" "}
                <strong className="font-semibold text-white">
                  Montesilvano (PE)
                </strong>
                .
              </p>

              {/* 4 High-Contrast Actionable Contact Cards */}
              <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
                {/* WhatsApp (Primary Fast Channel) */}
                <a
                  href={contactInfo.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between border border-emerald-500/35 bg-gradient-to-br from-emerald-500/12 via-[#121212] to-[#121212] p-5 transition hover:border-emerald-400"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
                      <MessageCircle size={15} />
                      WhatsApp Diretto
                    </span>
                    <span className="border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Consigliato
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-base font-bold text-white">
                      Chatta con il Laboratorio
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/75">
                      Ideale per inviare{" "}
                      <em className="italic text-white">
                        foto di riferimento, chiedere misure
                      </em>{" "}
                      o definire un custom.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white group-hover:text-emerald-300">
                    Apri chat WhatsApp <ArrowUpRight size={14} />
                  </span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="group flex flex-col justify-between border border-white/15 bg-[#121212] p-5 transition hover:border-red-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-red-500">
                      <Mail size={15} />
                      Email Ufficiale
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-white/40 transition group-hover:text-red-500"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="break-all text-base font-bold text-white">
                      {contactInfo.email}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/75">
                      Secondaria:{" "}
                      <em className="italic text-white/90">
                        {contactInfo.emailSecondary}
                      </em>
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/85 group-hover:text-red-400">
                    Scrivi un&apos;email <ArrowUpRight size={14} />
                  </span>
                </a>

                {/* Phone */}
                <a
                  href={contactInfo.phoneHref}
                  className="group flex flex-col justify-between border border-white/15 bg-[#121212] p-5 transition hover:border-white/45"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-red-500">
                      <Phone size={15} />
                      Telefono Studio
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-white/40 transition group-hover:text-white"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-lg font-bold tracking-wide text-white">
                      {contactInfo.phoneDisplay}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/75">
                      Contatto telefonico diretto con l&apos;atelier durante le{" "}
                      <em className="italic text-white">ore di laboratorio</em>.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/85 group-hover:text-white">
                    Chiama ora <ArrowUpRight size={14} />
                  </span>
                </a>

                {/* Physical Atelier */}
                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between border border-white/15 bg-[#121212] p-5 transition hover:border-white/45"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-red-500">
                      <MapPin size={15} />
                      L&apos;Atelier Fisico
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-white/40 transition group-hover:text-white"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-base font-bold text-white">
                      {contactInfo.address}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/75">
                      Dove nascono tutti i capi{" "}
                      <strong className="font-semibold text-white">
                        100% fatti a mano
                      </strong>
                      .
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/85 group-hover:text-white">
                    Apri in Google Maps <ArrowUpRight size={14} />
                  </span>
                </a>
              </div>
            </div>

            {/* Right Visual Atelier Showcase (replaces broken 403 Image-Contact.webp) */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-12 gap-3.5">
                <div className="relative col-span-12 aspect-4/3 overflow-hidden border border-white/15 bg-[#141414]">
                  <Image
                    src="/images/atelier/atelier-airbrush.jpg"
                    alt="Jacopo Peca al lavoro con aerografo all'esterno del laboratorio Tattoo JP Clothing a Montesilvano"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2 border border-white/15 bg-black/80 px-3 py-1.5 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white">
                      Tattoo JP Clothing // Montesilvano
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs leading-relaxed text-white/90 sm:text-sm">
                      &ldquo;Ogni richiesta custom o ordine online passa{" "}
                      <strong className="font-semibold text-white">
                        direttamente dalle mie mani
                      </strong>
                      , nel mio laboratorio.&rdquo;
                    </p>
                  </div>
                </div>

                <div className="relative col-span-6 aspect-4/3 overflow-hidden border border-white/15 bg-[#141414]">
                  <Image
                    src="/images/atelier/atelier-singer.jpg"
                    alt="Cucitura manuale su denim nel laboratorio Jacopo Peca"
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
                    Sartoria Denim
                  </span>
                </div>

                <div className="flex col-span-6 flex-col justify-between border border-white/15 bg-[#121212] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-500">
                    <Clock size={14} />
                    <span>Tempi di Risposta</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/80">
                    Risposta media su{" "}
                    <strong className="font-semibold text-white">
                      WhatsApp ed Email entro poche ore
                    </strong>{" "}
                    (Lun–Sab).
                  </p>
                  <p className="mt-2 text-[11px] italic text-white/65">
                    100% assistenza diretta con il creatore.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Quick Message Form + Checklist & Socials ── */}
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10">
        {/* Left: Interactive WhatsApp / Email Composer */}
        <div className="lg:col-span-7">
          <ContactQuickForm />
        </div>

        {/* Right: Guide to First Contact + Active Social Channels */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* What to include in your first message */}
          <div className="border border-white/15 bg-[#121212] p-6 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              Guida Rapida // Primo Contatto
            </p>
            <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
              Cosa indicare nel messaggio
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-white/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center border border-red-500/40 bg-red-600/15 text-[11px] font-bold text-red-400">
                  01
                </span>
                <span>
                  <strong className="font-semibold text-white">
                    Nome del prodotto:
                  </strong>{" "}
                  se chiedi <em className="italic text-white">disponibilità</em>{" "}
                  o foto aggiuntive di un capo visto nello{" "}
                  <Link
                    href="/shop"
                    className="text-white underline underline-offset-4 hover:text-red-400"
                  >
                    Store
                  </Link>
                  .
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center border border-red-500/40 bg-red-600/15 text-[11px] font-bold text-red-400">
                  02
                </span>
                <span>
                  <strong className="font-semibold text-white">
                    Taglia, misure o fit desiderato:
                  </strong>{" "}
                  se vuoi conoscere le{" "}
                  <em className="italic text-white">
                    misure esatte in centimetri
                  </em>{" "}
                  (vita, spalle, torace, lunghezza) prima dell&apos;acquisto.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center border border-red-500/40 bg-red-600/15 text-[11px] font-bold text-red-400">
                  03
                </span>
                <span>
                  <strong className="font-semibold text-white">
                    Idea, foto di riferimento e capo base:
                  </strong>{" "}
                  se la richiesta riguarda una{" "}
                  <Link
                    href="/denim-customize"
                    className="font-semibold text-white underline underline-offset-4 hover:text-red-400"
                  >
                    customizzazione su misura
                  </Link>{" "}
                  o l&apos;upcycling di un tuo capo.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center border border-red-500/40 bg-red-600/15 text-[11px] font-bold text-red-400">
                  04
                </span>
                <span>
                  <strong className="font-semibold text-white">
                    Tempistiche o deadline:
                  </strong>{" "}
                  se il pezzo ti occorre entro una data precisa per{" "}
                  <em className="italic text-white">
                    shooting, live, eventi o regali
                  </em>
                  .
                </span>
              </li>
            </ul>
          </div>

          {/* Social Channels */}
          <div className="border border-white/15 bg-[#121212] p-6 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              Social &amp; Backstage // @jpcustomclothing
            </p>
            <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
              Segui il lavoro in laboratorio
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-white/75 sm:text-sm">
              Sui profili social trovi{" "}
              <strong className="font-semibold text-white">
                making-of, nuovi drop 1/1
              </strong>{" "}
              e video delle lavorazioni in tempo reale.
            </p>
            <div className="mt-5 grid gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border border-white/15 bg-black/50 px-4 py-3.5 text-sm font-semibold text-white/85 transition hover:border-red-500 hover:bg-red-600/10 hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center border border-white/15 bg-white/5 text-[10px] font-bold uppercase text-red-500">
                      {social.name.slice(0, 2)}
                    </span>
                    <span>{social.name}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/60 group-hover:text-red-400">
                    Segui <ArrowUpRight size={14} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Atelier Location & Interactive Map Section ── */}
      <section className="border-t border-white/12 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                <Sparkles size={14} />
                <span>Dove Nascono i Capi // Abruzzo, Italia</span>
              </div>
              <h2 className="mt-2 font-display text-4xl text-white sm:text-5xl">
                Il Laboratorio a Montesilvano (PE)
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
                L&apos;atelier <strong className="font-semibold text-white">Jacopo Peca</strong> si trova in{" "}
                <strong className="font-semibold text-white">
                  {contactInfo.address}
                </strong>
                , sulla costa adriatica abruzzese. Qui vengono selezionati i
                tessuti, eseguite le cuciture su macchine vintage e rifiniti a
                mano tutti i capi prima della spedizione in{" "}
                <em className="italic text-white">tutta Italia ed Europa</em>.
              </p>

              <div className="mt-6 space-y-3 border border-white/12 bg-[#141414] p-5 text-xs leading-relaxed text-white/80 sm:text-sm">
                <p>
                  <strong className="font-semibold text-white">
                    Indirizzo:
                  </strong>{" "}
                  {contactInfo.address}
                </p>
                <p>
                  <strong className="font-semibold text-white">
                    Appuntamenti &amp; Ritiri Custom:
                  </strong>{" "}
                  contattaci su{" "}
                  <a
                    href={contactInfo.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white underline underline-offset-4 hover:text-red-400"
                  >
                    WhatsApp
                  </a>{" "}
                  o al{" "}
                  <a
                    href={contactInfo.phoneHref}
                    className="font-semibold text-white underline underline-offset-4 hover:text-red-400"
                  >
                    {contactInfo.phoneDisplay}
                  </a>{" "}
                  per concordare una visita in studio o una prova su misura.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-white bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:bg-transparent hover:text-white"
                >
                  Apri Indicazioni Maps <ArrowUpRight size={15} />
                </a>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-white/25 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:border-white"
                >
                  Scopri la storia dell&apos;Atelier
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative aspect-16/10 w-full overflow-hidden border border-white/15 bg-[#141414]">
                <iframe
                  title="Mappa Laboratorio Jacopo Peca — Via B. Croce 18, Montesilvano (PE)"
                  src="https://maps.google.com/maps?q=Via%20Benedetto%20Croce%2018,%2065016%20Montesilvano%20PE&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="h-full w-full border-0 grayscale contrast-125 invert-[0.9] hue-rotate-180"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
