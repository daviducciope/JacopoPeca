import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";

import { formatPrice } from "@/lib/catalog";
import type { AppProduct } from "@/lib/product-data";

type HomeDropProps = {
  products: AppProduct[];
};

function sizeLabel(product: AppProduct): string | null {
  if (product.sizes.length === 0) return null;
  if (product.sizes.length === 1) {
    const label = product.sizes[0]?.label.trim() ?? "";
    if (!label || label === "1" || label.toLowerCase() === "unica") return "Taglia unica";
    return label;
  }
  return `${product.sizes.length} taglie`;
}

export function HomeDrop({ products }: HomeDropProps) {
  if (products.length === 0) return null;

  return (
    <section className="home-drop border-t border-white/10 bg-black" aria-labelledby="home-drop-title">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-10 lg:py-24">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-red-500">Dal laboratorio</p>
            <h2
              id="home-drop-title"
              className="mt-2 font-display text-[3.25rem] leading-[0.82] text-white sm:text-7xl lg:text-8xl"
            >
              I pezzi
              <br />
              del momento
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              Denim, felpe, tee e accessori dallo stesso banco. Una selezione mista, non una vetrina di un solo capo.
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45 md:hidden">
              Scorri di lato
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden min-h-11 items-center gap-3 self-start border-b border-white/40 text-xs uppercase tracking-widest text-white transition hover:border-red-500 lg:inline-flex"
          >
            Tutto lo store <MoveRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className="home-drop-rail mt-6 md:mt-10" aria-label="Selezione mista di prodotti">
          {products.map((product, index) => {
            const thumb = product.images.find((image) => image.isThumbnail) || product.images[0];
            const sizes = sizeLabel(product);

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="home-drop-card group"
              >
                <div className="home-drop-media relative overflow-hidden bg-[#141414]">
                  {thumb ? (
                    <Image
                      src={thumb.url}
                      alt={thumb.alt || product.name}
                      fill
                      className="object-cover transition duration-700 motion-safe:group-hover:scale-[1.04]"
                      sizes="(max-width: 767px) 82vw, (max-width: 1023px) 50vw, 34vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-display text-6xl text-white/15">{product.name.slice(0, 1)}</span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/55 to-transparent" />
                  <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-1.5">
                    <span className="bg-black/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black">
                      {product.categoryName}
                    </span>
                  </div>
                  {!product.inStock && (
                    <span className="absolute bottom-3 right-3 bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Esaurito
                    </span>
                  )}
                </div>
                <div className="home-drop-meta">
                  <h3 className="line-clamp-2 font-display text-[2.35rem] leading-[0.86] text-white md:text-[2rem] lg:text-[2.15rem]">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{formatPrice(product.priceCents)}</p>
                    {sizes && (
                      <p className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-white/55">{sizes}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/shop"
          className="home-primary mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 px-6 text-xs font-semibold uppercase tracking-[0.22em] md:hidden"
        >
          Tutto lo store <MoveRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
