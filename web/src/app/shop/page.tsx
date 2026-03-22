import Link from "next/link";
import Image from "next/image";

import { categories, products, formatPrice } from "@/lib/catalog";

export default function ShopPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="cement-bg cement-overlay relative">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Store</p>
          <h1 className="mt-2 font-display text-6xl text-white md:text-8xl">
            {products.length} pezzi unici
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/50">
            Ogni capo è realizzato nel laboratorio di Jacopo Peca. Denim, streetwear e hand-painting su piccole serie e pezzi unici.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        {/* Category filter bar */}
        <div className="flex flex-wrap gap-2 border-b border-white/8 pb-6">
          <Link
            href="/shop"
            className="border border-white/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-black"
          >
            Tutti ({products.length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?cat=${cat.slug}`}
              className="border border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-white/50 transition hover:border-white/30 hover:text-white"
            >
              {cat.name} ({cat.count})
            </Link>
          ))}
        </div>

        {/* Product grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const thumb = product.images.find((i) => i.isThumbnail) || product.images[0];
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group overflow-hidden border border-white/8 bg-[#111] transition hover:border-white/20"
              >
                <div className="relative aspect-[3/4] bg-[#1a1a1a]">
                  {thumb ? (
                    <Image
                      src={thumb.url}
                      alt={thumb.alt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-display text-5xl text-white/10">{product.name[0]}</span>
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    <span className="bg-black/60 px-2 py-1 text-[10px] uppercase tracking-widest text-white/80 backdrop-blur">
                      {product.categoryName}
                    </span>
                    {!product.inStock && (
                      <span className="bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Esaurito
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="font-display text-xl text-white">
                    {product.name}
                  </h2>
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
    </main>
  );
}
