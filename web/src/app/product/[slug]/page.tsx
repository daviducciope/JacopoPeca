import Link from "next/link";
import Image from "next/image";

import { formatPrice } from "@/lib/catalog";
import { getRelatedStorefrontProducts, getStorefrontProductBySlug, getStorefrontProducts } from "@/lib/product-data";
import { ensureDynamicRendering } from "@/lib/render-mode";
import AddToCartButton from "@/components/AddToCartButton";

export async function generateStaticParams() {
  const products = await getStorefrontProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);
  if (!product) return { title: "Prodotto non trovato" };
  return {
    title: `${product.name} — Jacopo Peca`,
    description: `${product.categoryName} handmade — ${formatPrice(product.priceCents)}`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await ensureDynamicRendering();

  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-20">
        <h1 className="font-display text-5xl text-white">Prodotto non trovato</h1>
        <Link href="/shop" className="border-2 border-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black">
          Torna allo shop
        </Link>
      </main>
    );
  }

  const related = await getRelatedStorefrontProducts(product.categorySlug, product.id, 4);

  const thumbnail = product.images.find((i) => i.isThumbnail) || product.images[0];
  const gallery = product.images.filter((i) => !i.isThumbnail).slice(0, 5);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/30">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/shop" className="transition hover:text-white">Shop</Link>
          <span>/</span>
          <Link href={`/shop?cat=${product.categorySlug}`} className="transition hover:text-white">
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-white/60">{product.name}</span>
        </nav>

        {/* Product hero */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Gallery */}
          <div className="space-y-3">
            {thumbnail && (
              <div className="relative aspect-4/5 overflow-hidden border border-white/8 bg-[#111]">
                <Image
                  src={thumbnail.url}
                  alt={thumbnail.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                />
              </div>
            )}
            {gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden border border-white/8 bg-[#111]"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 33vw, 18vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/30">
                {product.categoryName}
              </p>
              <h1 className="mt-2 font-display text-5xl text-white md:text-7xl">
                {product.name}
              </h1>
            </div>

            <div className="flex items-end gap-4">
              <p className="text-3xl font-semibold text-white">
                {formatPrice(product.priceCents)}
              </p>
              {product.salePrice && (
                <p className="text-lg text-white/30 line-through">
                  {formatPrice(product.salePrice)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {product.inStock ? (
                <span className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  Disponibile
                </span>
              ) : (
                <span className="border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                  Esaurito
                </span>
              )}
              {product.sku && (
                <span className="text-xs text-white/30">SKU: {product.sku}</span>
              )}
            </div>

            {/* Add to cart */}
            <AddToCartButton
              productId={product.id}
              slug={product.slug}
              name={product.name}
              priceCents={product.priceCents}
              image={thumbnail?.url ?? ""}
              inStock={product.inStock}
              sizes={product.sizes}
            />

            {/* Details box */}
            <div className="mt-4 space-y-4 border border-white/8 bg-[#111] p-6">
              <div className="flex items-center gap-3 text-sm text-white/50">
                <span className="font-semibold text-white">Categoria:</span>
                <Link
                  href={`/shop?cat=${product.categorySlug}`}
                  className="underline-offset-2 hover:underline hover:text-white"
                >
                  {product.categoryName}
                </Link>
              </div>
              <div className="text-sm leading-7 text-white/50">
                <p className="font-semibold text-white">Dettagli</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Realizzato a mano nel laboratorio Jacopo Peca</li>
                  <li>Made in Italy</li>
                  <li>Materiali selezionati</li>
                  {product.sizes.length > 0 && (
                    <li>
                      Taglie: {product.sizes.map((s) => s.label).join(", ")}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-4xl text-white">
              Nella stessa categoria
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((p) => {
                const thumb = p.images.find((i) => i.isThumbnail) || p.images[0];
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="group overflow-hidden border border-white/8 bg-[#111] transition hover:border-white/20"
                  >
                    <div className="relative aspect-3/4 bg-[#1a1a1a]">
                      {thumb && (
                        <Image
                          src={thumb.url}
                          alt={thumb.alt}
                          fill
                          className="object-cover transition group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-widest text-white/30">
                        {p.categoryName}
                      </p>
                      <h3 className="mt-1 font-display text-xl text-white">
                        {p.name}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-white/80">
                        {formatPrice(p.priceCents)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
