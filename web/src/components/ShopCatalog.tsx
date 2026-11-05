"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "@/components/StoreImage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Search,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X,
} from "lucide-react";

import { formatPrice } from "@/lib/catalog";
import type { AppCategory, AppProduct } from "@/lib/product-data";

type ShopCatalogProps = {
  categories: AppCategory[];
  products: AppProduct[];
  totalInStock?: number;
};

type SortOption = "recommended" | "price-asc" | "price-desc" | "name-asc";

const CATEGORY_EDITORIAL: Record<
  string,
  { title: string; subtitle: string; highlight: string }
> = {
  "jeans-2": {
    title: "Jeans Handcrafted & Custom",
    subtitle:
      "Denim selezionato e trasformato a mano con strappi calibrati, patchwork, cuciture a vista e interventi pittorici.",
    highlight: "Ogni paio di jeans è lavorato singolarmente in laboratorio.",
  },
  "t-shirt": {
    title: "T-Shirt Streetwear Dipinte a Mano",
    subtitle:
      "Cotone strutturato, grafiche d'archivio, aerografo e dettagli tattoo clothing che rendono ogni maglia diversa dalle altre.",
    highlight: "Nessuna stampa industriale in serie: solo lavorazione manuale.",
  },
  sweatshirt: {
    title: "Felpe Custom & Limited Edition",
    subtitle:
      "Volumi streetwear, trattamenti manuali, inserti in tessuto, aerografo e cuciture artigianali eseguite in laboratorio.",
    highlight: "Pezzi caldi, strutturati e dal carattere urbano irripetibile.",
  },
  "giacca-denim": {
    title: "Giacche Denim Artigianali",
    subtitle:
      "Il capo manifesto di Jacopo Peca: giacche in denim usate come tele vive tra hand-painting, ricami Cornely e applicazioni.",
    highlight: "Pezzi iconici 1/1 pensati per durare e distinguersi.",
  },
  "camicia-jeans": {
    title: "Camicie Denim Lavorate a Mano",
    subtitle:
      "Camicie in denim reinterpretate con schizzi di colore, toppe, cuciture a contrasto e dettagli destroyed.",
    highlight: "Perfette da indossare aperte o come strato protagonista.",
  },
  "denim-shorts": {
    title: "Denim Shorts & Custom Pieces",
    subtitle:
      "Tagli netti, orli sfilacciati a mano e personalizzazioni grafiche per uno streetwear estivo autentico.",
    highlight: "Costruiti a mano a partire da basi denim selezionate.",
  },
  cappello: {
    title: "Cappelli & Bucket Hat Custom",
    subtitle:
      "Accessori streetwear ricamati, dipinti o ricostruiti in denim e bandana con lavorazione artigianale.",
    highlight: "Il dettaglio finale firmato in laboratorio.",
  },
};

export function ShopCatalog({
  categories,
  products,
  totalInStock,
}: ShopCatalogProps) {
  return (
    <Suspense
      fallback={
        <ShopCatalogContent
          categories={categories}
          products={products}
          totalInStock={totalInStock}
        />
      }
    >
      <ShopCatalogWithSearch
        categories={categories}
        products={products}
        totalInStock={totalInStock}
      />
    </Suspense>
  );
}

function ShopCatalogWithSearch({
  categories,
  products,
  totalInStock,
}: ShopCatalogProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("cat") ?? undefined;

  return (
    <ShopCatalogContent
      categories={categories}
      products={products}
      selectedCategory={selectedCategory}
      totalInStock={totalInStock}
    />
  );
}

