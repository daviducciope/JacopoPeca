"use client";

import type { ChangeEvent, Dispatch, ReactNode, SetStateAction } from "react";
import { startTransition, useDeferredValue, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/catalog";
import type { AdminProductsPageData, AppCategory, AppProduct } from "@/lib/product-data";

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
  priceCents: string;
  compareAtCents: string;
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
  priceCents: "",
  compareAtCents: "",
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

  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const canWrite = databaseEnabled && !usingFallbackData;

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
      if (sortKey === "stock") return stockCount(right) - stockCount(left);
      return left.status.localeCompare(right.status);
    });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const payload = buildPayload(form);
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

  async function uploadImage(localId: string, file: File) {
    if (!canWrite) {
      setError("Configura database e runtime admin prima di caricare immagini.");
      return;
    }

    setError(null);
    setForm((current) => updateImageRow(current, localId, { uploading: true }));

    try {
      const presignResponse = await fetch("/api/admin/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });
      const presign = await presignResponse.json();

      if (!presignResponse.ok) {
        throw new Error(presign.error || "Upload non configurato.");
      }

      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Caricamento immagine non riuscito.");
      }

      setForm((current) =>
        updateImageRow(current, localId, {
          url: presign.publicUrl,
          alt: current.images.find((image) => image.localId === localId)?.alt || form.name || file.name,
          uploading: false,
        }),
      );
    } catch (caughtError) {
      setForm((current) => updateImageRow(current, localId, { uploading: false }));
      setError(caughtError instanceof Error ? caughtError.message : "Errore upload immagine.");
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
      compareAtCents: product.salePrice ? String(product.salePrice) : "",
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
          ? product.images.map((image, index) => ({
              localId: image.id || crypto.randomUUID(),
              url: image.url,
              alt: image.alt,
              width: image.width,
              height: image.height,
              sortOrder: image.sortOrder ?? index,
            }))
          : [emptyImageRow(0)],
      variants:
        product.sizes.length > 0
          ? product.sizes.map((size) => ({
              localId: size.id || crypto.randomUUID(),
              sku: size.sku,
              size: size.label,
              color: size.color ?? "",
              stock: String(size.stock),
            }))
          : [emptyVariantRow(product.slug)],
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
            Catalogo persistente con varianti, gallery, stock per taglia e campi SEO prodotto.
          </p>
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
            : "Il database non e raggiungibile: vedi il catalogo statico di fallback, ma il CRUD e disabilitato finche la connessione non torna disponibile."}
        </section>
      )}

      <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} className="border border-white/8 bg-[#111] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/30">Editor</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{editingId ? "Modifica prodotto" : "Nuovo prodotto"}</h2>
            </div>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="admin-link">
                Annulla
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Nome">
              <input value={form.name} onChange={(event) => updateForm(setForm, "name", event.target.value)} className="input-admin" />
            </Field>
            <Field label="Slug">
              <input value={form.slug} onChange={(event) => updateForm(setForm, "slug", event.target.value)} className="input-admin" />
            </Field>
            <Field label="Categoria">
              <select value={form.categoryId} onChange={(event) => updateForm(setForm, "categoryId", event.target.value)} className="input-admin">
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Prezzo in centesimi">
              <input type="number" min="50" value={form.priceCents} onChange={(event) => updateForm(setForm, "priceCents", event.target.value)} className="input-admin" />
            </Field>
            <Field label="Prezzo confronto">
              <input type="number" min="50" value={form.compareAtCents} onChange={(event) => updateForm(setForm, "compareAtCents", event.target.value)} className="input-admin" />
            </Field>
            <Field label="Badge">
              <input value={form.badge} onChange={(event) => updateForm(setForm, "badge", event.target.value)} className="input-admin" />
            </Field>
            <Field label="Stato">
              <select value={form.status} onChange={(event) => updateForm(setForm, "status", event.target.value as ProductStatus)} className="input-admin">
                <option value="DRAFT">Bozza</option>
                <option value="ACTIVE">Attivo</option>
                <option value="ARCHIVED">Archiviato</option>
              </select>
            </Field>
            <div className="flex flex-wrap items-end gap-5">
              <Toggle label="In evidenza" checked={form.featured} onChange={(checked) => updateForm(setForm, "featured", checked)} />
              <Toggle label="Limited edition" checked={form.limitedEdition} onChange={(checked) => updateForm(setForm, "limitedEdition", checked)} />
            </div>
            <Field label="Descrizione" className="md:col-span-2">
              <textarea value={form.description} onChange={(event) => updateForm(setForm, "description", event.target.value)} className="input-admin min-h-32" />
            </Field>
            <Field label="Note materiali" className="md:col-span-2">
              <textarea value={form.materialNotes} onChange={(event) => updateForm(setForm, "materialNotes", event.target.value)} className="input-admin min-h-24" />
            </Field>
            <Field label="Cura capo" className="md:col-span-2">
              <textarea value={form.careNotes} onChange={(event) => updateForm(setForm, "careNotes", event.target.value)} className="input-admin min-h-24" />
            </Field>
          </div>

          <EditorPanel title="Immagini">
            <div className="space-y-4">
              {form.images.map((image, index) => (
                <div key={image.localId} className="grid gap-3 border border-white/8 bg-black/25 p-4 md:grid-cols-[96px_1fr]">
                  <div className="relative h-28 w-24 overflow-hidden border border-white/8 bg-[#1a1a1a]">
                    {image.url ? (
                      <Image src={image.url} alt={image.alt || form.name || "Prodotto"} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-white/25">Foto</div>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label={index === 0 ? "URL immagine thumbnail" : "URL immagine"}>
                      <input value={image.url} onChange={(event) => setForm((current) => updateImageRow(current, image.localId, { url: event.target.value }))} className="input-admin" />
                    </Field>
                    <Field label="Alt text">
                      <input value={image.alt} onChange={(event) => setForm((current) => updateImageRow(current, image.localId, { alt: event.target.value }))} className="input-admin" />
                    </Field>
                    <Field label="Upload S3">
                      <input type="file" accept="image/*" disabled={!canWrite || image.uploading} onChange={(event) => handleFileChange(event, image.localId, uploadImage)} className="input-admin file:mr-3 file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black" />
                    </Field>
                    <div className="flex items-end gap-3">
                      <button type="button" onClick={() => setForm((current) => moveImage(current, image.localId, -1))} className="admin-link">Su</button>
                      <button type="button" onClick={() => setForm((current) => moveImage(current, image.localId, 1))} className="admin-link">Giu</button>
                      <button type="button" onClick={() => setForm((current) => removeImage(current, image.localId))} className="text-xs font-semibold uppercase tracking-[0.16em] text-red-300 transition hover:text-red-200">Rimuovi</button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setForm((current) => ({ ...current, images: [...current.images, emptyImageRow(current.images.length)] }))} className="admin-link">
                Aggiungi immagine
              </button>
            </div>
          </EditorPanel>

          <EditorPanel title="Varianti e stock">
            <div className="space-y-3">
              {form.variants.map((variant) => (
                <div key={variant.localId} className="grid gap-3 border border-white/8 bg-black/25 p-4 md:grid-cols-[1fr_0.8fr_0.8fr_0.5fr_auto]">
                  <Field label="SKU">
                    <input value={variant.sku} onChange={(event) => setForm((current) => updateVariantRow(current, variant.localId, { sku: event.target.value }))} className="input-admin" />
                  </Field>
                  <Field label="Taglia">
                    <input value={variant.size} onChange={(event) => setForm((current) => updateVariantRow(current, variant.localId, { size: event.target.value }))} className="input-admin" />
                  </Field>
                  <Field label="Colore">
                    <input value={variant.color} onChange={(event) => setForm((current) => updateVariantRow(current, variant.localId, { color: event.target.value }))} className="input-admin" />
                  </Field>
                  <Field label="Stock">
                    <input type="number" min="0" value={variant.stock} onChange={(event) => setForm((current) => updateVariantRow(current, variant.localId, { stock: event.target.value }))} className="input-admin" />
                  </Field>
                  <button type="button" onClick={() => setForm((current) => removeVariant(current, variant.localId))} className="self-end text-xs font-semibold uppercase tracking-[0.16em] text-red-300 transition hover:text-red-200">
                    Rimuovi
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setForm((current) => ({ ...current, variants: [...current.variants, emptyVariantRow(current.slug)] }))} className="admin-link">
                Aggiungi variante
              </button>
            </div>
          </EditorPanel>

          <EditorPanel title="SEO prodotto">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="SEO title">
                <input value={form.seoTitle} placeholder={seoTitleFallback(form)} onChange={(event) => updateForm(setForm, "seoTitle", event.target.value)} className="input-admin" />
              </Field>
              <Field label="SEO description">
                <input value={form.seoDescription} placeholder={seoDescriptionFallback(form, categories)} onChange={(event) => updateForm(setForm, "seoDescription", event.target.value)} className="input-admin" />
              </Field>
            </div>
          </EditorPanel>

          {(error || success) && (
            <div className={`mt-5 border px-4 py-3 text-sm ${error ? "border-red-400/20 bg-red-400/10 text-red-100" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"}`}>
              {error || success}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button disabled={isSubmitting || !canWrite} className="border-2 border-white bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-white/10 disabled:text-white/30">
              {isSubmitting ? "Salvataggio..." : editingId ? "Aggiorna prodotto" : "Crea prodotto"}
            </button>
            <button type="button" disabled={isSubmitting} onClick={cancelEdit} className="admin-link disabled:cursor-not-allowed disabled:text-white/25">
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
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.2em] text-white/30">Stock</th>
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
                        <td className="px-5 py-4 text-white/40">{stockCount(product)} pz / {product.sizes.length} taglie</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
                            <button type="button" onClick={() => beginEdit(product)} className="text-white/60 transition hover:text-white">Modifica</button>
                            <button type="button" disabled={isSubmitting || !canWrite || product.status === "ARCHIVED"} onClick={() => handleArchive(product.id)} className="text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:text-white/20">Archivia</button>
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

function EditorPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 border-t border-white/8 pt-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 text-sm text-white/70">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-white" />
      {label}
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
    images: [emptyImageRow(0)],
    variants: [emptyVariantRow()],
  };
}

function emptyImageRow(sortOrder: number): ImageFormRow {
  return {
    localId: crypto.randomUUID(),
    url: "",
    alt: "",
    width: null,
    height: null,
    sortOrder,
  };
}

function emptyVariantRow(slug = "prodotto"): VariantFormRow {
  return {
    localId: crypto.randomUUID(),
    sku: `${slug || "prodotto"}-uni`,
    size: "UNI",
    color: "",
    stock: "1",
  };
}

function updateImageRow(form: ProductFormState, localId: string, patch: Partial<ImageFormRow>): ProductFormState {
  return {
    ...form,
    images: form.images.map((image) => (image.localId === localId ? { ...image, ...patch } : image)),
  };
}

function updateVariantRow(form: ProductFormState, localId: string, patch: Partial<VariantFormRow>): ProductFormState {
  return {
    ...form,
    variants: form.variants.map((variant) => (variant.localId === localId ? { ...variant, ...patch } : variant)),
  };
}

function removeImage(form: ProductFormState, localId: string): ProductFormState {
  const images = form.images.filter((image) => image.localId !== localId);
  return {
    ...form,
    images: (images.length > 0 ? images : [emptyImageRow(0)]).map((image, index) => ({ ...image, sortOrder: index })),
  };
}

function moveImage(form: ProductFormState, localId: string, direction: -1 | 1): ProductFormState {
  const images = [...form.images];
  const index = images.findIndex((image) => image.localId === localId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= images.length) {
    return form;
  }

  [images[index], images[nextIndex]] = [images[nextIndex], images[index]];
  return {
    ...form,
    images: images.map((image, imageIndex) => ({ ...image, sortOrder: imageIndex })),
  };
}

function removeVariant(form: ProductFormState, localId: string): ProductFormState {
  const variants = form.variants.filter((variant) => variant.localId !== localId);
  return {
    ...form,
    variants: variants.length > 0 ? variants : [emptyVariantRow(form.slug)],
  };
}

function handleFileChange(
  event: ChangeEvent<HTMLInputElement>,
  localId: string,
  uploadImage: (localId: string, file: File) => Promise<void>,
) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (file) {
    void uploadImage(localId, file);
  }
}

function buildPayload(form: ProductFormState) {
  return {
    name: form.name,
    slug: form.slug,
    description: form.description,
    categoryId: form.categoryId,
    priceCents: Number(form.priceCents),
    compareAtCents: form.compareAtCents ? Number(form.compareAtCents) : null,
    status: form.status,
    featured: form.featured,
    limitedEdition: form.limitedEdition,
    badge: form.badge,
    materialNotes: form.materialNotes,
    careNotes: form.careNotes,
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    images: form.images
      .filter((image) => image.url.trim())
      .map((image, index) => ({
        url: image.url.trim(),
        alt: image.alt.trim(),
        width: image.width,
        height: image.height,
        sortOrder: index,
      })),
    variants: form.variants.map((variant) => ({
      sku: variant.sku.trim(),
      size: variant.size.trim(),
      color: variant.color.trim(),
      stock: Number(variant.stock),
    })),
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

function stockCount(product: AppProduct) {
  return product.sizes.reduce((sum, size) => sum + size.stock, 0);
}

function seoTitleFallback(form: ProductFormState) {
  return form.name ? `${form.name} - Jacopo Peca` : "Nome prodotto - Jacopo Peca";
}

function seoDescriptionFallback(form: ProductFormState, categories: AppCategory[]) {
  const category = categories.find((item) => item.id === form.categoryId)?.name ?? "Streetwear";
  return `${category} handmade Jacopo Peca. Pezzo unico made in Italy.`;
}
