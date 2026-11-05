import Link from "next/link";
import type { Metadata } from "next";
import Image from "@/components/StoreImage";
import { ArrowUpRight, ArrowDown } from "lucide-react";

import HeroVideo from "@/components/HeroVideo";

import { HomeDrop } from "@/components/HomeDrop";
import { categoryHref } from "@/lib/category-seo";
import { getFeaturedStorefrontProducts, getStorefrontCategories } from "@/lib/product-data";
import { ensureDynamicRendering } from "@/lib/render-mode";
import { brandDescription, defaultOgImage } from "@/lib/seo";

const homeTitle = "Jacopo Peca – Jeans e Giacche di Jeans Personalizzate Fatte a Mano";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: brandDescription,
  keywords: [
    "Jacopo Peca",
    "jeans personalizzati",
    "giacca di jeans personalizzata",
    "giacca jeans dipinta a mano",
    "denim custom",
    "streetwear artigianale made in Italy",
    "tattoo clothing",
    "abbigliamento fatto a mano Pescara",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: homeTitle,
    description: brandDescription,
    images: [
      {
        url: defaultOgImage,
        alt: "Jacopo Peca al lavoro nel laboratorio di denim personalizzato a Montesilvano",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: brandDescription,
    images: [defaultOgImage],
  },
};

export default async function HomePage() {
  await ensureDynamicRendering();

  const [categories, featured] = await Promise.all([
    getStorefrontCategories(),
    getFeaturedStorefrontProducts(8),
  ]);

  return (
    <main className="home-page flex flex-1 flex-col">
      {/* Hero */}
      <section className="home-hero relative flex items-center overflow-hidden bg-black">
        <link rel="preload" as="image" href="/images/atelier/atelier-embroidery-hero.webp" fetchPriority="high" />
        <HeroVideo />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.3),rgba(0,0,0,0.7))]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
          <h1 className="home-title font-display text-white">
            <small className="mb-4 block font-sans text-xs font-semibold uppercase leading-normal tracking-[0.3em] text-white/85 sm:text-sm">
              Denim personalizzato fatto a mano · Montesilvano (PE)
            </small>
            MADE IN<br />MY <span>STORE</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/90 md:text-lg">
            Tutti i nostri capi sono{" "}
            <strong className="font-semibold text-white">
              fatti a mano nel mio store
            </strong>
            , garantendo <em className="italic text-white">qualità e autenticità</em>.
            Jeans, giacche di jeans e felpe{" "}
            <strong className="font-semibold text-white">
              personalizzate una per una
            </strong>
            : capi{" "}
            <strong className="font-semibold text-white">
              streetwear unici
            </strong>
            , made in Italy.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="home-primary inline-flex items-center justify-center gap-6 px-7 py-4 text-sm font-semibold uppercase tracking-widest"
            >
              Vai allo Store <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
            <Link
              href="/about"
              className="inline-block border-2 border-white/50 px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:border-white hover:text-white"
            >
              Chi sono
            </Link>
          </div>
          <a href="#collezione" className="home-scroll mt-12 inline-flex min-h-11 items-center gap-3 text-xs uppercase tracking-widest text-white/80"><ArrowDown size={16} aria-hidden="true" /> Esplora la collezione</a>
        </div>
        <span aria-hidden="true" className="home-hero-note">HANDCRAFTED DENIM STREETWEAR</span>
      </section>

      {/* Categories strip */}
      <section id="collezione" className="home-categories border-y border-white/15 bg-[#111]">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <h2 className="font-display text-4xl text-white sm:text-5xl">Trova il tuo pezzo.</h2>
          <div className="mt-6 grid grid-cols-2 gap-px bg-white/15 md:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={categoryHref(cat.slug)}
                className="home-category group relative bg-[#111] p-5 transition sm:p-7"
              >
                <p className="pr-5 font-display text-3xl text-white md:text-4xl">
                  {cat.name}
                </p>
                <p className="mt-2 text-xs text-white/65">
                  {cat.count} prodotti
                </p>
                <ArrowUpRight className="absolute right-4 top-6 text-white/70" size={20} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeDrop products={featured} />

      {/* About / Atelier showcase */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#0b0b0b]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-red-600/8 blur-[120px]"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-14 lg:px-10 lg:py-28">
          {/* Editorial multi-photo mosaic */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-12 gap-3 sm:gap-4">
              {/* Primary workshop image */}
              <div className="relative col-span-12 aspect-16/11 overflow-hidden border border-white/12 bg-[#161616]">
                <Image
                  src="/images/atelier/atelier-embroidery.jpg"
                  alt="Jacopo Peca al lavoro sulla macchina da cucire nel suo laboratorio"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-700 hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-2 border border-white/15 bg-black/80 px-3 py-1.5 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white">
                    L&apos;Atelier // Montesilvano (PE)
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <p className="max-w-md text-xs leading-relaxed text-white/90 sm:text-sm">
                    &ldquo;A colpi di{" "}
                    <em className="italic text-white">
                      strappi, cuciture e tattoo clothing
                    </em>{" "}
                    do vita a pezzi con{" "}
                    <strong className="font-semibold text-white">
                      un&apos;identità irripetibile
                    </strong>
                    .&rdquo;
                  </p>
                  <span className="shrink-0 font-display text-2xl tracking-wider text-red-500 sm:text-3xl">
                    JP
                  </span>
                </div>
              </div>

              {/* Secondary detail photo 1: Airbrushing */}
              <div className="group relative col-span-7 aspect-4/3 overflow-hidden border border-white/12 bg-[#161616]">
                <Image
                  src="/images/atelier/atelier-airbrush.jpg"
                  alt="Lavorazione ad aerografo su capo custom Tattoo JP Clothing"
                  fill
                  sizes="(max-width: 1024px) 60vw, 30vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/95">
                  Aerografo &amp; Painting
                </span>
              </div>

              {/* Secondary detail photo 2: Hand-painted jacket */}
              <div className="group relative col-span-5 aspect-4/3 overflow-hidden border border-white/12 bg-[#161616]">
                <Image
                  src="/images/atelier/atelier-jacket-jp.jpg"
                  alt="Giacca denim dipinta a mano Do You Know JP"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover object-top transition duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/95">
                  Denim Art
                </span>
              </div>
            </div>
          </div>

          {/* Copy, pillars & CTAs */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">
                Metodo Artigianale
              </p>
            </div>

            <h2 className="mt-4 font-display text-5xl leading-[0.92] text-white sm:text-6xl md:text-7xl">
              Fatto a mano, venduto online
            </h2>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-[17px] sm:leading-8">
              <strong className="font-semibold text-white">
                Nessuna produzione industriale o stampa in serie.
              </strong>{" "}
              Ogni capo viene{" "}
              <em className="italic text-white">
                costruito, inciso, dipinto e rifinito a mano
              </em>{" "}
              in laboratorio usando il denim come una{" "}
              <strong className="font-semibold text-white">
                <em className="italic">tela viva</em>
              </strong>
              , prima di essere spedito direttamente a casa tua.
            </p>

            {/* Emphasized 100% Fatto a mano callout */}
            <div className="mt-7 flex items-center gap-5 border-l-4 border-red-600 bg-white/[0.04] px-5 py-4">
              <span className="font-display text-5xl leading-none text-white sm:text-6xl">
                100%
              </span>
              <div className="h-10 w-px bg-white/15" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-white sm:text-base">
                  Fatto a mano
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/80 sm:text-sm">
                  Lavorazione <em className="italic text-white">interamente artigianale</em> nel
                  laboratorio di{" "}
                  <strong className="font-semibold text-white">
                    Montesilvano (PE)
                  </strong>
                  .
                </p>
              </div>
            </div>

            {/* 4 Pillars Grid */}
            <div className="mt-7 grid gap-3.5 sm:grid-cols-2">
              <div className="border border-white/12 bg-white/[0.03] p-4 transition hover:border-white/25">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                    01 // Tiratura
                  </span>
                  <span className="h-1.5 w-1.5 bg-red-600" />
                </div>
                <h3 className="mt-2 text-sm font-bold uppercase tracking-wider text-white">
                  Pezzi unici o limited
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/75 sm:text-[13px]">
                  Ogni creazione ha <em className="italic text-white/95">sfumature, strappi e cuciture</em>{" "}
                  <strong className="font-semibold text-white">impossibili da replicare</strong>.
                </p>
              </div>

              <div className="border border-white/12 bg-white/[0.03] p-4 transition hover:border-white/25">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                    02 // Laboratorio
                  </span>
                  <span className="h-1.5 w-1.5 bg-red-600" />
                </div>
                <h3 className="mt-2 text-sm font-bold uppercase tracking-wider text-white">
                  Tattoo Clothing
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/75 sm:text-[13px]">
                  Denim lavorato con <strong className="font-semibold text-white">macchine da cucire vintage</strong>,{" "}
                  <em className="italic text-white/95">patchwork e pittura a mano</em>.
                </p>
              </div>

              <div className="border border-white/12 bg-white/[0.03] p-4 transition hover:border-white/25">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                    03 // Logistica
                  </span>
                  <span className="h-1.5 w-1.5 bg-red-600" />
                </div>
                <h3 className="mt-2 text-sm font-bold uppercase tracking-wider text-white">
                  Italia ed Europa
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/75 sm:text-[13px]">
                  Spedizioni veloci con <em className="italic text-white/95">corriere tracciato</em>,{" "}
                  <strong className="font-semibold text-white">gratuite sopra €100</strong>.
                </p>
              </div>

              <div className="border border-white/12 bg-white/[0.03] p-4 transition hover:border-white/25">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                    04 // Garanzia
                  </span>
                  <span className="h-1.5 w-1.5 bg-red-600" />
                </div>
                <h3 className="mt-2 text-sm font-bold uppercase tracking-wider text-white">
                  Checkout sicuro Stripe
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/75 sm:text-[13px]">
                  Pagamenti protetti con <strong className="font-semibold text-white">carte, Apple Pay e Google Pay</strong> con{" "}
                  <em className="italic text-white/95">assistenza diretta</em>.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-3 border-2 border-white bg-white px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.28em] text-black transition hover:bg-transparent hover:text-white"
              >
                Scopri i prodotti <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/denim-customize"
                className="inline-flex items-center justify-center gap-3 border border-white/25 px-7 py-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-white transition hover:border-red-500 hover:bg-red-600/10"
              >
                Richiedi un Custom
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
