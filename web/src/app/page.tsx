import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowDown, MoveRight } from "lucide-react";

import { formatPrice } from "@/lib/catalog";
import { getFeaturedStorefrontProducts, getStorefrontCategories } from "@/lib/product-data";
import { ensureDynamicRendering } from "@/lib/render-mode";

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
        <video
          poster="/images/atelier/atelier-embroidery.jpg"
          preload="metadata"
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        >
          <source src="/wp-content/uploads/2023/09/NQIW5815.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.3),rgba(0,0,0,0.7))]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
          <h1 className="home-title font-display text-white">
            MADE IN<br />MY <span>STORE</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            Tutti i nostri capi sono fatti a mano nel mio store, garantendo
            qualità e autenticità. Lavoriamo con passione ogni giorno per
            offrire capi streetwear unici.
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
                href={`/shop?cat=${cat.slug}`}
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

      {/* Featured products */}
      <section className="bg-black">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-5xl text-white md:text-7xl">
                I pezzi del momento
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center gap-3 self-start border-b border-white/40 text-xs uppercase tracking-widest text-white transition hover:border-red-500"
            >
              Vedi tutti <MoveRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {featured.map((product) => {
              const thumb =
                product.images.find((i) => i.isThumbnail) || product.images[0];
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="home-product group min-w-0"
                >
                  <div className="relative aspect-3/4 overflow-hidden bg-[#1a1a1a]">
                    {thumb && (
                      <Image
                        src={thumb.url}
                        alt={thumb.alt}
                        fill
                        className="object-cover transition duration-500 motion-safe:group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                    {!product.inStock && (
                      <div className="absolute right-3 top-3">
                        <span className="bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                          Esaurito
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="border-b border-white/20 pb-4 pt-4">
                    <p className="text-[10px] uppercase tracking-widest text-white/65">
                      {product.categoryName}
                    </p>
                    <h3 className="mt-1 font-display text-2xl leading-tight text-white sm:text-3xl">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/80">
                        {formatPrice(product.priceCents)}
                      </p>
                      {product.sizes.length > 0 && (
                        <p className="text-[10px] text-white/65">
                          {product.sizes.length} taglie
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

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
                  <p className="max-w-md text-xs leading-relaxed text-white/85 sm:text-sm">
                    &ldquo;A colpi di strappi, cuciture e tattoo clothing do vita a pezzi con un&apos;identità irripetibile.&rdquo;
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
                <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90">
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
                <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90">
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

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Nessuna produzione industriale o stampa in serie. Ogni capo viene
              costruito, inciso, dipinto e rifinito a mano in laboratorio usando
              il denim come una tela viva, prima di essere spedito direttamente
              a casa tua.
            </p>

            {/* 4 Pillars Grid */}
            <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
              <div className="border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/25">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                    01 // Tiratura
                  </span>
                  <span className="h-1.5 w-1.5 bg-red-600" />
                </div>
                <h3 className="mt-2 text-sm font-semibold uppercase tracking-wider text-white">
                  Pezzi unici o limited
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  Ogni creazione ha sfumature, strappi e cuciture impossibili da replicare.
                </p>
              </div>

              <div className="border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/25">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                    02 // Laboratorio
                  </span>
                  <span className="h-1.5 w-1.5 bg-red-600" />
                </div>
                <h3 className="mt-2 text-sm font-semibold uppercase tracking-wider text-white">
                  Tattoo Clothing
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  Denim lavorato con macchine da cucire vintage, patchwork e pittura a mano.
                </p>
              </div>

              <div className="border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/25">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                    03 // Logistica
                  </span>
                  <span className="h-1.5 w-1.5 bg-red-600" />
                </div>
                <h3 className="mt-2 text-sm font-semibold uppercase tracking-wider text-white">
                  Italia ed Europa
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  Spedizioni veloci con corriere tracciato, gratuite per ordini sopra €100.
                </p>
              </div>

              <div className="border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/25">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                    04 // Garanzia
                  </span>
                  <span className="h-1.5 w-1.5 bg-red-600" />
                </div>
                <h3 className="mt-2 text-sm font-semibold uppercase tracking-wider text-white">
                  Checkout sicuro Stripe
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  Pagamenti protetti con carte, Apple Pay, Google Pay e assistenza diretta.
                </p>
              </div>
            </div>

            {/* Stats & CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6">
              <div>
                <p className="font-display text-3xl text-white">100%</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                  Fatto a mano
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="font-display text-3xl text-white">500+</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                  Capi realizzati
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="font-display text-3xl text-white">1/1</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                  Custom su misura
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
