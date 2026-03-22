import Link from "next/link";
import Image from "next/image";

import { categories, getFeaturedProducts, formatPrice } from "@/lib/catalog";

export default function HomePage() {
  const featured = getFeaturedProducts(8);

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero — video background */}
      <section className="relative flex min-h-[90vh] items-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="/wp-content/uploads/2024/05/document_5913386766420677671.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-sm uppercase tracking-[0.5em] text-white/50">
            Handcrafted Denim Streetwear
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-7xl leading-none text-white md:text-[8rem] lg:text-[10rem]">
            MADE IN MY STORE
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
            Tutti i nostri capi sono fatti a mano nel mio store, garantendo
            qualità e autenticità. Lavoriamo con passione ogni giorno per
            offrire capi streetwear unici.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="inline-block border-2 border-white bg-white px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.3em] text-black transition hover:bg-transparent hover:text-white"
            >
              Vai allo Store
            </Link>
            <Link
              href="/about"
              className="inline-block border-2 border-white/30 px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.3em] text-white/80 transition hover:border-white hover:text-white"
            >
              Chi sono
            </Link>
          </div>
        </div>
      </section>

      {/* Categories strip */}
      <section className="border-y border-white/5 bg-[#111]">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <p className="text-xs uppercase tracking-[0.4em] text-white/30">
            Categorie
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?cat=${cat.slug}`}
                className="group border border-white/8 bg-white/[0.02] p-5 transition hover:bg-white/5"
              >
                <p className="font-display text-2xl text-white group-hover:text-white md:text-3xl">
                  {cat.name}
                </p>
                <p className="mt-2 text-xs text-white/30">
                  {cat.count} prodotti
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-black">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/30">
                Featured
              </p>
              <h2 className="mt-2 font-display text-5xl text-white md:text-7xl">
                I pezzi del momento
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm uppercase tracking-widest text-white/40 transition hover:text-white"
            >
              Vedi tutti &rarr;
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => {
              const thumb =
                product.images.find((i) => i.isThumbnail) || product.images[0];
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group overflow-hidden border border-white/8 bg-[#111] transition hover:border-white/20"
                >
                  <div className="relative aspect-[3/4] bg-[#1a1a1a]">
                    {thumb && (
                      <Image
                        src={thumb.url}
                        alt={thumb.alt}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-white/30">
                      {product.categoryName}
                    </p>
                    <h3 className="mt-1 font-display text-xl text-white">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/80">
                        {formatPrice(product.priceCents)}
                      </p>
                      {product.sizes.length > 0 && (
                        <p className="text-[10px] text-white/30">
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

      {/* About strip — with hero image background */}
      <section className="relative overflow-hidden">
        <Image
          src="/wp-content/uploads/2024/01/IMG_4158-scaled.webp"
          alt="Jacopo Peca Atelier"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">
              L&apos;atelier
            </p>
            <h2 className="mt-3 font-display text-5xl text-white md:text-7xl">
              Fatto a mano, venduto online
            </h2>
            <ul className="mt-8 space-y-4 text-base leading-relaxed text-white/60">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 bg-white/40" />
                Ogni pezzo è unico o in serie limitata.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 bg-white/40" />
                Denim lavorato e dipinto a mano in laboratorio.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 bg-white/40" />
                Spedizioni in tutta Italia ed Europa.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 bg-white/40" />
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
