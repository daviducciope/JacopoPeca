"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { startTransition, useDeferredValue, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/catalog";
import type { AdminProductsPageData, AppCategory, AppProduct } from "@/lib/product-data";

type SortKey = "name" | "price" | "category" | "stock" | "status";
type StockFilter = "all" | "in" | "out";
type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  priceCents: string;
  sku: string;
  imageUrl: string;
  imageAlt: string;
  stock: string;
  sizesText: string;
  status: ProductStatus;
  featured: boolean;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  priceCents: "",
  sku: "",
  imageUrl: "",
  imageAlt: "",
  stock: "0",
  sizesText: "",
  status: "DRAFT",
  featured: false,
};

export function AdminProductsManager({
  initialProducts,
  categories,
  databaseEnabled,
  usingFallbackData,
}: {
  initialProducts: AdminProductsPageData["products"];
  categories: AdminProductsPageData["categories"];
  databaseEnabled: boolean;
  usingFallbackData: boolean;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(buildEmptyForm(categories, databaseEnabled));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filteredProducts = [...products]
    .filter((product) => {
      if (!normalizedSearch) {
        return true;
      }

      return [product.name, product.slug, product.sku ?? ""].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    })
    .filter((product) => catFilter === "all" || product.categoryId === catFilter)
    .filter((product) => {
      if (stockFilter === "all") {
        return true;
      }

      return stockFilter === "in" ? product.inStock : !product.inStock;
    })
    .sort((left, right) => {
      if (sortKey === "name") return left.name.localeCompare(right.name);
      if (sortKey === "price") return right.priceCents - left.priceCents;
      if (sortKey === "category") return left.categoryName.localeCompare(right.categoryName);
      if (sortKey === "stock") return Number(right.inStock) - Number(left.inStock);
      return left.status.localeCompare(right.status);
    });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        priceCents: Number(form.priceCents),
        stock: Number(form.stock),
      };

      const response = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Operazione non riuscita.");
      }

      const saved = result.product as AppProduct;
      startTransition(() => {
        setProducts((current) => {
          const next = current.filter((product) => product.id !== saved.id);
          return [saved, ...next];
        });
      });

      setEditingId(null);
      setForm(buildEmptyForm(categories, databaseEnabled));
      setSuccess(editingId ? "Prodotto aggiornato." : "Prodotto creato.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Errore inatteso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(productId: string) {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Archiviazione non riuscita.");
      }

      const archived = result.product as AppProduct;
      startTransition(() => {
        setProducts((current) => current.map((product) => (product.id === archived.id ? archived : product)));
      });
      setSuccess("Prodotto archiviato.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Errore inatteso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function beginEdit(product: AppProduct) {
    setEditingId(product.id);
    setError(null);
    setSuccess(null);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.categoryId,
      priceCents: String(product.priceCents),
      sku: product.sku ?? "",
      imageUrl: product.images[0]?.url ?? "",
      imageAlt: product.images[0]?.alt ?? "",
      stock: String(product.sizes.reduce((sum, size) => sum + size.stock, 0)),
      sizesText: product.sizes.map((size) => size.label).join(", "),
      status: normalizeStatus(product.status),
      featured: product.featured,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(buildEmptyForm(categories, databaseEnabled));
    setError(null);
    setSuccess(null);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/30">Superadmin</p>
          <h1 className="mt-1 font-display text-4xl text-white">Gestione prodotti</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            CRUD prodotti con persistenza Prisma. In assenza di database resta disponibile il fallback in lettura, ma non puoi salvare modifiche.
          </p>
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

      {(!databaseEnabled || usingFallbackData) && (
        <section className="border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
          {!databaseEnabled
            ? "DATABASE_URL non configurato: puoi consultare il catalogo di fallback ma non creare o aggiornare prodotti."
            : "Il database non e raggiungibile: vedi il catalogo statico di fallback, ma il CRUD e disabilitato finche la connessione non torna disponibile."}
        </section>
      )}

      <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="border border-white/8 bg-[#111] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/30">Editor</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{editingId ? "Modifica prodotto" : "Nuovo prodotto"}</h2>
            </div>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="border border-white/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/8 hover:text-white">
                Annulla
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Nome"><input value={form.name} onChange={(event) => updateForm(setForm, "name", event.target.value)} className="input-admin" /></Field>
            <Field label="Slug"><input value={form.slug} onChange={(event) => updateForm(setForm, "slug", event.target.value)} className="input-admin" /></Field>
            <Field label="Categoria">
              <select value={form.categoryId} onChange={(event) => updateForm(setForm, "categoryId", event.target.value)} className="input-admin">
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Prezzo in centesimi"><input type="number" min="50" value={form.priceCents} onChange={(event) => updateForm(setForm, "priceCents", event.target.value)} className="input-admin" /></Field>
            <Field label="SKU"><input value={form.sku} onChange={(event) => updateForm(setForm, "sku", event.target.value)} className="input-admin" /></Field>
            <Field label="Stock totale"><input type="number" min="0" value={form.stock} onChange={(event) => updateForm(setForm, "stock", event.target.value)} className="input-admin" /></Field>
            <Field label="Immagine URL"><input value={form.imageUrl} onChange={(event) => updateForm(setForm, "imageUrl", event.target.value)} className="input-admin" /></Field>
            <Field label="Testo alternativo"><input value={form.imageAlt} onChange={(event) => updateForm(setForm, "imageAlt", event.target.value)} className="input-admin" /></Field>
            <Field label="Taglie separate da virgola" className="md:col-span-2"><input value={form.sizesText} onChange={(event) => updateForm(setForm, "sizesText", event.target.value)} className="input-admin" /></Field>
            <Field label="Descrizione" className="md:col-span-2"><textarea value={form.description} onChange={(event) => updateForm(setForm, "description", event.target.value)} className="input-admin min-h-32" /></Field>
            <Field label="Stato">
              <select value={form.status} onChange={(event) => updateForm(setForm, "status", event.target.value as ProductStatus)} className="input-admin">
                <option value="DRAFT">Bozza</option>
                <option value="ACTIVE">Attivo</option>
                <option value="ARCHIVED">Archiviato</option>
              </select>
            </Field>
            <label className="flex items-center gap-3 text-sm text-white/70 md:self-end">
              <input type="checkbox" checked={form.featured} onChange={(event) => updateForm(setForm, "featured", event.target.checked)} className="h-4 w-4 accent-white" />
              In evidenza in homepage
            </label>
          </div>

          {(error || success) && (
            <div className={`mt-5 border px-4 py-3 text-sm ${error ? "border-red-400/20 bg-red-400/10 text-red-100" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"}`}>
              {error || success}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button disabled={isSubmitting || !databaseEnabled || usingFallbackData} className="border-2 border-white bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-white/10 disabled:text-white/30">
              {isSubmitting ? "Salvataggio..." : editingId ? "Aggiorna prodotto" : "Crea prodotto"}
            </button>
            <button type="button" disabled={isSubmitting} onClick={cancelEdit} className="border border-white/12 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:text-white/25">
              Reset
            </button>
          </div>
        </form>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 border border-white/8 bg-[#111] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cerca nome, slug o SKU" className="input-admin flex-1" />
              <select value={catFilter} onChange={(event) => setCatFilter(event.target.value)} className="input-admin lg:w-52">
                <option value="all">Tutte le categorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name} ({category.count})</option>
                ))}
              </select>
              <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value as StockFilter)} className="input-admin lg:w-44">
                <option value="all">Tutti gli stati</option>
                <option value="in">In stock</option>
                <option value="out">Esauriti</option>
              </select>
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="input-admin lg:w-48">
                <option value="name">Ordina per nome</option>
                <option value="price">Ordina per prezzo</option>
                <option value="category">Ordina per categoria</option>
                <option value="stock">Ordina per stock</option>
                <option value="status">Ordina per stato</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <span className="border border-white/10 bg-white/5 px-4 py-2 text-white">{filteredProducts.length} prodotti</span>
              <span className="border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-emerald-300">{filteredProducts.filter((product) => product.inStock).length} in stock</span>
              <span className="border border-red-400/30 bg-red-400/10 px-4 py-2 text-red-300">{filteredProducts.filter((product) => !product.inStock).length} esauriti</span>
            </div>
          </div>

          <div className="overflow-hidden border border-white/8 bg-[#111]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/3">
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Prodotto</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Categoria</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Prezzo</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Stato</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Taglie</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const thumb = product.images.find((image) => image.isThumbnail) ?? product.images[0];

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
                              <p className="text-xs text-white/30">{product.sku || product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className="border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/60">{product.categoryName}</span></td>
                        <td className="px-5 py-4 font-semibold text-white">{formatPrice(product.priceCents)}</td>
                        <td className="px-5 py-4"><span className={`border px-2.5 py-1 text-xs font-semibold ${statusClassName(product.status, product.inStock)}`}>{statusLabel(product.status, product.inStock)}</span></td>
                        <td className="px-5 py-4 text-white/40">{product.sizes.length > 0 ? product.sizes.map((size) => size.label).join(", ") : "UNI"}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
                            <button type="button" onClick={() => beginEdit(product)} className="text-white/60 transition hover:text-white">Modifica</button>
                            <button type="button" disabled={isSubmitting || !databaseEnabled || usingFallbackData || product.status === "ARCHIVED"} onClick={() => handleArchive(product.id)} className="text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:text-white/20">Archivia</button>
                            <Link href={`/product/${product.slug}`} className="text-white/40 transition hover:text-white">Vedi</Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/40">{label}</span>
      {children}
    </label>
  );
}

function updateForm<Key extends keyof ProductFormState>(
  setForm: Dispatch<SetStateAction<ProductFormState>>,
  key: Key,
  value: ProductFormState[Key],
) {
  setForm((current) => ({
    ...current,
    [key]: value,
  }));
}

function buildEmptyForm(categories: AppCategory[], databaseEnabled: boolean): ProductFormState {
  return {
    ...EMPTY_FORM,
    categoryId: categories[0]?.id ?? "",
    status: databaseEnabled ? "ACTIVE" : "DRAFT",
  };
}

function normalizeStatus(status: AppProduct["status"]): ProductStatus {
  if (status === "ARCHIVED" || status === "DRAFT") {
    return status;
  }

  return "ACTIVE";
}

function statusLabel(status: AppProduct["status"], inStock: boolean) {
  if (status === "ARCHIVED") return "Archiviato";
  if (status === "DRAFT") return "Bozza";
  return inStock ? "Attivo" : "Esaurito";
}

function statusClassName(status: AppProduct["status"], inStock: boolean) {
  if (status === "ARCHIVED") return "border-white/10 bg-white/5 text-white/45";
  if (status === "DRAFT") return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  return inStock
    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
    : "border-red-400/30 bg-red-400/10 text-red-300";
}