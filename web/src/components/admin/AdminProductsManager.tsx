"use client";

import type { ChangeEvent, Dispatch, ReactNode, SetStateAction } from "react";
import { Fragment, startTransition, useDeferredValue, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/catalog";
import type { AdminProductsPageData, AppCategory, AppProduct } from "@/lib/product-data";

// crypto.randomUUID requires a secure context (HTTPS); fall back to Math.random for HTTP staging
function genId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

type SortKey = "name" | "price" | "category" | "stock" | "status";
type StockFilter = "all" | "in" | "out";
type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

type ImageFormRow = {
  localId: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
  uploading?: boolean;
};

type VariantFormRow = {
  localId: string;
  sku: string;
  size: string;
  color: string;
  stock: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: string;        // euros, e.g. "60.00"
  compareAt: string;    // euros
  status: ProductStatus;
  featured: boolean;
  limitedEdition: boolean;
  badge: string;
  materialNotes: string;
  careNotes: string;
  seoTitle: string;
  seoDescription: string;
  images: ImageFormRow[];
  variants: VariantFormRow[];
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  price: "",
  compareAt: "",
  status: "DRAFT",
  featured: false,
  limitedEdition: false,
  badge: "",
  materialNotes: "",
  careNotes: "",
  seoTitle: "",
  seoDescription: "",
  images: [emptyImageRow(0)],
  variants: [emptyVariantRow()],
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
  // quick stock edit
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [stockValues, setStockValues] = useState<Record<string, string>>({});
  // track if user manually typed the slug (prevents auto-overwrite)
  const slugManualRef = useRef(false);

  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const canWrite = databaseEnabled && !usingFallbackData;

  const filteredProducts = [...products]
    .filter((product) => {
      if (!normalizedSearch) return true;
      return [product.name, product.slug, product.sku ?? ""].some((v) =>
        v.toLowerCase().includes(normalizedSearch),
      );
    })
    .filter((product) => catFilter === "all" || product.categoryId === catFilter)
    .filter((product) => {
      if (stockFilter === "all") return true;
      return stockFilter === "in" ? product.inStock : !product.inStock;
    })
    .sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "price") return b.priceCents - a.priceCents;
      if (sortKey === "category") return a.categoryName.localeCompare(b.categoryName);
      if (sortKey === "stock") return stockCount(b) - stockCount(a);
      return a.status.localeCompare(b.status);
    });

  function handleNameChange(value: string) {
    setForm((current) => {
      const next: ProductFormState = { ...current, name: value };
      if (!slugManualRef.current) {
        next.slug = slugifyValue(value);
      }
      return next;
    });
  }

  function handleSlugChange(value: string) {
    slugManualRef.current = true;
    updateForm(setForm, "slug", value);
  }

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const payload = buildPayload(form);
      const url = editingId ? `/api/admin/products/${editingId}/` : "/api/admin/products/";
      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        redirect: "follow",
      });
      const result = await response.json();

      if (!response.ok) {
        const fieldErrors = result.details?.fieldErrors
          ? Object.entries(result.details.fieldErrors as Record<string, string[]>)
              .map(([field, msgs]) => `${field}: ${msgs[0]}`)
              .join(" · ")
          : null;
        throw new Error(fieldErrors || result.error || "Operazione non riuscita.");
      }

      const saved = result.product as AppProduct;
      startTransition(() => {
        setProducts((current) => [saved, ...current.filter((p) => p.id !== saved.id)]);
      });
      setEditingId(null);
      slugManualRef.current = false;
      setForm(buildEmptyForm(categories, databaseEnabled));
      setSuccess(editingId ? "Prodotto aggiornato." : "Prodotto creato.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(productId: string) {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}/`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Archiviazione non riuscita.");
      const archived = result.product as AppProduct;
      startTransition(() => {
        setProducts((current) => current.map((p) => (p.id === archived.id ? archived : p)));
      });
      setSuccess("Prodotto archiviato.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function beginStockEdit(product: AppProduct) {
    setStockEditId(product.id);
    setStockValues(Object.fromEntries(product.sizes.map((v) => [v.id, String(v.stock)])));
    setError(null);
    setSuccess(null);
  }

  async function handleStockSave() {
    const product = products.find((p) => p.id === stockEditId);
    if (!product) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/stock/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variants: product.sizes.map((v) => ({
            id: v.id,
            stock: Math.max(0, parseInt(stockValues[v.id] ?? String(v.stock), 10) || 0),
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Errore aggiornamento stock");
      const saved = result.product as AppProduct;
      startTransition(() => {
        setProducts((current) => current.map((p) => (p.id === saved.id ? saved : p)));
      });
      setSuccess("Stock aggiornato.");
      setStockEditId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function uploadImage(localId: string, file: File) {
    if (!canWrite) {
      setError("Configura database e runtime admin prima di caricare immagini.");
      return;
    }
    setError(null);
    setForm((current) => updateImageRow(current, localId, { uploading: true }));

    try {
      const presignResponse = await fetch("/api/admin/uploads/presign/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });
      const presign = await presignResponse.json();
      if (!presignResponse.ok) throw new Error(presign.error || "Upload non configurato.");

      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("Caricamento immagine non riuscito.");

      setForm((current) =>
        updateImageRow(current, localId, {
          url: presign.publicUrl,
          alt: current.images.find((img) => img.localId === localId)?.alt || form.name || file.name,
          uploading: false,
        }),
      );
    } catch (err) {
      setForm((current) => updateImageRow(current, localId, { uploading: false }));
      setError(err instanceof Error ? err.message : "Errore upload immagine.");
    }
  }

  function beginEdit(product: AppProduct) {
    setEditingId(product.id);
    slugManualRef.current = true; // slug esistente non va sovrascritto
    setError(null);
    setSuccess(null);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.categoryId,
      price: (product.priceCents / 100).toFixed(2),
      compareAt: product.salePrice ? (product.salePrice / 100).toFixed(2) : "",
      status: normalizeStatus(product.status),
      featured: product.featured,
      limitedEdition: product.limitedEdition,
      badge: product.badge ?? "",
      materialNotes: product.materialNotes ?? "",
      careNotes: product.careNotes ?? "",
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
      images:
        product.images.length > 0
          ? product.images.map((img, i) => ({
              localId: img.id || genId(),
              url: img.url,
              alt: img.alt,
              width: img.width,
              height: img.height,
              sortOrder: img.sortOrder ?? i,
            }))
          : [emptyImageRow(0)],
      variants:
        product.sizes.length > 0
          ? product.sizes.map((s) => ({
              localId: s.id || genId(),
              sku: s.sku,
              size: s.label,
              color: s.color ?? "",
              stock: String(s.stock),
            }))
          : [emptyVariantRow(product.slug)],
    });
  }

  function cancelEdit() {
    setEditingId(null);
    slugManualRef.current = false;
    setForm(buildEmptyForm(categories, databaseEnabled));
    setError(null);
    setSuccess(null);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/30">Admin</p>
          <h1 className="mt-1 font-display text-4xl text-white">Gestione prodotti</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="admin-link">Dashboard</Link>
          <Link href="/admin/orders" className="admin-link">Ordini</Link>
          <Link href="/shop" className="admin-link">Shop</Link>
        </div>
      </div>

      {(!databaseEnabled || usingFallbackData) && (
        <section className="border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
          {!databaseEnabled
            ? "DATABASE_URL non configurato: puoi consultare il catalogo di fallback ma non creare o aggiornare prodotti."
            : "Il database non è raggiungibile: il CRUD è disabilitato finché la connessione non torna disponibile."}
        </section>
      )}

      <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        {/* ── FORM PRODOTTO ── */}
        <form onSubmit={handleSubmit} className="border border-white/8 bg-[#111] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/30">Editor</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {editingId ? "Modifica prodotto" : "Nuovo prodotto"}
              </h2>
            </div>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="admin-link">
                Annulla
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Nome">
              <input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="input-admin"
                placeholder="es. GIACCA DENIM JP-01"
              />
            </Field>
            <Field label="Slug URL">
              <input
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                onBlur={(e) => {
                  const sanitized = slugifyValue(e.target.value);
                  if (sanitized !== e.target.value) {
                    updateForm(setForm, "slug", sanitized);
                  }
                }}
                className="input-admin"
                placeholder="generato automaticamente"
              />
              <p className="mt-1 text-xs text-white/30">Solo minuscole, numeri e trattini</p>
            </Field>
            <Field label="Categoria">
              <select
                value={form.categoryId}
                onChange={(e) => updateForm(setForm, "categoryId", e.target.value)}
                className="input-admin"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Prezzo (€) *">
              <input
                type="number"
                min="0.50"
                step="0.01"
                value={form.price}
                onChange={(e) => updateForm(setForm, "price", e.target.value)}
                className="input-admin"
                placeholder="es. 60.00"
              />
            </Field>
            <Field label="Prezzo barrato (€)">
              <input
                type="number"
                min="0.50"
                step="0.01"
                value={form.compareAt}
                onChange={(e) => updateForm(setForm, "compareAt", e.target.value)}
                className="input-admin"
                placeholder="es. 80.00 (opzionale)"
              />
            </Field>
            <Field label="Badge">
              <input
                value={form.badge}
                onChange={(e) => updateForm(setForm, "badge", e.target.value)}
                className="input-admin"
                placeholder="es. NEW, LIMITED"
              />
            </Field>
            <Field label="Stato">
              <select
                value={form.status}
                onChange={(e) => updateForm(setForm, "status", e.target.value as ProductStatus)}
                className="input-admin"
              >
                <option value="DRAFT">Bozza</option>
                <option value="ACTIVE">Attivo</option>
                <option value="ARCHIVED">Archiviato</option>
              </select>
            </Field>
            <div className="flex flex-wrap items-end gap-5">
              <Toggle
                label="In evidenza"
                checked={form.featured}
                onChange={(v) => updateForm(setForm, "featured", v)}
              />
              <Toggle
                label="Limited edition"
                checked={form.limitedEdition}
                onChange={(v) => updateForm(setForm, "limitedEdition", v)}
              />
            </div>
            <Field label="Descrizione *" className="md:col-span-2">
              <textarea
                value={form.description}
                onChange={(e) => updateForm(setForm, "description", e.target.value)}
                className="input-admin min-h-32"
                placeholder="Descrivi il prodotto (min. 10 caratteri)"
              />
            </Field>
            <Field label="Note materiali" className="md:col-span-2">
              <textarea
                value={form.materialNotes}
                onChange={(e) => updateForm(setForm, "materialNotes", e.target.value)}
                className="input-admin min-h-24"
              />
            </Field>
            <Field label="Cura capo" className="md:col-span-2">
              <textarea
                value={form.careNotes}
                onChange={(e) => updateForm(setForm, "careNotes", e.target.value)}
                className="input-admin min-h-24"
              />
            </Field>
          </div>

          <EditorPanel title="Immagini">
            <div className="space-y-4">
              {form.images.map((img, index) => (
                <div
                  key={img.localId}
                  className="grid gap-3 border border-white/8 bg-black/25 p-4 md:grid-cols-[96px_1fr]"
                >
                  <div className="relative h-28 w-24 overflow-hidden border border-white/8 bg-[#1a1a1a]">
                    {img.url ? (
                      <Image
                        src={img.url}
                        alt={img.alt || form.name || "Prodotto"}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-white/25">
                        {img.uploading ? "Upload…" : "Foto"}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label={index === 0 ? "URL thumbnail" : "URL immagine"}>
                      <input
                        value={img.url}
                        onChange={(e) =>
                          setForm((cur) => updateImageRow(cur, img.localId, { url: e.target.value }))
                        }
                        className="input-admin"
                      />
                    </Field>
                    <Field label="Alt text">
                      <input
                        value={img.alt}
                        onChange={(e) =>
                          setForm((cur) => updateImageRow(cur, img.localId, { alt: e.target.value }))
                        }
                        className="input-admin"
                      />
                    </Field>
                    <Field label="Carica da file (S3)">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!canWrite || img.uploading}
                        onChange={(e) => handleFileChange(e, img.localId, uploadImage)}
                        className="input-admin file:mr-3 file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
                      />
                    </Field>
                    <div className="flex items-end gap-3">
                      <button
                        type="button"
                        onClick={() => setForm((cur) => moveImage(cur, img.localId, -1))}
                        className="admin-link"
                      >
                        Su
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((cur) => moveImage(cur, img.localId, 1))}
                        className="admin-link"
                      >
                        Giù
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((cur) => removeImage(cur, img.localId))}
                        className="text-xs font-semibold uppercase tracking-[0.16em] text-red-300 transition hover:text-red-200"
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm((cur) => ({
                    ...cur,
                    images: [...cur.images, emptyImageRow(cur.images.length)],
                  }))
                }
                className="admin-link"
              >
                + Aggiungi immagine
              </button>
            </div>
          </EditorPanel>

          <EditorPanel title="Taglie e stock">
            <div className="space-y-3">
              {form.variants.map((variant) => (
                <div
                  key={variant.localId}
                  className="grid gap-3 border border-white/8 bg-black/25 p-4 md:grid-cols-[1fr_0.8fr_0.8fr_0.5fr_auto]"
                >
                  <Field label="SKU">
                    <input
                      value={variant.sku}
                      onChange={(e) =>
                        setForm((cur) =>
                          updateVariantRow(cur, variant.localId, { sku: e.target.value }),
                        )
                      }
                      className="input-admin"
                    />
                  </Field>
                  <Field label="Taglia">
                    <input
                      value={variant.size}
                      onChange={(e) =>
                        setForm((cur) =>
                          updateVariantRow(cur, variant.localId, { size: e.target.value }),
                        )
                      }
                      className="input-admin"
                      placeholder="es. S, M, L, UNI"
                    />
                  </Field>
                  <Field label="Colore">
                    <input
                      value={variant.color}
                      onChange={(e) =>
                        setForm((cur) =>
                          updateVariantRow(cur, variant.localId, { color: e.target.value }),
                        )
                      }
                      className="input-admin"
                    />
                  </Field>
                  <Field label="Stock">
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        setForm((cur) =>
                          updateVariantRow(cur, variant.localId, { stock: e.target.value }),
                        )
                      }
                      className="input-admin"
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => setForm((cur) => removeVariant(cur, variant.localId))}
                    className="self-end text-xs font-semibold uppercase tracking-[0.16em] text-red-300 transition hover:text-red-200"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm((cur) => ({
                    ...cur,
                    variants: [...cur.variants, emptyVariantRow(cur.slug)],
                  }))
                }
                className="admin-link"
              >
                + Aggiungi taglia
              </button>
            </div>
          </EditorPanel>

          <EditorPanel title="SEO">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="SEO title">
                <input
                  value={form.seoTitle}
                  placeholder={form.name ? `${form.name} - Jacopo Peca` : "Nome prodotto - Jacopo Peca"}
                  onChange={(e) => updateForm(setForm, "seoTitle", e.target.value)}
                  className="input-admin"
                />
              </Field>
              <Field label="SEO description">
                <input
                  value={form.seoDescription}
                  placeholder={seoDescriptionFallback(form, categories)}
                  onChange={(e) => updateForm(setForm, "seoDescription", e.target.value)}
                  className="input-admin"
                />
              </Field>
            </div>
          </EditorPanel>

          {(error || success) && (
            <div
              className={`mt-5 border px-4 py-3 text-sm ${
                error
                  ? "border-red-400/20 bg-red-400/10 text-red-100"
                  : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
              }`}
            >
              {error || success}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={isSubmitting || !canWrite}
              className="border-2 border-white bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-white/10 disabled:text-white/30"
            >
              {isSubmitting ? "Salvataggio…" : editingId ? "Aggiorna prodotto" : "Crea prodotto"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={cancelEdit}
              className="admin-link disabled:cursor-not-allowed disabled:text-white/25"
            >
              Reset
            </button>
          </div>
        </form>

        {/* ── LISTA PRODOTTI ── */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 border border-white/8 bg-[#111] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca nome, slug o SKU…"
                className="input-admin flex-1"
              />
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="input-admin lg:w-52"
              >
                <option value="all">Tutte le categorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                className="input-admin lg:w-44"
              >
                <option value="all">Tutti</option>
                <option value="in">In stock</option>
                <option value="out">Esauriti</option>
              </select>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="input-admin lg:w-44"
              >
                <option value="name">Per nome</option>
                <option value="price">Per prezzo</option>
                <option value="category">Per categoria</option>
                <option value="stock">Per stock</option>
                <option value="status">Per stato</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <span className="border border-white/10 bg-white/5 px-4 py-2 text-white">
                {filteredProducts.length} prodotti
              </span>
              <span className="border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-emerald-300">
                {filteredProducts.filter((p) => p.inStock).length} in stock
              </span>
              <span className="border border-red-400/30 bg-red-400/10 px-4 py-2 text-red-300">
                {filteredProducts.filter((p) => !p.inStock).length} esauriti
              </span>
            </div>
          </div>

          <div className="overflow-hidden border border-white/8 bg-[#111]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/3">
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-white/30">Prodotto</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-white/30">Cat.</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-white/30">Prezzo</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-white/30">Stato</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-white/30">Stock</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-white/30">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const thumb = product.images.find((img) => img.isThumbnail) ?? product.images[0];
                    const isEditingStock = stockEditId === product.id;

                    return (
                      <Fragment key={product.id}>
                        <tr
                          className="border-b border-white/5 align-top transition hover:bg-white/3"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {thumb && (
                                <div className="relative h-9 w-9 shrink-0 overflow-hidden border border-white/8 bg-[#1a1a1a]">
                                  <Image
                                    src={thumb.url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="36px"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-white">{product.name}</p>
                                <p className="text-xs text-white/30">{product.sku || product.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/60">
                              {product.categoryName}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">
                            {formatPrice(product.priceCents)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`border px-2 py-0.5 text-xs font-semibold ${statusClassName(product.status, product.inStock)}`}>
                              {statusLabel(product.status, product.inStock)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/50">
                            {isEditingStock ? (
                              <span className="text-xs text-white/30">modifica ↓</span>
                            ) : (
                              <span>{stockCount(product)} pz</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
                              <button
                                type="button"
                                onClick={() => beginEdit(product)}
                                className="text-white/60 transition hover:text-white"
                              >
                                Modifica
                              </button>
                              {canWrite && !isEditingStock && (
                                <button
                                  type="button"
                                  onClick={() => beginStockEdit(product)}
                                  className="text-blue-300 transition hover:text-blue-200"
                                >
                                  Stock
                                </button>
                              )}
                              {isEditingStock && (
                                <button
                                  type="button"
                                  onClick={() => setStockEditId(null)}
                                  className="text-white/40 transition hover:text-white"
                                >
                                  Chiudi
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={isSubmitting || !canWrite || product.status === "ARCHIVED"}
                                onClick={() => handleArchive(product.id)}
                                className="text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:text-white/20"
                              >
                                Archivia
                              </button>
                              <Link
                                href={`/product/${product.slug}`}
                                className="text-white/40 transition hover:text-white"
                              >
                                Vedi
                              </Link>
                            </div>
                          </td>
                        </tr>
                        {isEditingStock && (
                          <tr key={`${product.id}-stock`} className="border-b border-white/8 bg-white/2">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="flex flex-wrap items-end gap-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                                  Stock rapido — {product.name}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                  {product.sizes.map((variant) => (
                                    <label key={variant.id} className="flex flex-col gap-1">
                                      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                                        {variant.label}
                                      </span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={stockValues[variant.id] ?? String(variant.stock)}
                                        onChange={(e) =>
                                          setStockValues((cur) => ({
                                            ...cur,
                                            [variant.id]: e.target.value,
                                          }))
                                        }
                                        className="input-admin w-20"
                                      />
                                    </label>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={handleStockSave}
                                  className="border-2 border-white bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-white disabled:opacity-40"
                                >
                                  {isSubmitting ? "…" : "Salva stock"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStockEditId(null)}
                                  className="admin-link text-xs"
                                >
                                  Annulla
                                </button>
                              </div>
                              {error && (
                                <p className="mt-2 text-xs text-red-300">{error}</p>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
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

// ── piccoli componenti ──────────────────────────────────────────────────────

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}

function EditorPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 border-t border-white/8 pt-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-white/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-white"
      />
      {label}
    </label>
  );
}

// ── helper di stato form ────────────────────────────────────────────────────

function updateForm<Key extends keyof ProductFormState>(
  setForm: Dispatch<SetStateAction<ProductFormState>>,
  key: Key,
  value: ProductFormState[Key],
) {
  setForm((cur) => ({ ...cur, [key]: value }));
}

function buildEmptyForm(categories: AppCategory[], databaseEnabled: boolean): ProductFormState {
  return {
    ...EMPTY_FORM,
    categoryId: categories[0]?.id ?? "",
    status: databaseEnabled ? "ACTIVE" : "DRAFT",
    images: [emptyImageRow(0)],
    variants: [emptyVariantRow()],
  };
}

function emptyImageRow(sortOrder: number): ImageFormRow {
  return {
    localId: genId(),
    url: "",
    alt: "",
    width: null,
    height: null,
    sortOrder,
  };
}

function emptyVariantRow(slug = "prodotto"): VariantFormRow {
  return {
    localId: genId(),
    sku: `${slug || "prodotto"}-uni`,
    size: "UNI",
    color: "",
    stock: "1",
  };
}

function updateImageRow(form: ProductFormState, localId: string, patch: Partial<ImageFormRow>): ProductFormState {
  return {
    ...form,
    images: form.images.map((img) => (img.localId === localId ? { ...img, ...patch } : img)),
  };
}

function updateVariantRow(form: ProductFormState, localId: string, patch: Partial<VariantFormRow>): ProductFormState {
  return {
    ...form,
    variants: form.variants.map((v) => (v.localId === localId ? { ...v, ...patch } : v)),
  };
}

function removeImage(form: ProductFormState, localId: string): ProductFormState {
  const images = form.images.filter((img) => img.localId !== localId);
  return {
    ...form,
    images: (images.length > 0 ? images : [emptyImageRow(0)]).map((img, i) => ({
      ...img,
      sortOrder: i,
    })),
  };
}

function moveImage(form: ProductFormState, localId: string, direction: -1 | 1): ProductFormState {
  const images = [...form.images];
  const index = images.findIndex((img) => img.localId === localId);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= images.length) return form;
  [images[index], images[next]] = [images[next], images[index]];
  return { ...form, images: images.map((img, i) => ({ ...img, sortOrder: i })) };
}

function removeVariant(form: ProductFormState, localId: string): ProductFormState {
  const variants = form.variants.filter((v) => v.localId !== localId);
  return { ...form, variants: variants.length > 0 ? variants : [emptyVariantRow(form.slug)] };
}

function handleFileChange(
  event: ChangeEvent<HTMLInputElement>,
  localId: string,
  uploadImage: (localId: string, file: File) => Promise<void>,
) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (file) void uploadImage(localId, file);
}

function buildPayload(form: ProductFormState) {
  const priceCents = Math.round(parseFloat(form.price || "0") * 100);
  const compareAtCents = form.compareAt ? Math.round(parseFloat(form.compareAt) * 100) : null;

  return {
    name: form.name,
    slug: form.slug,
    description: form.description,
    categoryId: form.categoryId,
    priceCents,
    compareAtCents,
    status: form.status,
    featured: form.featured,
    limitedEdition: form.limitedEdition,
    badge: form.badge,
    materialNotes: form.materialNotes,
    careNotes: form.careNotes,
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    images: form.images
      .filter((img) => img.url.trim())
      .map((img, i) => ({
        url: img.url.trim(),
        alt: img.alt.trim(),
        width: img.width,
        height: img.height,
        sortOrder: i,
      })),
    variants: form.variants.map((v) => ({
      sku: v.sku.trim(),
      size: v.size.trim(),
      color: v.color.trim(),
      stock: Number(v.stock),
    })),
  };
}

// ── utility ─────────────────────────────────────────────────────────────────

function slugifyValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function normalizeStatus(status: AppProduct["status"]): ProductStatus {
  if (status === "ARCHIVED" || status === "DRAFT") return status;
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

function stockCount(product: AppProduct) {
  return product.sizes.reduce((sum, s) => sum + s.stock, 0);
}

function seoDescriptionFallback(form: ProductFormState, categories: AppCategory[]) {
  const cat = categories.find((c) => c.id === form.categoryId)?.name ?? "Streetwear";
  return `${cat} handmade Jacopo Peca. Pezzo unico made in Italy.`;
}
