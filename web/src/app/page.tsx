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
          poster="/wp-content/uploads/2023/09/about.jpeg"
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

      {/* About strip */}
      <section className="relative overflow-hidden border-t border-white/8 bg-[#0d0d0d]">

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 md:grid-cols-2 md:items-center lg:gap-20 lg:px-10 lg:py-24">
          <div className="relative aspect-4/5 overflow-hidden bg-[#1a1a1a]">
            <Image src="/wp-content/uploads/2023/09/about.jpeg" alt="Jacopo Peca nel suo laboratorio" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" />
            <span className="absolute bottom-5 left-5 bg-black px-4 py-2 text-xs uppercase tracking-widest text-white">L’atelier / Jacopo Peca</span>
          </div>
          <div className="max-w-2xl">
            <h2 className="mt-3 font-display text-5xl text-white md:text-7xl">
              Fatto a mano, venduto online
            </h2>
            <ul className="mt-8 space-y-4 text-base leading-relaxed text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1.5 w-1.5 shrink-0 bg-red-600" />
                Ogni pezzo è unico o in serie limitata.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1.5 w-1.5 shrink-0 bg-red-600" />
                Denim lavorato e dipinto a mano in laboratorio.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1.5 w-1.5 shrink-0 bg-red-600" />
                Spedizioni in tutta Italia ed Europa.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1.5 w-1.5 shrink-0 bg-red-600" />
                Checkout sicuro con Stripe.
              </li>
            </ul>
            <Link
              href="/shop"
              className="mt-10 inline-block border-2 border-white bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.3em] text-black transition hover:bg-transparent hover:text-white"
            >
              Scopri i prodotti
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
