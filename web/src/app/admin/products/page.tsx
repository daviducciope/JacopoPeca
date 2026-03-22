"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { products, categories, formatPrice } from "@/lib/catalog";
import { stripePrices } from "@/lib/stripe-prices";

type SortKey = "name" | "price" | "category" | "stock";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  const filtered = useMemo(() => {
    let result = products;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.slug.includes(q)
      );
    }
    if (catFilter !== "all") result = result.filter((p) => p.categorySlug === catFilter);
    if (stockFilter === "in") result = result.filter((p) => p.inStock);
    if (stockFilter === "out") result = result.filter((p) => !p.inStock);

    return [...result].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "price") return b.priceCents - a.priceCents;
      if (sortKey === "category") return a.categoryName.localeCompare(b.categoryName);
      if (sortKey === "stock") return Number(b.inStock) - Number(a.inStock);
      return 0;
    });
  }, [search, catFilter, stockFilter, sortKey]);

  const stripeConfigured = filtered.filter((p) => stripePrices[p.slug]).length;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/30">Superadmin</p>
          <h1 className="mt-1 font-display text-4xl text-white">Gestione prodotti</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="border border-white/12 px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white">
            Dashboard
          </Link>
          <Link href="/shop" className="border border-white/12 px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white">
            Shop
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 border border-white/8 bg-[#111] p-6 lg:flex-row lg:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca prodotto, SKU..."
          className="flex-1 border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
        >
          <option value="all">Tutte le categorie</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name} ({c.count})</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as "all" | "in" | "out")}
          className="border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
        >
          <option value="all">Tutti gli stati</option>
          <option value="in">In stock</option>
          <option value="out">Esauriti</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
        >
          <option value="name">Ordina: Nome</option>
          <option value="price">Ordina: Prezzo</option>
          <option value="category">Ordina: Categoria</option>
          <option value="stock">Ordina: Stock</option>
        </select>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        <span className="border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white">
          {filtered.length} prodotti
        </span>
        <span className="border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-400">
          {filtered.filter((p) => p.inStock).length} in stock
        </span>
        <span className="border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-400">
          {filtered.filter((p) => !p.inStock).length} esauriti
        </span>
        <span className="border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/60">
          {stripeConfigured}/{filtered.length} con Stripe
        </span>
      </div>

      {/* Product table */}
      <div className="overflow-hidden border border-white/8 bg-[#111]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Prodotto</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Categoria</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Prezzo</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Stock</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Taglie</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Stripe</th>
                <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const thumb = product.images.find((i) => i.isThumbnail) || product.images[0];
                const hasPriceId = !!stripePrices[product.slug];
                return (
                  <tr key={product.id} className="border-b border-white/5 transition hover:bg-white/3">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {thumb && (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden border border-white/8 bg-[#1a1a1a]">
                            <Image src={thumb.url} alt={product.name} fill className="object-cover" sizes="40px" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-white/30">{product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/60">
                        {product.categoryName}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {formatPrice(product.priceCents)}
                    </td>
                    <td className="px-5 py-4">
                      {product.inStock ? (
                        <span className="border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">Disponibile</span>
                      ) : (
                        <span className="border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-xs font-semibold text-red-400">Esaurito</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-white/40">
                      {product.sizes.length > 0
                        ? product.sizes.map((s) => s.label).join(", ")
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {hasPriceId ? (
                        <span className="border border-purple-400/30 bg-purple-400/10 px-2.5 py-1 text-xs font-semibold text-purple-400">Attivo</span>
                      ) : (
                        <span className="border border-white/8 bg-white/3 px-2.5 py-1 text-xs font-semibold text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/product/${product.slug}`}
                        className="text-xs font-semibold text-white/60 underline-offset-4 hover:text-white hover:underline"
                      >
                        Vedi
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