function ShopCatalogContent({
  categories,
  products,
  selectedCategory,
  totalInStock,
}: ShopCatalogProps & { selectedCategory?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [previewedProducts, setPreviewedProducts] = useState<Set<string>>(() => new Set());
  const [loadedPreviews, setLoadedPreviews] = useState<Set<string>>(() => new Set());

  function loadPreview(id: string) {
    setPreviewedProducts((current) => current.has(id) ? current : new Set([...current, id]));
  }

  const activeCategoryObj = useMemo(
    () => categories.find((c) => c.slug === selectedCategory),
    [categories, selectedCategory]
  );

  const categoryProducts = useMemo(
    () =>
      selectedCategory
        ? products.filter((p) => p.categorySlug === selectedCategory)
        : products,
    [products, selectedCategory]
  );

  const availableSizes = useMemo(() => {
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "UNICA"];
    const set = new Set<string>();
    for (const p of categoryProducts) {
      for (const s of p.sizes) {
        if (s.stock > 0 && s.label) {
          set.add(s.label.toUpperCase());
        }
      }
    }
    return Array.from(set).sort((a, b) => {
      const ia = sizeOrder.indexOf(a);
      const ib = sizeOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [categoryProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = categoryProducts.filter((product) => {
      if (onlyInStock && !product.inStock) return false;

      if (selectedSize !== "ALL") {
        const hasSize = product.sizes.some(
          (s) => s.label.toUpperCase() === selectedSize && s.stock > 0
        );
        if (!hasSize) return false;
      }

      if (query) {
        const haystack =
          `${product.name} ${product.categoryName} ${product.description || ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "recommended") {
        // Put available products first so the top rows are immediately shoppable
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        return 0;
      }
      if (sortBy === "price-asc") {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        return a.priceCents - b.priceCents;
      }
      if (sortBy === "price-desc") {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        return b.priceCents - a.priceCents;
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name, "it");
      }
      return 0;
    });
  }, [categoryProducts, onlyInStock, selectedSize, searchQuery, sortBy]);

  const activeInStockCount = useMemo(
    () => categoryProducts.filter((p) => p.inStock).length,
    [categoryProducts]
  );

  const editorial = selectedCategory
    ? CATEGORY_EDITORIAL[selectedCategory]
    : undefined;

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || onlyInStock || selectedSize !== "ALL";

  return (
    <main className="flex flex-1 flex-col bg-[#0a0a0a]">
      {/* ── Editorial Store Hero ── */}
      <section className="cement-bg cement-overlay relative overflow-hidden border-b border-white/12">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/85" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-600/10 blur-[120px]"
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
            <Link
              href="/shop"
              className={
                selectedCategory
                  ? "transition hover:text-white"
                  : "font-semibold text-red-500"
              }
            >
              Store
            </Link>
            {activeCategoryObj && (
              <>
                <span className="text-white/30">/</span>
                <span className="font-semibold text-red-500">
                  {activeCategoryObj.name}
                </span>
              </>
            )}
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-500">
                  {activeCategoryObj
                    ? `Collezione // ${activeCategoryObj.name}`
                    : "Store Ufficiale // Archivio Artigianale"}
                </p>
              </div>

              <h1 className="mt-3 font-display text-5xl leading-[0.92] text-white sm:text-7xl md:text-8xl">
                {editorial
                  ? editorial.title
                  : activeCategoryObj
                    ? `${activeCategoryObj.name} — ${categoryProducts.length} Pezzi`
                    : `${products.length} Pezzi Unici`}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg sm:leading-8">
                {editorial ? (
                  <>
                    {editorial.subtitle}{" "}
                    <strong className="font-semibold text-white">
                      <em className="italic">{editorial.highlight}</em>
                    </strong>
                  </>
                ) : (
                  <>
                    Ogni capo è{" "}
                    <strong className="font-semibold text-white">
                      100% realizzato a mano
                    </strong>{" "}
                    nel laboratorio di{" "}
                    <strong className="font-semibold text-white">
                      Jacopo Peca
                    </strong>{" "}
                    a Montesilvano.{" "}
                    <em className="italic text-white">
                      Denim, streetwear, cuciture vintage e hand-painting
                    </em>{" "}
                    su piccole serie e{" "}
                    <strong className="font-semibold text-white">
                      pezzi unici irripetibili
                    </strong>
                    .
                  </>
                )}
              </p>

              {/* Value pills */}
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/85">
                <span className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.04] px-3.5 py-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <strong className="font-semibold text-white">
                    {activeInStockCount ?? totalInStock ?? categoryProducts.length}
                  </strong>{" "}
                  capi disponibili subito
                </span>
                <span className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.04] px-3.5 py-2 font-medium">
                  <Sparkles size={14} className="text-red-500" />
                  <strong className="font-semibold text-white">
                    100% Fatto a mano
                  </strong>{" "}
                  <em className="italic text-white/80">in Italia</em>
                </span>
                <span className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.04] px-3.5 py-2 font-medium">
                  <Truck size={14} className="text-red-500" />
                  Spedizione{" "}
                  <strong className="font-semibold text-white">
                    gratuita sopra €100
                  </strong>
                </span>
              </div>
            </div>

            {/* Right-side Custom Atelier Card */}
            <div className="lg:col-span-4">
              <div className="relative overflow-hidden border border-white/15 bg-[#121212]/90 p-5 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-500">
                      Su Misura // 1 of 1
                    </p>
                    <h2 className="mt-1 font-display text-3xl leading-none text-white">
                      Cerchi un pezzo solo tuo?
                    </h2>
                  </div>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-white/15">
                    <Image
                      src="/images/atelier/atelier-airbrush.jpg"
                      alt="Lavorazione custom Jacopo Peca"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-white/80">
                  Se un capo è esaurito o vuoi personalizzare{" "}
                  <em className="italic text-white">fit, lavaggio e pittura</em>,
                  puoi commissionare una{" "}
                  <strong className="font-semibold text-white">
                    customizzazione diretta in laboratorio
                  </strong>
                  .
                </p>
                <Link
                  href="/denim-customize"
                  className="mt-4 inline-flex w-full items-center justify-between border border-red-600/60 bg-red-600/15 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-red-600"
                >
                  Richiedi un Custom <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters, Categories & Search Toolbar ── */}
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
        {/* Category Navigation Pills */}
        <div
          aria-label="Filtra per categoria"
          className="flex flex-wrap items-center gap-2 border-b border-white/12 pb-6"
        >
          <Link
            href="/shop"
            onClick={() => setSelectedSize("ALL")}
            className={`inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition ${
              !selectedCategory
                ? "border-red-600 bg-red-600 text-white shadow-[0_0_20px_rgba(224,16,16,0.3)]"
                : "border-white/20 bg-[#141414] text-white/80 hover:border-white/50 hover:text-white"
            }`}
          >
            <span>Tutti</span>
            <span
              className={`px-1.5 py-0.5 text-[10px] ${
                !selectedCategory
                  ? "bg-black/30 text-white"
                  : "bg-white/10 text-white/75"
              }`}
            >
              {products.length}
            </span>
          </Link>

          {categories.map((category) => {
            const isActive = category.slug === selectedCategory;
            return (
              <Link
                key={category.slug}
                href={`/shop?cat=${category.slug}`}
                onClick={() => setSelectedSize("ALL")}
                className={`inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  isActive
                    ? "border-red-600 bg-red-600 text-white shadow-[0_0_20px_rgba(224,16,16,0.3)]"
                    : "border-white/20 bg-[#141414] text-white/80 hover:border-white/50 hover:text-white"
                }`}
              >
                <span>{category.name}</span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] ${
                    isActive
                      ? "bg-black/30 text-white"
                      : "bg-white/10 text-white/75"
                  }`}
                >
                  {category.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Search, Size, Availability & Sort Controls */}
        <div className="mt-5 flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca capo per nome o lavorazione (es. Military, Pray, Skull)..."
              aria-label="Cerca prodotti nello store"
              className="w-full border border-white/20 bg-[#141414] py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-white/45 focus:border-white/60 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Cancella ricerca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Size filter pills */}
            {availableSizes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  Taglia:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSize("ALL")}
                  className={`border px-2.5 py-1.5 text-xs font-bold uppercase transition ${
                    selectedSize === "ALL"
                      ? "border-white bg-white text-black"
                      : "border-white/20 bg-[#141414] text-white/75 hover:border-white/50 hover:text-white"
                  }`}
                >
                  Tutte
                </button>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setSelectedSize(selectedSize === size ? "ALL" : size)
                    }
                    className={`border px-2.5 py-1.5 text-xs font-bold uppercase transition ${
                      selectedSize === size
                        ? "border-white bg-white text-black"
                        : "border-white/20 bg-[#141414] text-white/75 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

            {/* In-stock toggle */}
            <button
              type="button"
              onClick={() => setOnlyInStock((v) => !v)}
              aria-pressed={onlyInStock}
              className={`inline-flex items-center gap-2 border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
                onlyInStock
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                  : "border-white/20 bg-[#141414] text-white/80 hover:border-white/45 hover:text-white"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center border ${
                  onlyInStock
                    ? "border-emerald-400 bg-emerald-500 text-black"
                    : "border-white/35"
                }`}
              >
                {onlyInStock && <Check size={11} strokeWidth={3} />}
              </span>
              Solo disponibili
            </button>

            {/* Sort select */}
            <div className="inline-flex items-center gap-2 border border-white/20 bg-[#141414] px-3 py-1.5">
              <SlidersHorizontal size={14} className="text-white/60" />
              <label htmlFor="shop-sort" className="sr-only">
                Ordina prodotti
              </label>
              <select
                id="shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-semibold uppercase tracking-[0.14em] text-white focus:outline-none"
              >
                <option value="recommended" className="bg-[#141414] text-white">
                  Disponibili prima
                </option>
                <option value="price-asc" className="bg-[#141414] text-white">
                  Prezzo: crescente
                </option>
                <option value="price-desc" className="bg-[#141414] text-white">
                  Prezzo: decrescente
                </option>
                <option value="name-asc" className="bg-[#141414] text-white">
                  Nome: A → Z
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Results status bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/75">
          <p>
            Mostrando{" "}
            <strong className="font-semibold text-white">
              {filteredProducts.length}
            </strong>{" "}
            {filteredProducts.length === 1 ? "capo unico" : "capi unici"}
            {activeCategoryObj && (
              <>
                {" "}
                in{" "}
                <strong className="font-semibold text-white">
                  {activeCategoryObj.name}
                </strong>
              </>
            )}
            {selectedSize !== "ALL" && (
              <>
                {" "}
                · Taglia{" "}
                <strong className="font-semibold text-white">
                  {selectedSize}
                </strong>
              </>
            )}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setOnlyInStock(false);
                setSelectedSize("ALL");
              }}
              className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-red-400 underline-offset-4 hover:text-red-300 hover:underline"
            >
              <X size={13} /> Azzera filtri
            </button>
          )}
        </div>

        {/* ── Product Grid ── */}
        {filteredProducts.length === 0 ? (
          <div className="mt-10 border border-white/12 bg-[#121212] p-12 text-center">
            <p className="font-display text-4xl text-white">
              Nessun capo trovato con questi filtri
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75">
              Prova a rimuovere il filtro taglia o ricerca, oppure{" "}
              <strong className="font-semibold text-white">
                commissiona direttamente in laboratorio
              </strong>{" "}
              il capo che hai in mente.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setOnlyInStock(false);
                  setSelectedSize("ALL");
                }}
                className="border-2 border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:bg-transparent hover:text-white"
              >
                Mostra tutti i capi
              </button>
              <Link
                href="/denim-customize"
                className="border border-white/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:border-red-500"
              >
                Richiedi un Custom
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-3.5 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const thumb =
                product.images.find((image) => image.isThumbnail) ||
                product.images[0];
              const secondaryImage =
                product.images.find((image) => image !== thumb) || undefined;
              const inStockSizes = product.sizes.filter((s) => s.stock > 0);

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") loadPreview(product.id);
                  }}
                  onFocus={() => loadPreview(product.id)}
                  className={`group flex flex-col overflow-hidden border border-white/12 bg-[#111] transition duration-300 hover:border-white/35 ${
                    !product.inStock ? "opacity-80" : ""
                  }`}
                >
                  {/* Image container with secondary hover crossfade */}
                  <div className="relative aspect-3/4 overflow-hidden bg-[#181818]">
                    {thumb ? (
                      <>
                        <Image
                          src={thumb.url}
                          alt={thumb.alt || `${product.name} — Jacopo Peca`}
                          fill
                          className={`object-cover transition duration-700 ${
                            secondaryImage && loadedPreviews.has(product.id)
                              ? "group-hover:opacity-0"
                              : "group-hover:scale-105"
                          }`}
                          sizes="(max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 300px"
                        />
                        {secondaryImage && previewedProducts.has(product.id) && (
                          <Image
                            src={secondaryImage.url}
                            alt={
                              secondaryImage.alt ||
                              `${product.name} dettaglio — Jacopo Peca`
                            }
                            fill
                            onLoad={() => setLoadedPreviews((current) => new Set([...current, product.id]))}
                            className="object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                            sizes="(max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 300px"
                          />
                        )}
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="font-display text-5xl text-white/15">
                          {product.name[0]}
                        </span>
                      </div>
                    )}

                    {/* Top badges */}
                    <div className="absolute left-2.5 right-2.5 top-2.5 flex items-start justify-between gap-2">
                      <span className="border border-white/15 bg-black/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        {product.categoryName}
                      </span>
                      {!product.inStock ? (
                        <span className="bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                          Esaurito
                        </span>
                      ) : (
                        <span className="border border-emerald-500/40 bg-black/80 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-sm">
                          1/1 Disponibile
                        </span>
                      )}
                    </div>

                    {/* Hover CTA bar */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 pt-8 transition-transform duration-300 group-hover:translate-y-0">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                        Scopri il pezzo <ArrowUpRight size={14} className="text-red-500" />
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <h2 className="font-display text-2xl leading-tight text-white transition group-hover:text-red-400 sm:text-[26px]">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-[11px] italic text-white/65">
                        Lavorato a mano in laboratorio
                      </p>
                    </div>

                    <div className="mt-4 border-t border-white/10 pt-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-base font-bold text-white">
                          {formatPrice(product.priceCents)}
                        </p>
                        {product.salePrice && (
                          <p className="text-xs text-white/40 line-through">
                            {formatPrice(product.salePrice)}
                          </p>
                        )}
                      </div>

                      {/* Available size pills */}
                      {inStockSizes.length > 0 ? (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1">
                          <span className="mr-1 text-[10px] uppercase tracking-wider text-white/55">
                            Taglie:
                          </span>
                          {inStockSizes.map((s) => (
                            <span
                              key={s.label}
                              className="border border-white/20 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white/90"
                            >
                              {s.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                          Pezzo esaurito · Richiedi replica custom
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── SEO & Brand Storytelling Footer Section ── */}
        <section className="mt-20 border-t border-white/12 pt-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-500">
                Autenticità &amp; Metodo // Jacopo Peca
              </p>
              <h2 className="mt-3 font-display text-4xl text-white sm:text-5xl">
                Denim Streetwear Artigianale Fatto a Mano in Italia
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
                Ogni articolo presente nello{" "}
                <strong className="font-semibold text-white">
                  Store Ufficiale Jacopo Peca
                </strong>{" "}
                è il risultato di ore di lavoro manuale nel laboratorio di{" "}
                <strong className="font-semibold text-white">
                  Montesilvano (Pescara)
                </strong>
                . A differenza del fast fashion e dello streetwear stampato in
                serie, ogni{" "}
                <em className="italic text-white">
                  jeans, giacca denim, felpa, camicia o t-shirt
                </em>{" "}
                viene inciso, cucito con macchine d&apos;epoca, aerografato e
                dipinto a mano.
              </p>
              <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
                Acquistare un capo{" "}
                <strong className="font-semibold text-white">JP</strong>{" "}
                significa indossare un{" "}
                <strong className="font-semibold text-white">
                  <em className="italic">pezzo unico o in tiratura limitata</em>
                </strong>
                , spedito direttamente dal tavolo da lavoro a casa tua con{" "}
                <strong className="font-semibold text-white">
                  corriere tracciato in tutta Italia ed Europa
                </strong>{" "}
                e pagamenti protetti tramite{" "}
                <strong className="font-semibold text-white">Stripe</strong>.
              </p>
            </div>

            <div className="border border-white/15 bg-[#121212] p-6 sm:p-8 lg:col-span-5">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-500">
                Denim Customize
              </p>
              <h3 className="mt-2 font-display text-3xl text-white sm:text-4xl">
                Hai visto un capo esaurito o non trovi la tua taglia?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Poiché ogni creazione è un{" "}
                <strong className="font-semibold text-white">pezzo 1/1</strong>,
                le taglie disponibili sono limitate. Puoi però scrivermi per{" "}
                <em className="italic text-white">
                  commissionare una lavorazione simile sulla tua taglia
                </em>{" "}
                o trasformare un tuo capo in denim.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/denim-customize"
                  className="inline-flex items-center gap-2 border-2 border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:bg-transparent hover:text-white"
                >
                  Commissiona un Custom <ArrowUpRight size={16} />
                </Link>
                <Link
                  href="/contatti"
                  className="inline-flex items-center gap-2 border border-white/25 px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:border-white"
                >
                  Contatta il laboratorio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
