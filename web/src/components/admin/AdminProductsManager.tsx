"use client";

import type { ChangeEvent, Dispatch, DragEvent, ReactNode, SetStateAction } from "react";
import { Fragment, startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import Image from "@/components/StoreImage";
import Link from "next/link";

import { AdminNav } from "@/components/admin/AdminNav";
import {
  buildDefaultStudioSettings,
  formatFileSize,
  loadImageElement,
  PHOTO_FRAME_MODES,
  PHOTO_PRESETS,
  PhotoStudioModal,
  processPhonePhotoForWeb,
  type PhotoFrameMode,
  type PhotoPresetId,
  type PhotoStudioSettings,
  type ProcessedPhotoResult,
} from "@/components/admin/PhotoStudioModal";
import { formatPrice } from "@/lib/catalog";
import type { AdminProductsPageData, AppCategory, AppProduct } from "@/lib/product-data";

function genId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

type SortKey = "recent" | "name" | "price" | "category" | "stock";
type StatusFilter = "all" | "active" | "in_stock" | "out_of_stock" | "draft" | "archived";
type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

type ImageFormRow = {
  localId: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
  uploading?: boolean;
  fileName?: string;
  rawFile?: File;
  originalSizeBytes?: number;
  outputSizeBytes?: number;
  formatLabel?: "WEBP" | "JPG";
  studioSettings?: PhotoStudioSettings;
};

type VideoFormRow = {
  localId: string;
  url: string;
  posterUrl: string;
  uploading?: boolean;
  progress?: number;
  fileName?: string;
  sizeBytes?: number;
};

type PhotoMode = "studio" | "original";

const MAX_VIDEO_MB = 300;
const PHOTO_MODE_STORAGE_KEY = "jp-admin-photo-mode";

/** Foto "Originale": nessun filtro, nessun ritaglio. Solo HEIC/enormi vengono convertiti in JPG fedele. */
async function processOriginalPhoto(
  file: File,
): Promise<{ file: File; width: number | null; height: number | null }> {
  const browserSafe = /^image\/(jpeg|png|webp|gif|avif)$/.test(file.type);
  let img: HTMLImageElement | null = null;
  try {
    img = await loadImageElement(file);
  } catch {
    if (browserSafe) return { file, width: null, height: null };
    throw new Error("Formato foto non leggibile dal browser. Prova a scattarla di nuovo in JPG.");
  }
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const tooBig = file.size > 12 * 1024 * 1024 || Math.max(w, h) > 4000;
  if (browserSafe && !tooBig) return { file, width: w, height: h };

  const scale = Math.min(1, 3200 / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) return { file, width: w, height: h };
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return { file: new File([blob], name, { type: "image/jpeg" }), width: canvas.width, height: canvas.height };
}

/** Estrae un fotogramma dal video da usare come copertina. */
async function captureVideoPoster(file: File): Promise<File | null> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), 8000);
      video.onloadeddata = () => {
        clearTimeout(timer);
        resolve();
      };
      video.onerror = () => {
        clearTimeout(timer);
        reject(new Error("video"));
      };
    });
    video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 3000);
      video.onseeked = () => {
        clearTimeout(timer);
        resolve();
      };
    });
    const scale = Math.min(1, 1080 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    if (!canvas.width || !canvas.height) return null;
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ? new File([blob], "poster.jpg", { type: "image/jpeg" }) : null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

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
  price: string;
  compareAt: string;
  status: ProductStatus;
  featured: boolean;
  limitedEdition: boolean;
  badge: string;
  materialNotes: string;
  careNotes: string;
  seoTitle: string;
  seoDescription: string;
  images: ImageFormRow[];
  videos: VideoFormRow[];
  variants: VariantFormRow[];
};

const SIZE_PRESETS: Array<{ label: string; sizes: string[] }> = [
  { label: "Taglia Unica (UNI)", sizes: ["UNI"] },
  { label: "Abbigliamento (S, M, L, XL)", sizes: ["S", "M", "L", "XL"] },
  { label: "Jeans (28, 30, 32, 34, 36)", sizes: ["28", "30", "32", "34", "36"] },
  { label: "Cappelli (56, 57, 58, 59 cm)", sizes: ["56cm", "57cm", "58cm", "59cm"] },
];

export function AdminProductsManager({
  initialProducts,
  categories: initialCategories,
  databaseEnabled,
  usingFallbackData,
  initialEditId = null,
  initialOpenNew = false,
  initialOpenCategories = false,
  initialStatusFilter = "all",
  initialCategoryFilter = "all",
}: {
  initialProducts: AdminProductsPageData["products"];
  categories: AdminProductsPageData["categories"];
  databaseEnabled: boolean;
  usingFallbackData: boolean;
  initialEditId?: string | null;
  initialOpenNew?: boolean;
  initialOpenCategories?: boolean;
  initialStatusFilter?: StatusFilter;
  initialCategoryFilter?: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState(initialCategoryFilter);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatusFilter);
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(Boolean(initialOpenNew || initialEditId));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(() =>
    buildEmptyForm(initialCategories, databaseEnabled),
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  // Automatic Phone Photo Studio pipeline settings
  const [autoPhotoPreset, setAutoPhotoPreset] = useState<PhotoPresetId>("auto_studio");
  const [autoFrameMode, setAutoFrameMode] = useState<PhotoFrameMode>("smart_4_5");
  const [photoMode, setPhotoMode] = useState<PhotoMode>("studio");
  const [studioEditingImageId, setStudioEditingImageId] = useState<string | null>(null);

  // Category Management (Create / Edit / Delete)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState<boolean>(initialOpenCategories);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDesc, setEditCategoryDesc] = useState("");
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [reassignTargetCategoryId, setReassignTargetCategoryId] = useState<string>("");
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Feedback banners
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string; productSlug?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick stock edit
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [stockValues, setStockValues] = useState<Record<string, string>>({});

  // Quick Direct Sale (Store / Instagram / WhatsApp)
  const [quickSaleProductId, setQuickSaleProductId] = useState<string | null>(null);
  const [quickSaleVariantId, setQuickSaleVariantId] = useState<string>("");
  const [quickSaleChannel, setQuickSaleChannel] = useState<"INSTAGRAM" | "WHATSAPP" | "STORE">(
    "INSTAGRAM",
  );
  const [quickSaleCustomer, setQuickSaleCustomer] = useState("");
  const [quickSalePhone, setQuickSalePhone] = useState("");

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PHOTO_MODE_STORAGE_KEY);
      if (saved === "studio" || saved === "original") setPhotoMode(saved);
    } catch {
      // storage non disponibile: resta il default
    }
  }, []);

  function changePhotoMode(mode: PhotoMode) {
    setPhotoMode(mode);
    try {
      window.localStorage.setItem(PHOTO_MODE_STORAGE_KEY, mode);
    } catch {
      // ignora
    }
  }

  const slugManualRef = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoCameraInputRef = useRef<HTMLInputElement>(null);

  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const canWrite = databaseEnabled && !usingFallbackData;

  // Open initial edit product if passed via URL
  useEffect(() => {
    if (initialEditId) {
      const target = initialProducts.find((p) => p.id === initialEditId || p.slug === initialEditId);
      if (target) {
        beginEdit(target, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEditId]);

  const counts = {
    all: products.length,
    active: products.filter((p) => p.status === "ACTIVE").length,
    in_stock: products.filter((p) => p.status === "ACTIVE" && p.inStock).length,
    out_of_stock: products.filter((p) => p.status === "ACTIVE" && !p.inStock).length,
    draft: products.filter((p) => p.status === "DRAFT").length,
    archived: products.filter((p) => p.status === "ARCHIVED").length,
  };

  const filteredProducts = [...products]
    .filter((product) => {
      if (!normalizedSearch) return true;
      return [product.name, product.slug, product.sku ?? "", product.categoryName].some((v) =>
        v.toLowerCase().includes(normalizedSearch),
      );
    })
    .filter((product) => catFilter === "all" || product.categoryId === catFilter || product.categorySlug === catFilter)
    .filter((product) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return product.status === "ACTIVE";
      if (statusFilter === "in_stock") return product.status === "ACTIVE" && product.inStock;
      if (statusFilter === "out_of_stock") return product.status === "ACTIVE" && !product.inStock;
      if (statusFilter === "draft") return product.status === "DRAFT";
      if (statusFilter === "archived") return product.status === "ARCHIVED";
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "price") return b.priceCents - a.priceCents;
      if (sortKey === "category") return a.categoryName.localeCompare(b.categoryName);
      if (sortKey === "stock") return stockCount(b) - stockCount(a);
      return 0;
    });

  function scrollToEditor() {
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function openNewProductEditor() {
    setEditingId(null);
    slugManualRef.current = false;
    setForm(buildEmptyForm(categories, databaseEnabled));
    setError(null);
    setSuccess(null);
    setShowAdvanced(false);
    setIsEditorOpen(true);
    scrollToEditor();
  }

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

  function generateAutoDescription() {
    const cat = categories.find((c) => c.id === form.categoryId)?.name || "Denim Streetwear";
    const name = form.name.trim() || "Capo Jacopo Peca";
    const generated = `${name} — ${cat} artigianale Jacopo Peca. Lavorato e rifinito interamente a mano nel nostro laboratorio in Italia. Pezzo unico dal carattere autentico.`;
    updateForm(setForm, "description", generated);
  }

  function applySizePreset(sizes: string[]) {
    setForm((current) => ({
      ...current,
      variants: sizes.map((size) => {
        const existing = current.variants.find(
          (v) => v.size.trim().toUpperCase() === size.toUpperCase(),
        );
        return {
          localId: existing?.localId || genId(),
          sku: "",
          size,
          color: existing?.color || "",
          stock: existing?.stock ?? "1",
        };
      }),
    }));
  }

  async function handleCreateCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setIsCreatingCategory(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/categories/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          description: newCategoryDesc.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossibile creare la categoria.");
      const created = data.category as AppCategory;
      setCategories((prev) => [...prev, created]);
      updateForm(setForm, "categoryId", created.id);
      setNewCategoryName("");
      setNewCategoryDesc("");
      setShowNewCategory(false);
      setSuccess({ message: `Categoria "${created.name}" aggiunta al catalogo!` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore creazione categoria.");
    } finally {
      setIsCreatingCategory(false);
    }
  }

  function beginEditCategory(cat: AppCategory) {
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name);
    setEditCategoryDesc(cat.description || "");
    setDeletingCategoryId(null);
    setError(null);
  }

  async function handleSaveCategoryEdit(categoryId: string) {
    const trimmed = editCategoryName.trim();
    if (!trimmed) return;
    setIsUpdatingCategory(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/categories/${categoryId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          description: editCategoryDesc.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossibile aggiornare la categoria.");
      const updated = data.category as AppCategory;

      startTransition(() => {
        setCategories((prev) =>
          prev.map((c) => (c.id === categoryId ? { ...updated, count: c.count } : c)),
        );
        setProducts((prev) =>
          prev.map((p) =>
            p.categoryId === categoryId ? { ...p, categoryName: updated.name } : p,
          ),
        );
      });

      setEditingCategoryId(null);
      setSuccess({ message: `Categoria aggiornata in "${updated.name}".` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore modifica categoria.");
    } finally {
      setIsUpdatingCategory(false);
    }
  }

  function beginDeleteCategory(cat: AppCategory) {
    if (deletingCategoryId === cat.id) {
      setDeletingCategoryId(null);
      return;
    }
    const fallbackCat = categories.find((c) => c.id !== cat.id);
    setReassignTargetCategoryId(fallbackCat?.id ?? "");
    setDeletingCategoryId(cat.id);
    setEditingCategoryId(null);
    setError(null);
  }

  async function handleConfirmDeleteCategory(cat: AppCategory) {
    setIsDeletingCategory(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reassignToCategoryId: reassignTargetCategoryId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossibile eliminare la categoria.");

      startTransition(() => {
        const remaining = categories
          .filter((c) => c.id !== cat.id)
          .map((c) =>
            data.targetCategoryId && c.id === data.targetCategoryId
              ? { ...c, count: c.count + (data.movedProducts || 0) }
              : c,
          );
        setCategories(remaining);

        if (data.targetCategoryId) {
          setProducts((prev) =>
            prev.map((p) =>
              p.categoryId === cat.id
                ? {
                    ...p,
                    categoryId: data.targetCategoryId,
                    categoryName: data.targetCategoryName || p.categoryName,
                    categorySlug: data.targetCategorySlug || p.categorySlug,
                  }
                : p,
            ),
          );
        }

        if (catFilter === cat.id) {
          setCatFilter("all");
        }
        if (form.categoryId === cat.id && remaining[0]) {
          updateForm(setForm, "categoryId", remaining[0].id);
        }
      });

      setDeletingCategoryId(null);
      setSuccess({
        message:
          data.movedProducts > 0
            ? `Categoria "${cat.name}" eliminata (${data.movedProducts} capi spostati in "${data.targetCategoryName}").`
            : `Categoria "${cat.name}" eliminata.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore eliminazione categoria.");
    } finally {
      setIsDeletingCategory(false);
    }
  }

  async function uploadFileToStorage(file: File): Promise<string> {
    // 1. Try direct server-side upload first (most reliable, immune to browser S3 CORS issues)
    let publicUrl: string | null = null;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const directRes = await fetch("/api/admin/uploads/direct/", {
        method: "POST",
        body: formData,
      });
      if (directRes.ok) {
        const directData = await directRes.json();
        publicUrl = directData.publicUrl;
      }
    } catch {
      // Fallback to presigned S3 upload below
    }

    // 2. Fallback to S3 presigned URL if needed
    if (!publicUrl) {
      const presignResponse = await fetch("/api/admin/uploads/presign/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "image/webp",
          size: file.size,
        }),
      });
      const presign = await presignResponse.json();
      if (!presignResponse.ok) {
        throw new Error(presign.error || "Upload immagine non riuscito.");
      }

      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/webp" },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error("Errore durante il trasferimento dell'immagine.");
      }
      publicUrl = presign.publicUrl;
    }

    return publicUrl || "";
  }

  async function handleFilesSelected(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter(
      (f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|avif|heic|heif)$/i.test(f.name),
    );
    if (files.length === 0) {
      setError("Seleziona file immagine validi (JPG, PNG, WEBP, HEIC).");
      return;
    }

    setError(null);

    const activeStudioSettings = buildDefaultStudioSettings(autoPhotoPreset, autoFrameMode);

    // Create placeholder rows for each selected file
    const newPlaceholders: ImageFormRow[] = files.map((file, idx) => ({
      localId: genId(),
      url: "",
      alt: form.name || file.name.replace(/\.[^.]+$/, ""),
      width: null,
      height: null,
      sortOrder: idx,
      uploading: true,
      fileName: file.name,
      rawFile: file,
      originalSizeBytes: file.size,
      studioSettings: activeStudioSettings,
    }));

    setForm((current) => {
      const existingValid = current.images.filter((img) => img.url.trim() || img.uploading);
      const merged = [...existingValid, ...newPlaceholders].map((img, i) => ({
        ...img,
        sortOrder: i,
      }));
      return { ...current, images: merged };
    });

    // Elabora e carica al massimo 3 foto alla volta (stabile su telefoni e reti mobili)
    let next = 0;
    const worker = async () => {
      while (next < files.length) {
        const idx = next++;
        await uploadSingleFile(newPlaceholders[idx].localId, files[idx], activeStudioSettings);
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, files.length) }, worker));
  }

  async function uploadSingleFile(
    localId: string,
    rawFile: File,
    studioSettings: PhotoStudioSettings,
  ) {
    try {
      if (photoMode === "original") {
        const original = await processOriginalPhoto(rawFile);
        const publicUrl = await uploadFileToStorage(original.file);
        setForm((current) =>
          updateImageRow(current, localId, {
            url: publicUrl,
            width: original.width,
            height: original.height,
            uploading: false,
            rawFile,
            originalSizeBytes: rawFile.size,
            outputSizeBytes: original.file.size,
            formatLabel: undefined,
          }),
        );
        return;
      }
      const processed = await processPhonePhotoForWeb(rawFile, studioSettings);
      const publicUrl = await uploadFileToStorage(processed.file);

      setForm((current) =>
        updateImageRow(current, localId, {
          url: publicUrl,
          alt:
            current.images.find((img) => img.localId === localId)?.alt ||
            current.name ||
            rawFile.name.replace(/\.[^.]+$/, ""),
          width: processed.width,
          height: processed.height,
          uploading: false,
          rawFile,
          originalSizeBytes: processed.originalSizeBytes,
          outputSizeBytes: processed.outputSizeBytes,
          formatLabel: processed.formatLabel,
          studioSettings: processed.appliedSettings,
        }),
      );
    } catch (err) {
      setForm((current) => removeImage(current, localId));
      setError(err instanceof Error ? err.message : "Errore durante il caricamento della foto.");
    }
  }

  async function handleStudioApply(localId: string, result: ProcessedPhotoResult) {
    setError(null);
    setForm((current) =>
      updateImageRow(current, localId, {
        uploading: true,
      }),
    );

    try {
      const publicUrl = await uploadFileToStorage(result.file);
      setForm((current) =>
        updateImageRow(current, localId, {
          url: publicUrl,
          width: result.width,
          height: result.height,
          uploading: false,
          outputSizeBytes: result.outputSizeBytes,
          formatLabel: result.formatLabel,
          studioSettings: result.appliedSettings,
        }),
      );
    } catch (err) {
      setForm((current) => updateImageRow(current, localId, { uploading: false }));
      setError(
        err instanceof Error ? err.message : "Errore durante il salvataggio della foto ottimizzata.",
      );
    }
  }

  function uploadVideoWithProgress(file: File, onProgress: (pct: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const contentType = file.type || "video/mp4";
      fetch("/api/admin/uploads/presign/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType, size: file.size }),
      })
        .then(async (res) => ({ ok: res.ok, data: await res.json() }))
        .then(({ ok, data }) => {
          if (!ok) throw new Error(data.error || "presign");
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", data.uploadUrl);
          xhr.setRequestHeader("Content-Type", contentType);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? resolve(data.publicUrl as string)
              : reject(new Error("Errore durante il trasferimento del video."));
          xhr.onerror = () => reject(new Error("Connessione interrotta durante il caricamento del video."));
          xhr.send(file);
        })
        .catch(async () => {
          // Fallback: upload diretto lato server (storage locale o S3 non raggiungibile dal browser)
          try {
            if (file.size > 100 * 1024 * 1024) {
              throw new Error("Video troppo grande per il caricamento diretto (max 100 MB).");
            }
            const url = await uploadFileToStorage(file);
            onProgress(100);
            resolve(url);
          } catch (err) {
            reject(err instanceof Error ? err : new Error("Upload video non riuscito."));
          }
        });
    });
  }

  async function handleVideosSelected(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter(
      (f) => f.type.startsWith("video/") || /\.(mp4|mov|m4v|webm|3gp)$/i.test(f.name),
    );
    if (files.length === 0) {
      setError("Seleziona file video validi (MP4, MOV, WEBM).");
      return;
    }
    const tooBig = files.find((f) => f.size > MAX_VIDEO_MB * 1024 * 1024);
    if (tooBig) {
      setError(`Il video "${tooBig.name}" supera il limite di ${MAX_VIDEO_MB} MB.`);
      return;
    }
    setError(null);

    const rows: VideoFormRow[] = files.map((file) => ({
      localId: genId(),
      url: "",
      posterUrl: "",
      uploading: true,
      progress: 0,
      fileName: file.name,
      sizeBytes: file.size,
    }));
    setForm((current) => ({ ...current, videos: [...current.videos, ...rows] }));

    // Un video alla volta: i file sono grandi e la rete mobile è limitata
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = rows[i].localId;
      try {
        const poster = await captureVideoPoster(file);
        const url = await uploadVideoWithProgress(file, (pct) =>
          setForm((cur) => ({
            ...cur,
            videos: cur.videos.map((v) => (v.localId === id ? { ...v, progress: pct } : v)),
          })),
        );
        let posterUrl = "";
        if (poster) {
          try {
            posterUrl = await uploadFileToStorage(poster);
          } catch {
            posterUrl = "";
          }
        }
        setForm((cur) => ({
          ...cur,
          videos: cur.videos.map((v) =>
            v.localId === id ? { ...v, url, posterUrl, uploading: false, progress: 100 } : v,
          ),
        }));
      } catch (err) {
        setForm((cur) => ({ ...cur, videos: cur.videos.filter((v) => v.localId !== id) }));
        setError(err instanceof Error ? err.message : "Errore durante il caricamento del video.");
      }
    }
  }

  function removeVideo(localId: string) {
    setForm((cur) => ({ ...cur, videos: cur.videos.filter((v) => v.localId !== localId) }));
  }

  function moveVideo(localId: string, dir: -1 | 1) {
    setForm((cur) => {
      const idx = cur.videos.findIndex((v) => v.localId === localId);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= cur.videos.length) return cur;
      const videos = [...cur.videos];
      [videos[idx], videos[target]] = [videos[target], videos[idx]];
      return { ...cur, videos };
    });
  }

  function handleAddManualUrl() {
    const trimmed = manualImageUrl.trim();
    if (!trimmed) return;
    setForm((current) => {
      const existing = current.images.filter((img) => img.url.trim() || img.uploading);
      return {
        ...current,
        images: [
          ...existing,
          {
            localId: genId(),
            url: trimmed,
            alt: current.name || "Prodotto Jacopo Peca",
            width: null,
            height: null,
            sortOrder: existing.length,
          },
        ],
      };
    });
    setManualImageUrl("");
    setShowUrlInput(false);
  }

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Inserisci il nome del prodotto (almeno 2 caratteri).");
      return;
    }

    const parsedPrice = parseEuroString(form.price);
    if (!parsedPrice || parsedPrice < 0.5) {
      setError("Inserisci un prezzo valido per il prodotto (es. 60 oppure 60,00).");
      return;
    }

    const validImages = form.images.filter((img) => img.url.trim() && !img.uploading);
    if (form.images.some((img) => img.uploading) || form.videos.some((v) => v.uploading)) {
      setError("Attendi il completamento del caricamento di foto e video prima di salvare.");
      return;
    }
    if (validImages.length === 0) {
      setError("Carica almeno una foto del prodotto prima di salvare.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload(form, categories);
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
      const wasEditing = Boolean(editingId);
      startTransition(() => {
        setProducts((current) => [saved, ...current.filter((p) => p.id !== saved.id)]);
      });
      setEditingId(null);
      slugManualRef.current = false;
      setForm(buildEmptyForm(categories, databaseEnabled));
      setIsEditorOpen(false);
      setSuccess({
        message: wasEditing
          ? `Prodotto "${saved.name}" aggiornato con successo!`
          : `Prodotto "${saved.name}" creato e pubblicato con successo!`,
        productSlug: saved.slug,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso durante il salvataggio.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQuickStatusChange(product: AppProduct, newStatus: ProductStatus) {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, quickStatusOnly: true }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossibile aggiornare lo stato.");
      const updated = result.product as AppProduct;
      startTransition(() => {
        setProducts((current) => current.map((p) => (p.id === updated.id ? updated : p)));
      });
      const label =
        newStatus === "ACTIVE"
          ? "pubblicato nello shop"
          : newStatus === "DRAFT"
            ? "spostato in bozza"
            : "archiviato";
      setSuccess({
        message: `"${updated.name}" è stato ${label}.`,
        productSlug: newStatus === "ACTIVE" ? updated.slug : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePermanentDelete(productId: string) {
    const target = products.find((p) => p.id === productId);
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}/?permanent=true`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Eliminazione non riuscita.");
      startTransition(() => {
        setProducts((current) => current.filter((p) => p.id !== productId));
      });
      setConfirmDeleteId(null);
      if (editingId === productId) {
        cancelEdit();
      }
      setSuccess({
        message: `Prodotto "${target?.name || ""}" eliminato definitivamente.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'eliminazione.");
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
      setSuccess({
        message: `Quantità stock aggiornate per "${saved.name}".`,
        productSlug: saved.slug,
      });
      setStockEditId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function beginEdit(product: AppProduct, shouldScroll = true) {
    setEditingId(product.id);
    slugManualRef.current = true;
    setError(null);
    setSuccess(null);
    setIsEditorOpen(true);
    setShowAdvanced(
      Boolean(
        product.badge ||
          product.materialNotes ||
          product.careNotes ||
          product.seoTitle ||
          product.seoDescription ||
          product.featured ||
          product.limitedEdition,
      ),
    );
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
          : [],
      videos: (product.videos ?? []).map((v) => ({
        localId: v.id || genId(),
        url: v.url,
        posterUrl: v.posterUrl ?? "",
      })),
      variants:
        product.sizes.length > 0
          ? product.sizes.map((s) => ({
              localId: s.id || genId(),
              sku: s.sku,
              size: s.label,
              color: s.color ?? "",
              stock: String(s.stock),
            }))
          : [emptyVariantRow()],
    });
    if (shouldScroll) {
      scrollToEditor();
    }
  }

  function duplicateProduct(product: AppProduct) {
    setEditingId(null); // nuovo prodotto!
    slugManualRef.current = false;
    setError(null);

    // Incrementa il numero finale se presente (es. "MATRICOLA 5" -> "MATRICOLA 6")
    const numMatch = product.name.trim().match(/^(.*?\s+)(\d+)$/);
    const nextName = numMatch
      ? `${numMatch[1]}${Number.parseInt(numMatch[2], 10) + 1}`
      : `${product.name} (Nuovo)`;

    setIsEditorOpen(true);
    setForm({
      name: nextName,
      slug: slugifyValue(nextName),
      description: product.description.replace(product.name, nextName),
      categoryId: product.categoryId,
      price: (product.priceCents / 100).toFixed(2),
      compareAt: product.salePrice ? (product.salePrice / 100).toFixed(2) : "",
      status: "ACTIVE",
      featured: product.featured,
      limitedEdition: product.limitedEdition,
      badge: product.badge ?? "",
      materialNotes: product.materialNotes ?? "",
      careNotes: product.careNotes ?? "",
      seoTitle: "",
      seoDescription: "",
      images: product.images.map((img, i) => ({
        localId: genId(),
        url: img.url,
        alt: nextName,
        width: img.width,
        height: img.height,
        sortOrder: i,
      })),
      videos: (product.videos ?? []).map((v) => ({
        localId: genId(),
        url: v.url,
        posterUrl: v.posterUrl ?? "",
      })),
      variants:
        product.sizes.length > 0
          ? product.sizes.map((s) => ({
              localId: genId(),
              sku: "",
              size: s.label,
              color: s.color ?? "",
              stock: String(Math.max(1, s.stock)),
            }))
          : [emptyVariantRow()],
    });
    setSuccess({
      message: `Prodotto "${product.name}" duplicato come "${nextName}". Sostituisci la foto se necessario e clicca Pubblica!`,
    });
    scrollToEditor();
  }

  async function handleToggleFeatured(product: AppProduct, pinToTop = false) {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featured: pinToTop ? true : !product.featured,
          pinToTop,
          quickStatusOnly: true,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossibile aggiornare il prodotto.");
      const updated = result.product as AppProduct;
      startTransition(() => {
        setProducts((current) =>
          pinToTop
            ? [updated, ...current.filter((p) => p.id !== updated.id)]
            : current.map((p) => (p.id === updated.id ? updated : p)),
        );
      });
      setSuccess({
        message: pinToTop
          ? `"${updated.name}" portato in cima alla vetrina e in Homepage!`
          : updated.featured
            ? `"${updated.name}" aggiunto ai capi in evidenza in Homepage.`
            : `"${updated.name}" rimosso dall'evidenza in Homepage.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function beginQuickSale(product: AppProduct) {
    if (quickSaleProductId === product.id) {
      setQuickSaleProductId(null);
      return;
    }
    setQuickSaleProductId(product.id);
    const availableSize = product.sizes.find((s) => s.stock > 0) ?? product.sizes[0];
    setQuickSaleVariantId(availableSize?.id ?? "");
    setQuickSaleChannel("INSTAGRAM");
    setQuickSaleCustomer("");
    setQuickSalePhone("");
    setStockEditId(null);
    setConfirmDeleteId(null);
  }

  async function handleConfirmQuickSale(product: AppProduct) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const variantId = quickSaleVariantId || product.sizes[0]?.id || "";
      const res = await fetch("/api/admin/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId,
          quantity: 1,
          priceCents: product.priceCents,
          channel: quickSaleChannel,
          customerName: quickSaleCustomer.trim() || undefined,
          customerPhone: quickSalePhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossibile registrare la vendita.");

      // Refresh local product stock
      startTransition(() => {
        setProducts((curr) =>
          curr.map((p) => {
            if (p.id !== product.id) return p;
            const nextSizes = p.sizes.map((s) =>
              s.id === variantId ? { ...s, stock: Math.max(0, s.stock - 1) } : s,
            );
            const totalLeft = nextSizes.reduce((sum, s) => sum + s.stock, 0);
            return {
              ...p,
              sizes: nextSizes,
              inStock: p.status === "ACTIVE" && totalLeft > 0,
            };
          }),
        );
      });

      setQuickSaleProductId(null);
      setSuccess({
        message: `Vendita registrata (${data.order.orderNumber}) per "${product.name}"! Lo stock è stato scalato e l'ordine è visibile nella sezione Ordini.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore registrazione vendita.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    slugManualRef.current = false;
    setForm(buildEmptyForm(categories, databaseEnabled));
    setError(null);
    setIsEditorOpen(false);
  }

  const uploadedImages = form.images.filter((img) => img.url.trim() || img.uploading);

  return (
    <div className="flex flex-1 flex-col">
      <AdminNav onNewProductClick={openNewProductEditor} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10">
        {/* ── HEADER & CTA PRINCIPALE ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-wider text-white md:text-5xl">
              Gestione Catalogo Prodotti
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Carica nuovi capi con foto, gestisci le categorie, imposta prezzi e aggiorna le quantità in tempo reale.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCategoryManagerOpen((v) => !v)}
              className={`cursor-pointer border px-4 py-3.5 text-xs font-bold uppercase tracking-[0.18em] transition ${
                isCategoryManagerOpen
                  ? "border-amber-400 bg-amber-400/20 text-amber-200"
                  : "border-white/25 bg-white/8 text-white hover:border-white/50 hover:bg-white/15"
              }`}
            >
              🏷️ {isCategoryManagerOpen ? "Chiudi Categorie" : `Gestisci Categorie (${categories.length})`}
            </button>
            {!isEditorOpen && (
              <button
                type="button"
                onClick={openNewProductEditor}
                className="cursor-pointer border-2 border-[#e01010] bg-[#e01010] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg transition hover:bg-[#b80d0d]"
              >
                + Carica Nuovo Prodotto
              </button>
            )}
          </div>
        </div>

        {/* ── AVVISI DATABASE / STATO ── */}
        {(!databaseEnabled || usingFallbackData) && (
          <section className="border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
            {!databaseEnabled
              ? "⚠️ DATABASE_URL non configurato: stai visualizzando il catalogo statico di lettura."
              : "⚠️ Connessione al database temporaneamente non disponibile: le modifiche sono disabilitate."}
          </section>
        )}

        {/* ── MESSAGGIO DI CONFERMA / ERRORE GLOBALE ── */}
        {success && (
          <div className="flex flex-wrap items-center justify-between gap-4 border border-emerald-400/40 bg-emerald-500/15 px-5 py-4 text-sm text-emerald-100">
            <div className="flex items-center gap-3">
              <span className="text-lg">✅</span>
              <span className="font-medium">{success.message}</span>
            </div>
            <div className="flex items-center gap-3">
              {success.productSlug && (
                <Link
                  href={`/product/${success.productSlug}`}
                  target="_blank"
                  className="border border-emerald-300/40 bg-emerald-400/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-400/30"
                >
                  Vedi nello Shop ↗
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSuccess(null)}
                className="cursor-pointer text-xs uppercase tracking-wider text-white/60 hover:text-white"
              >
                Chiudi ✕
              </button>
            </div>
          </div>
        )}

        {error && !isEditorOpen && (
          <div className="flex items-center justify-between gap-4 border border-red-400/40 bg-red-500/15 px-5 py-4 text-sm text-red-100">
            <span>⚠️ {error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="cursor-pointer text-xs uppercase tracking-wider text-white/60 hover:text-white"
            >
              Chiudi ✕
            </button>
          </div>
        )}

        {/* ── PANNELLO GESTIONE CATEGORIE (INSERISCI / MODIFICA / ELIMINA) ── */}
        {isCategoryManagerOpen && (
          <section className="border-2 border-amber-400/35 bg-[#141414] p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="inline-block bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                  Reparti Store
                </span>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Gestione Categorie ({categories.length})
                </h2>
                <p className="mt-0.5 text-xs text-white/55">
                  Aggiungi nuove categorie (es. Maglie, Accessori), rinomina quelle esistenti o elimina quelle inutilizzate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryManagerOpen(false)}
                className="cursor-pointer border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white/75 hover:bg-white/15 hover:text-white"
              >
                ✕ Chiudi
              </button>
            </div>

            {/* Form Creazione Nuova Categoria */}
            {canWrite && (
              <div className="mt-5 border border-white/12 bg-black/40 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                  + Aggiungi Nuova Categoria
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome categoria (es. Maglie, Pantaloni, Accessori...)"
                    className="input-admin sm:w-64"
                  />
                  <input
                    type="text"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    placeholder="Descrizione breve per lo store (opzionale)..."
                    className="input-admin flex-1"
                  />
                  <button
                    type="button"
                    disabled={isCreatingCategory || !newCategoryName.trim()}
                    onClick={handleCreateCategory}
                    className="cursor-pointer bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-amber-300 disabled:opacity-40"
                  >
                    {isCreatingCategory ? "Creazione…" : "+ Crea Categoria"}
                  </button>
                </div>
              </div>
            )}

            {/* Lista Categorie Esistenti */}
            <div className="mt-5 divide-y divide-white/10 border border-white/10 bg-[#0d0d0d]">
              {categories.map((cat) => {
                const isEditingCat = editingCategoryId === cat.id;
                const isDeletingCat = deletingCategoryId === cat.id;
                const otherCats = categories.filter((c) => c.id !== cat.id);

                return (
                  <div key={cat.id} className="p-4 transition hover:bg-white/[0.02]">
                    {isEditingCat ? (
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            placeholder="Nome categoria"
                            className="input-admin sm:w-56"
                          />
                          <input
                            type="text"
                            value={editCategoryDesc}
                            onChange={(e) => setEditCategoryDesc(e.target.value)}
                            placeholder="Descrizione categoria"
                            className="input-admin flex-1"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isUpdatingCategory || !editCategoryName.trim()}
                            onClick={() => handleSaveCategoryEdit(cat.id)}
                            className="cursor-pointer bg-emerald-400 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-emerald-300 disabled:opacity-50"
                          >
                            {isUpdatingCategory ? "Salvataggio…" : "✓ Salva"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategoryId(null)}
                            className="cursor-pointer border border-white/20 px-3 py-2 text-xs text-white/70 hover:text-white"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-base font-bold text-white">{cat.name}</span>
                            <span className="border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/70">
                              {cat.count} {cat.count === 1 ? "prodotto" : "prodotti"}
                            </span>
                            <span className="font-mono text-[11px] text-white/35">
                              /{cat.slug}
                            </span>
                          </div>
                          {cat.description && (
                            <p className="mt-1 truncate text-xs text-white/50">
                              {cat.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCatFilter((cur) => (cur === cat.id ? "all" : cat.id))
                            }
                            className={`cursor-pointer border px-3 py-1.5 text-xs font-semibold transition ${
                              catFilter === cat.id
                                ? "border-white bg-white text-black"
                                : "border-white/15 bg-white/5 text-white/75 hover:border-white/35 hover:text-white"
                            }`}
                          >
                            {catFilter === cat.id ? "Filtro attivo" : "Filtra capi"}
                          </button>

                          {canWrite && (
                            <>
                              <button
                                type="button"
                                onClick={() => beginEditCategory(cat)}
                                className="cursor-pointer border border-white/20 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/20"
                              >
                                ✏️ Modifica
                              </button>
                              <button
                                type="button"
                                disabled={categories.length <= 1}
                                onClick={() => beginDeleteCategory(cat)}
                                className="cursor-pointer border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-500/25 disabled:opacity-35"
                                title={
                                  categories.length <= 1
                                    ? "Deve rimanere almeno una categoria"
                                    : "Elimina categoria"
                                }
                              >
                                🗑️ Elimina
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Barra conferma eliminazione categoria */}
                    {isDeletingCat && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-red-400/35 bg-red-950/30 p-3">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-red-100">
                          <span>
                            Confermi l&apos;eliminazione della categoria{" "}
                            <strong className="text-white">&ldquo;{cat.name}&rdquo;</strong>?
                          </span>
                          {cat.count > 0 && otherCats.length > 0 && (
                            <label className="flex items-center gap-2">
                              <span>Sposta i {cat.count} prodotti in:</span>
                              <select
                                value={reassignTargetCategoryId}
                                onChange={(e) => setReassignTargetCategoryId(e.target.value)}
                                className="input-admin py-1 text-xs"
                              >
                                {otherCats.map((other) => (
                                  <option key={other.id} value={other.id}>
                                    {other.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isDeletingCategory}
                            onClick={() => handleConfirmDeleteCategory(cat)}
                            className="cursor-pointer bg-red-600 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-500 disabled:opacity-50"
                          >
                            {isDeletingCategory ? "Eliminazione…" : "Sì, elimina"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCategoryId(null)}
                            className="cursor-pointer border border-white/20 px-3 py-1.5 text-xs text-white/75 hover:text-white"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── EDITOR PRODOTTO GUIDATO (PASSO 1 - 2 - 3) ── */}
        <div ref={editorRef}>
          {isEditorOpen && (
            <form
              onSubmit={handleSubmit}
              className="border-2 border-white/20 bg-[#141414] p-6 shadow-2xl lg:p-8"
            >
              {/* Intestazione Editor */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="inline-block bg-[#e01010] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                    {editingId ? "Modalità Modifica" : "Nuovo Capo"}
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                    {editingId ? `Modifica: ${form.name || "Prodotto"}` : "Carica un Nuovo Prodotto"}
                  </h2>
                  <p className="mt-1 text-sm text-white/50">
                    Compila i 3 passaggi qui sotto e premi{" "}
                    <strong className="text-white">
                      {editingId ? "Salva Modifiche" : "Pubblica Prodotto"}
                    </strong>
                    .
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="cursor-pointer border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80 transition hover:bg-white/15 hover:text-white"
                >
                  ✕ Chiudi Editor
                </button>
              </div>

              {/* ── PASSO 1: IMMAGINI DEL PRODOTTO ── */}
              <section className="mt-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center bg-white text-sm font-bold text-black">
                      1
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white">Foto del Prodotto *</h3>
                      <p className="text-xs text-white/50">
                        Scatta o carica dal telefono. Scegli se applicare filtri e miglioramenti automatici oppure tenere le foto originali.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput((v) => !v)}
                    className="cursor-pointer text-xs font-semibold text-white/50 underline hover:text-white"
                  >
                    {showUrlInput ? "Nascondi inserimento link URL" : "+ Incolla link URL immagine"}
                  </button>
                </div>

                {/* ── SELETTORE MODALITÀ FOTO ── */}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => changePhotoMode("studio")}
                    aria-pressed={photoMode === "studio"}
                    className={`cursor-pointer border p-3 text-left transition ${
                      photoMode === "studio"
                        ? "border-emerald-400 bg-emerald-500/20"
                        : "border-white/15 bg-black/40 hover:border-white/35"
                    }`}
                  >
                    <span className="block text-sm font-bold text-white">✨ Con filtri e miglioramenti</span>
                    <span className="mt-0.5 block text-[11px] text-white/60">
                      Luce, nitidezza, ritaglio 4:5 e WebP leggero. Consigliato per foto veloci da telefono.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changePhotoMode("original")}
                    aria-pressed={photoMode === "original"}
                    className={`cursor-pointer border p-3 text-left transition ${
                      photoMode === "original"
                        ? "border-white bg-white/15"
                        : "border-white/15 bg-black/40 hover:border-white/35"
                    }`}
                  >
                    <span className="block text-sm font-bold text-white">📷 Originale, senza filtri</span>
                    <span className="mt-0.5 block text-[11px] text-white/60">
                      La foto resta come l&apos;hai scattata (niente ritocchi né ritagli). Solo HEIC/foto enormi vengono convertite in JPG.
                    </span>
                  </button>
                </div>

                {photoMode === "studio" && (
                <div className="mt-4 border border-emerald-400/30 bg-emerald-950/15 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-black">
                        ⚡ Studio Web Attivo
                      </span>
                      <span className="text-xs font-bold text-white">
                        Ottimizzazione Automatica Foto da Telefono (Formato WebP + Luce &amp; Nitidezza)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-300/80">
                      Converte foto da 10MB in ~150KB nitidissimi in 0.2 secondi
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    {/* Scelta rapida Resa Grafica in ingresso */}
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">
                        Resa Grafica Automatica al Caricamento:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {PHOTO_PRESETS.map((preset) => {
                          const active = autoPhotoPreset === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setAutoPhotoPreset(preset.id)}
                              className={`cursor-pointer border px-2.5 py-1.5 text-xs font-bold transition ${
                                active
                                  ? "border-emerald-400 bg-emerald-500/25 text-white"
                                  : "border-white/12 bg-black/50 text-white/65 hover:border-white/30 hover:text-white"
                              }`}
                              title={preset.description}
                            >
                              {preset.shortLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scelta rapida Inquadratura / Formato E-commerce */}
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">
                        Inquadratura &amp; Formato Sito Web:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {PHOTO_FRAME_MODES.slice(0, 4).map((mode) => {
                          const active = autoFrameMode === mode.id;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => setAutoFrameMode(mode.id)}
                              className={`cursor-pointer border px-2.5 py-1.5 text-xs font-bold transition ${
                                active
                                  ? "border-white bg-white text-black"
                                  : "border-white/12 bg-black/50 text-white/65 hover:border-white/30 hover:text-white"
                              }`}
                              title={mode.description}
                            >
                              {mode.shortLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Pulsanti rapidi per telefono */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="cursor-pointer border border-white bg-white px-3 py-4 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-white/90"
                  >
                    📸 Scatta foto
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border border-white/30 bg-white/5 px-3 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white/15"
                  >
                    🖼️ Dalla galleria
                  </button>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files?.length) {
                        void handleFilesSelected(e.target.files);
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {/* Dropzone grande e intuitiva */}
                <div
                  onDragOver={(e: DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setIsDraggingFiles(true);
                  }}
                  onDragLeave={() => setIsDraggingFiles(false)}
                  onDrop={(e: DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setIsDraggingFiles(false);
                    if (e.dataTransfer.files?.length) {
                      void handleFilesSelected(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-3 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-8 text-center transition ${
                    isDraggingFiles
                      ? "border-[#e01010] bg-[#e01010]/10"
                      : "border-white/25 bg-black/40 hover:border-white/50 hover:bg-white/5"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files?.length) {
                        void handleFilesSelected(e.target.files);
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                  />
                  <div className="text-3xl">📸</div>
                  <p className="mt-2 text-base font-bold text-white">
                    Clicca qui per scattare o scegliere le foto dal telefono (oppure trascinale qui)
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    Modalità attiva: <strong className="text-white">{photoMode === "studio" ? "con filtri (WebP HD 4:5)" : "originale, senza filtri"}</strong>
                  </p>
                  <span className="mt-4 inline-block border border-white/30 bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white/90">
                    Sfoglia o Scatta Foto dal Telefono
                  </span>
                </div>

                {/* Inserimento opzionale tramite URL */}
                {showUrlInput && (
                  <div className="mt-3 flex flex-col gap-2 border border-white/10 bg-black/40 p-4 sm:flex-row">
                    <input
                      type="url"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      placeholder="https://esempio.com/foto-prodotto.jpg"
                      className="input-admin flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="cursor-pointer border border-white bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black"
                    >
                      Aggiungi URL
                    </button>
                  </div>
                )}

                {/* Griglia Foto Caricate (Anteprima reale 4:5 come nello Shop) */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {uploadedImages.map((img, index) => {
                      const savingsPercent =
                        img.originalSizeBytes &&
                        img.outputSizeBytes &&
                        img.originalSizeBytes > img.outputSizeBytes
                          ? Math.round(
                              ((img.originalSizeBytes - img.outputSizeBytes) /
                                img.originalSizeBytes) *
                                100,
                            )
                          : null;

                      return (
                        <div
                          key={img.localId}
                          className={`relative flex flex-col justify-between border p-3 transition ${
                            index === 0
                              ? "border-emerald-400/50 bg-emerald-950/15"
                              : "border-white/12 bg-black/40"
                          }`}
                        >
                          <div>
                            <div className="relative aspect-4/5 w-full overflow-hidden border border-white/10 bg-[#141414]">
                              {img.url && !img.uploading ? (
                                <Image
                                  src={img.url}
                                  alt={img.alt || form.name || "Foto prodotto"}
                                  fill
                                  className="object-cover"
                                  sizes="260px"
                                />
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-white/60">
                                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                  <span>Ottimizzazione Studio WebP…</span>
                                  {img.fileName && (
                                    <span className="truncate text-[10px] text-white/40">
                                      {img.fileName}
                                    </span>
                                  )}
                                </div>
                              )}
                              {index === 0 && (
                                <span className="absolute top-2 left-2 bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow">
                                  ⭐ Foto Principale
                                </span>
                              )}
                              {img.url && !img.uploading && (
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/65 to-transparent px-2.5 py-1.5 pt-5 text-[10px]">
                                  <span className="font-bold text-emerald-300">
                                    ⚡ {img.formatLabel || "WEBP"}
                                    {img.width && img.height ? ` · ${img.width}×${img.height}` : ""}
                                  </span>
                                  {img.outputSizeBytes && (
                                    <span className="font-mono text-white/80">
                                      {formatFileSize(img.outputSizeBytes)}
                                      {savingsPercent ? ` (-${savingsPercent}%)` : ""}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Pulsante Studio Fotografico / Ritaglia */}
                            {img.url && !img.uploading && (
                              <button
                                type="button"
                                onClick={() => setStudioEditingImageId(img.localId)}
                                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-emerald-200 transition hover:border-emerald-300 hover:bg-emerald-400 hover:text-black"
                              >
                                ✨ Migliora Luce / Ritaglia Foto
                              </button>
                            )}

                            <input
                              type="text"
                              value={img.alt}
                              onChange={(e) =>
                                setForm((cur) =>
                                  updateImageRow(cur, img.localId, { alt: e.target.value }),
                                )
                              }
                              placeholder="Descrizione foto (opzionale)"
                              className="mt-2 w-full border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder:text-white/25 focus:border-white/35 focus:outline-none"
                            />
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 border-t border-white/10 pt-2.5">
                            {index > 0 ? (
                              <button
                                type="button"
                                onClick={() => setForm((cur) => setAsPrimaryImage(cur, img.localId))}
                                className="cursor-pointer border border-white/15 bg-white/8 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-black"
                              >
                                ⭐ Imposta Principale
                              </button>
                            ) : (
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                                Copertina Shop
                              </span>
                            )}

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => setForm((cur) => moveImage(cur, img.localId, -1))}
                                className="cursor-pointer border border-white/12 px-2 py-1 text-xs text-white/70 hover:bg-white/10 disabled:opacity-25"
                                title="Sposta a sinistra"
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                disabled={index === uploadedImages.length - 1}
                                onClick={() => setForm((cur) => moveImage(cur, img.localId, 1))}
                                className="cursor-pointer border border-white/12 px-2 py-1 text-xs text-white/70 hover:bg-white/10 disabled:opacity-25"
                                title="Sposta a destra"
                              >
                                →
                              </button>
                              <button
                                type="button"
                                onClick={() => setForm((cur) => removeImage(cur, img.localId))}
                                className="cursor-pointer border border-red-400/25 bg-red-500/10 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-500/25"
                                title="Rimuovi foto"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── VIDEO DEL PRODOTTO (opzionale) ── */}
                <div className="mt-6 border border-white/12 bg-black/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">🎬 Video del prodotto (opzionale)</h4>
                      <p className="text-[11px] text-white/50">
                        MP4/MOV dal telefono, max {MAX_VIDEO_MB} MB l&apos;uno (fino a 6). Viene creata in automatico la copertina.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => videoCameraInputRef.current?.click()}
                        className="cursor-pointer border border-white bg-white px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-black"
                      >
                        🎥 Registra
                      </button>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="cursor-pointer border border-white/30 bg-white/5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/15"
                      >
                        📁 Scegli video
                      </button>
                    </div>
                    <input
                      ref={videoCameraInputRef}
                      type="file"
                      accept="video/*"
                      capture="environment"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files?.length) {
                          void handleVideosSelected(e.target.files);
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                    />
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files?.length) {
                          void handleVideosSelected(e.target.files);
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {form.videos.length > 0 && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {form.videos.map((v, i) => (
                        <div key={v.localId} className="border border-white/12 bg-black/40 p-2">
                          <div className="relative aspect-4/5 w-full overflow-hidden bg-[#141414]">
                            {v.url && !v.uploading ? (
                              <video
                                src={v.url}
                                poster={v.posterUrl || undefined}
                                controls
                                playsInline
                                preload="metadata"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
                                <span className="text-xs font-bold text-white">
                                  Caricamento… {v.progress ?? 0}%
                                </span>
                                <div className="h-1.5 w-full bg-white/15">
                                  <div className="h-full bg-emerald-400" style={{ width: `${v.progress ?? 0}%` }} />
                                </div>
                                <span className="truncate text-[10px] text-white/50">{v.fileName}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-white/50">
                              {v.sizeBytes ? formatFileSize(v.sizeBytes) : `Video ${i + 1}`}
                            </span>
                            <div className="flex gap-1">
                              <button type="button" disabled={i === 0} onClick={() => moveVideo(v.localId, -1)} className="cursor-pointer border border-white/20 px-2 py-1 text-white disabled:opacity-30">←</button>
                              <button type="button" disabled={i === form.videos.length - 1} onClick={() => moveVideo(v.localId, 1)} className="cursor-pointer border border-white/20 px-2 py-1 text-white disabled:opacity-30">→</button>
                              <button type="button" onClick={() => removeVideo(v.localId)} className="cursor-pointer border border-red-400/40 px-2 py-1 text-red-300">✕</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* ── PASSO 2: INFORMAZIONI PRINCIPALI ── */}
              <section className="mt-8 border-t border-white/10 pt-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center bg-white text-sm font-bold text-black">
                    2
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Dati Principali del Capo</h3>
                    <p className="text-xs text-white/50">
                      Inserisci il nome, la categoria e il prezzo di vendita.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <Field label="Nome del Prodotto *" className="lg:col-span-2">
                    <input
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="input-admin text-base font-medium"
                      placeholder="es. GIACCA DENIM DESTROYED JP-01"
                      required
                    />
                  </Field>

                  <Field label="Categoria *">
                    <div className="flex gap-2">
                      <select
                        value={form.categoryId}
                        onChange={(e) => updateForm(setForm, "categoryId", e.target.value)}
                        className="input-admin flex-1"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewCategory((v) => !v)}
                        className="cursor-pointer border border-white/20 bg-white/5 px-3 text-xs font-bold text-white transition hover:bg-white/15"
                        title="Crea nuova categoria"
                      >
                        + Nuova
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCategoryManagerOpen((v) => !v)}
                        className="cursor-pointer border border-amber-400/35 bg-amber-400/10 px-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-400/20"
                        title="Modifica o elimina categorie"
                      >
                        ⚙️ Gestisci
                      </button>
                    </div>
                    {showNewCategory && (
                      <div className="mt-2 flex gap-2 border border-white/15 bg-black/60 p-2.5">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Nome nuova categoria..."
                          className="input-admin flex-1 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          disabled={isCreatingCategory}
                          onClick={handleCreateCategory}
                          className="cursor-pointer bg-white px-3 py-1.5 text-xs font-bold uppercase text-black"
                        >
                          {isCreatingCategory ? "…" : "Crea"}
                        </button>
                      </div>
                    )}
                  </Field>

                  <Field label="Prezzo di Vendita (€) *">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.price}
                      onChange={(e) => updateForm(setForm, "price", e.target.value)}
                      className="input-admin text-base font-semibold"
                      placeholder="es. 70.00"
                      required
                    />
                  </Field>

                  <Field label="Prezzo Originale Barrato (€ — opzionale)">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.compareAt}
                      onChange={(e) => updateForm(setForm, "compareAt", e.target.value)}
                      className="input-admin"
                      placeholder="es. 95.00 (solo se in sconto)"
                    />
                  </Field>

                  <Field label="Visibilità nello Shop">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => updateForm(setForm, "status", "ACTIVE")}
                        className={`cursor-pointer border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                          form.status === "ACTIVE"
                            ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                            : "border-white/10 bg-black/30 text-white/50 hover:text-white"
                        }`}
                      >
                        🟢 Attivo
                      </button>
                      <button
                        type="button"
                        onClick={() => updateForm(setForm, "status", "DRAFT")}
                        className={`cursor-pointer border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                          form.status === "DRAFT"
                            ? "border-amber-400 bg-amber-500/20 text-amber-200"
                            : "border-white/10 bg-black/30 text-white/50 hover:text-white"
                        }`}
                      >
                        🟡 Bozza
                      </button>
                      <button
                        type="button"
                        onClick={() => updateForm(setForm, "status", "ARCHIVED")}
                        className={`cursor-pointer border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                          form.status === "ARCHIVED"
                            ? "border-white/40 bg-white/15 text-white"
                            : "border-white/10 bg-black/30 text-white/50 hover:text-white"
                        }`}
                      >
                        ⚪ Archiviato
                      </button>
                    </div>
                  </Field>

                  <div className="md:col-span-2 lg:col-span-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                        Descrizione del Capo (se lasciata vuota viene creata in automatico)
                      </span>
                      <button
                        type="button"
                        onClick={generateAutoDescription}
                        className="cursor-pointer border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
                      >
                        ✨ Genera descrizione automatica
                      </button>
                    </div>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateForm(setForm, "description", e.target.value)}
                      className="input-admin min-h-24"
                      placeholder="Descrivi il capo, la vestibilità o la lavorazione (opzionale: se non scrivi nulla verrà usata una descrizione artigianale predefinita)..."
                    />
                  </div>
                </div>
              </section>

              {/* ── PASSO 3: TAGLIE E QUANTITÀ (STOCK) ── */}
              <section className="mt-8 border-t border-white/10 pt-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center bg-white text-sm font-bold text-black">
                      3
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white">Taglie e Quantità Disponibili</h3>
                      <p className="text-xs text-white/50">
                        Scegli un gruppo di taglie rapido con un click oppure inserisci le tue taglie personalizzate.
                      </p>
                    </div>
                  </div>

                  {/* Pulsanti Taglie Rapide */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-white/40">Imposta rapido:</span>
                    {SIZE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applySizePreset(preset.sizes)}
                        className="cursor-pointer border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/15 hover:text-white"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {form.variants.map((variant, index) => {
                    const numericStock = Math.max(0, parseInt(variant.stock || "0", 10) || 0);
                    return (
                      <div
                        key={variant.localId}
                        className="flex flex-col gap-3 border border-white/12 bg-black/40 p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                            Variante #{index + 1}
                          </span>
                          {form.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setForm((cur) => removeVariant(cur, variant.localId))}
                              className="cursor-pointer text-xs font-semibold text-red-300 hover:text-red-200"
                            >
                              Rimuovi ✕
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Taglia *">
                            <input
                              value={variant.size}
                              onChange={(e) =>
                                setForm((cur) =>
                                  updateVariantRow(cur, variant.localId, { size: e.target.value }),
                                )
                              }
                              className="input-admin font-bold uppercase"
                              placeholder="es. UNI, M, 32, 57cm"
                              required
                            />
                          </Field>

                          <Field label="Quantità (Stock)">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((cur) =>
                                    updateVariantRow(cur, variant.localId, {
                                      stock: String(Math.max(0, numericStock - 1)),
                                    }),
                                  )
                                }
                                className="cursor-pointer border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-bold text-white hover:bg-white/15"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={variant.stock}
                                onChange={(e) =>
                                  setForm((cur) =>
                                    updateVariantRow(cur, variant.localId, { stock: e.target.value }),
                                  )
                                }
                                className="input-admin text-center font-bold"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((cur) =>
                                    updateVariantRow(cur, variant.localId, {
                                      stock: String(numericStock + 1),
                                    }),
                                  )
                                }
                                className="cursor-pointer border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-bold text-white hover:bg-white/15"
                              >
                                +
                              </button>
                            </div>
                          </Field>
                        </div>

                        <Field label="Colore / Nota variante (opzionale)">
                          <input
                            value={variant.color}
                            onChange={(e) =>
                              setForm((cur) =>
                                updateVariantRow(cur, variant.localId, { color: e.target.value }),
                              )
                            }
                            className="input-admin py-1.5 text-xs"
                            placeholder="es. Blu Denim, Nero (opzionale)"
                          />
                        </Field>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      setForm((cur) => ({
                        ...cur,
                        variants: [...cur.variants, emptyVariantRow()],
                      }))
                    }
                    className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-white/3 p-4 text-sm font-bold uppercase tracking-wider text-white/60 transition hover:border-white/40 hover:bg-white/8 hover:text-white"
                  >
                    <span className="text-2xl">+</span>
                    <span>Aggiungi un&apos;altra taglia</span>
                  </button>
                </div>
              </section>

              {/* ── OPZIONI AVANZATE E SEO (OPZIONALI / RICHIUDIBILI) ── */}
              <section className="mt-8 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex w-full cursor-pointer items-center justify-between border border-white/10 bg-black/30 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  <span>
                    ⚙️ Opzioni Avanzate: In Evidenza, Limited Edition, Materiali, Cura Capo e SEO (Opzionale)
                  </span>
                  <span>{showAdvanced ? "▲ Nascondi" : "▼ Mostra"}</span>
                </button>

                {showAdvanced && (
                  <div className="mt-4 grid gap-4 border border-white/10 bg-black/25 p-5 md:grid-cols-2">
                    <div className="flex flex-wrap items-center gap-6 md:col-span-2">
                      <Toggle
                        label="⭐ Metti in evidenza nella Homepage"
                        checked={form.featured}
                        onChange={(v) => updateForm(setForm, "featured", v)}
                      />
                      <Toggle
                        label="🔥 Pezzo Unico / Limited Edition"
                        checked={form.limitedEdition}
                        onChange={(v) => updateForm(setForm, "limitedEdition", v)}
                      />
                    </div>

                    <Field label="Badge personalizzato (es. NEW, 1 OF 1, LIMITED)">
                      <input
                        value={form.badge}
                        onChange={(e) => updateForm(setForm, "badge", e.target.value)}
                        className="input-admin"
                        placeholder="es. LIMITED EDITION"
                      />
                    </Field>

                    <Field label="Slug URL (generato in automatico)">
                      <input
                        value={form.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        onBlur={(e) => {
                          const sanitized = slugifyValue(e.target.value || form.name);
                          updateForm(setForm, "slug", sanitized);
                        }}
                        className="input-admin"
                        placeholder="automatico-dal-nome"
                      />
                    </Field>

                    <Field label="Materiali e Composizione">
                      <textarea
                        value={form.materialNotes}
                        onChange={(e) => updateForm(setForm, "materialNotes", e.target.value)}
                        className="input-admin min-h-20"
                        placeholder="es. 100% Cotone Denim Vintage rigenerato a mano"
                      />
                    </Field>

                    <Field label="Cura del Capo / Lavaggio">
                      <textarea
                        value={form.careNotes}
                        onChange={(e) => updateForm(setForm, "careNotes", e.target.value)}
                        className="input-admin min-h-20"
                        placeholder="es. Lavare a mano in acqua fredda, non asciugare in asciugatrice"
                      />
                    </Field>

                    <Field label="Titolo SEO (Google)">
                      <input
                        value={form.seoTitle}
                        placeholder={form.name ? `${form.name} - Jacopo Peca` : "Automatico"}
                        onChange={(e) => updateForm(setForm, "seoTitle", e.target.value)}
                        className="input-admin"
                      />
                    </Field>

                    <Field label="Descrizione SEO (Google)">
                      <input
                        value={form.seoDescription}
                        placeholder="Generata automaticamente"
                        onChange={(e) => updateForm(setForm, "seoDescription", e.target.value)}
                        className="input-admin"
                      />
                    </Field>
                  </div>
                )}
              </section>

              {/* Eventuale errore dentro l'editor */}
              {error && (
                <div className="mt-5 border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-100">
                  ⚠️ {error}
                </div>
              )}

              {/* Barra Azioni Salvataggio */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <div className="text-xs text-white/45">
                  {uploadedImages.length} foto caricate ·{" "}
                  {form.variants.reduce((sum, v) => sum + (parseInt(v.stock || "0", 10) || 0), 0)}{" "}
                  pezzi totali in stock
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={cancelEdit}
                    className="cursor-pointer border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !canWrite}
                    className="cursor-pointer border-2 border-[#e01010] bg-[#e01010] px-7 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#b80d0d] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmitting
                      ? "Salvataggio in corso…"
                      : editingId
                        ? "💾 Salva Modifiche"
                        : "🚀 Pubblica Prodotto"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ── FILTRI RAPIDI E BARRA DI RICERCA CATALOGO ── */}
        <section className="flex flex-col gap-4 border border-white/10 bg-[#111] p-5">
          {/* Tab di stato cliccabili */}
          <div className="flex flex-wrap gap-2">
            <StatusTab
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              label="Tutti"
              count={counts.all}
            />
            <StatusTab
              active={statusFilter === "in_stock"}
              onClick={() => setStatusFilter("in_stock")}
              label="🟢 Disponibili"
              count={counts.in_stock}
            />
            <StatusTab
              active={statusFilter === "out_of_stock"}
              onClick={() => setStatusFilter("out_of_stock")}
              label="🔴 Esauriti (0 pz)"
              count={counts.out_of_stock}
            />
            <StatusTab
              active={statusFilter === "draft"}
              onClick={() => setStatusFilter("draft")}
              label="🟡 Bozze"
              count={counts.draft}
            />
            <StatusTab
              active={statusFilter === "archived"}
              onClick={() => setStatusFilter("archived")}
              label="⚪ Archiviati"
              count={counts.archived}
            />
          </div>

          {/* Ricerca, Categoria e Ordinamento */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Cerca prodotto per nome, categoria o codice…"
                className="input-admin w-full pr-10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-xs text-white/40 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="input-admin lg:w-60"
            >
              <option value="all">Tutte le categorie ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="input-admin lg:w-52"
            >
              <option value="recent">Più recenti prima</option>
              <option value="name">Ordine alfabetico (A-Z)</option>
              <option value="price">Prezzo (dal più alto)</option>
              <option value="stock">Quantità stock</option>
              <option value="category">Categoria</option>
            </select>
          </div>
        </section>

        {/* ── TABELLA PRODOTTI A TUTTA LARGHEZZA ── */}
        <section className="overflow-hidden border border-white/10 bg-[#111]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/4">
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Prodotto
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Categoria
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Prezzo
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Stato
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-[0.18em] text-white/40">
                    Taglie & Stock
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs uppercase tracking-[0.18em] text-white/40">
                    Azioni Rapide
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const thumb = product.images.find((img) => img.isThumbnail) ?? product.images[0];
                  const isEditingStock = stockEditId === product.id;
                  const isConfirmingDelete = confirmDeleteId === product.id;
                  const totalStock = stockCount(product);

                  return (
                    <Fragment key={product.id}>
                      <tr
                        className={`border-b border-white/6 align-middle transition hover:bg-white/4 ${
                          editingId === product.id ? "bg-white/8" : ""
                        }`}
                      >
                        {/* Prodotto + Foto */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3.5">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-white/12 bg-[#1a1a1a]">
                              {thumb ? (
                                <Image
                                  src={thumb.url}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-white/30">
                                  No foto
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="font-semibold text-white">{product.name}</p>
                                {product.featured && (
                                  <span className="bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                                    ★ Home
                                  </span>
                                )}
                                {product.badge && (
                                  <span className="bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white/80">
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-white/35">
                                {product.images.length} foto · /{product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Categoria */}
                        <td className="px-4 py-3.5">
                          <span className="border border-white/12 bg-white/5 px-2.5 py-1 text-xs text-white/75">
                            {product.categoryName}
                          </span>
                        </td>

                        {/* Prezzo */}
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-white">{formatPrice(product.priceCents)}</p>
                          {product.salePrice && product.salePrice > product.priceCents && (
                            <p className="text-xs text-white/35 line-through">
                              {formatPrice(product.salePrice)}
                            </p>
                          )}
                        </td>

                        {/* Stato */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block border px-2.5 py-1 text-xs font-semibold ${statusClassName(
                              product.status,
                              product.inStock,
                            )}`}
                          >
                            {statusLabel(product.status, product.inStock)}
                          </span>
                        </td>

                        {/* Taglie & Stock */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {product.sizes.map((s) => (
                              <span
                                key={s.id}
                                className={`border px-2 py-0.5 text-xs ${
                                  s.stock > 0
                                    ? "border-white/15 bg-white/5 text-white/80"
                                    : "border-red-400/25 bg-red-500/10 text-red-300"
                                }`}
                              >
                                <strong>{s.label}:</strong> {s.stock}
                              </span>
                            ))}
                            <span className="ml-1 text-xs text-white/40">({totalStock} tot)</span>
                          </div>
                        </td>

                        {/* Azioni */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => beginEdit(product)}
                              className="cursor-pointer border border-white/25 bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white/85"
                            >
                              ✏️ Modifica
                            </button>

                            <button
                              type="button"
                              onClick={() => duplicateProduct(product)}
                              className="cursor-pointer border border-white/20 bg-white/8 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/20"
                              title="Duplica questo prodotto per crearne uno simile in 1 secondo"
                            >
                              📋 Duplica
                            </button>

                            {canWrite && (
                              <button
                                type="button"
                                onClick={() => beginQuickSale(product)}
                                className={`cursor-pointer border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                                  quickSaleProductId === product.id
                                    ? "border-amber-400 bg-amber-500/25 text-amber-200"
                                    : "border-amber-400/35 bg-amber-500/12 text-amber-300 hover:bg-amber-500/25"
                                }`}
                                title="Segna come venduto in Store / Instagram / WhatsApp"
                              >
                                ⚡ Venduto
                              </button>
                            )}

                            {canWrite && (
                              <button
                                type="button"
                                onClick={() =>
                                  isEditingStock ? setStockEditId(null) : beginStockEdit(product)
                                }
                                className={`cursor-pointer border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                                  isEditingStock
                                    ? "border-blue-400 bg-blue-500/20 text-blue-200"
                                    : "border-blue-400/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                                }`}
                              >
                                📦 Stock
                              </button>
                            )}

                            {canWrite && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleToggleFeatured(product, !product.featured)}
                                className={`cursor-pointer border px-2 py-1.5 text-xs font-bold transition ${
                                  product.featured
                                    ? "border-amber-400/50 bg-amber-400/20 text-amber-300"
                                    : "border-white/15 bg-white/5 text-white/45 hover:text-white"
                                }`}
                                title={
                                  product.featured
                                    ? "In evidenza in Home (clicca per rimuovere)"
                                    : "Metti in evidenza in Home e in cima allo shop"
                                }
                              >
                                ★
                              </button>
                            )}

                            {canWrite && product.status !== "ACTIVE" && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleQuickStatusChange(product, "ACTIVE")}
                                className="cursor-pointer border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/25"
                              >
                                🟢 Pubblica
                              </button>
                            )}

                            {canWrite && product.status === "ACTIVE" && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleQuickStatusChange(product, "ARCHIVED")}
                                className="cursor-pointer border border-white/15 bg-white/5 px-2 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/15 hover:text-white"
                                title="Nascondi dallo shop (Archivia)"
                              >
                                Archivia
                              </button>
                            )}

                            {canWrite && (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDeleteId(isConfirmingDelete ? null : product.id)
                                }
                                className="cursor-pointer border border-red-400/25 bg-red-500/10 px-2 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/25"
                                title="Elimina definitivamente"
                              >
                                🗑️
                              </button>
                            )}

                            <Link
                              href={`/product/${product.slug}`}
                              target="_blank"
                              className="border border-white/12 px-2 py-1.5 text-xs font-semibold text-white/55 transition hover:border-white/30 hover:text-white"
                              title="Apri scheda prodotto nello shop"
                            >
                              ↗
                            </Link>
                          </div>
                        </td>
                      </tr>

                      {/* Barra Vendita Rapida (Store / Instagram / WhatsApp) */}
                      {quickSaleProductId === product.id && (
                        <tr className="border-b border-amber-400/30 bg-amber-950/20">
                          <td colSpan={6} className="px-5 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                                  ⚡ Vendita Diretta — {product.name} ({formatPrice(product.priceCents)}):
                                </span>

                                <select
                                  value={quickSaleChannel}
                                  onChange={(e) =>
                                    setQuickSaleChannel(
                                      e.target.value as "INSTAGRAM" | "WHATSAPP" | "STORE",
                                    )
                                  }
                                  className="input-admin w-44 py-1.5 text-xs"
                                >
                                  <option value="INSTAGRAM">📸 Instagram DM</option>
                                  <option value="WHATSAPP">💬 WhatsApp</option>
                                  <option value="STORE">🏪 Negozio Fisico</option>
                                </select>

                                {product.sizes.length > 1 && (
                                  <select
                                    value={quickSaleVariantId}
                                    onChange={(e) => setQuickSaleVariantId(e.target.value)}
                                    className="input-admin w-32 py-1.5 text-xs"
                                  >
                                    {product.sizes.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        Taglia {s.label} ({s.stock} pz)
                                      </option>
                                    ))}
                                  </select>
                                )}

                                <input
                                  type="text"
                                  value={quickSaleCustomer}
                                  onChange={(e) => setQuickSaleCustomer(e.target.value)}
                                  placeholder="Nome cliente / @instagram (opzionale)"
                                  className="input-admin w-56 py-1.5 text-xs"
                                />

                                <input
                                  type="tel"
                                  value={quickSalePhone}
                                  onChange={(e) => setQuickSalePhone(e.target.value)}
                                  placeholder="Telefono (opzionale)"
                                  className="input-admin w-44 py-1.5 text-xs"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handleConfirmQuickSale(product)}
                                  className="cursor-pointer bg-amber-400 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-amber-300"
                                >
                                  {isSubmitting ? "Registrazione…" : "✓ Conferma Vendita e Scala Stock"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setQuickSaleProductId(null)}
                                  className="cursor-pointer border border-white/20 px-3 py-2 text-xs text-white/70 hover:text-white"
                                >
                                  Annulla
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Barra modifica rapida Stock */}
                      {isEditingStock && (
                        <tr className="border-b border-blue-400/25 bg-blue-950/20">
                          <td colSpan={6} className="px-5 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex flex-wrap items-center gap-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                                  📦 Modifica Rapida Stock — {product.name}:
                                </span>
                                {product.sizes.map((variant) => {
                                  const currentVal =
                                    parseInt(stockValues[variant.id] ?? String(variant.stock), 10) ||
                                    0;
                                  return (
                                    <div
                                      key={variant.id}
                                      className="flex items-center gap-1.5 border border-white/15 bg-black/50 px-3 py-1.5"
                                    >
                                      <span className="mr-1 text-xs font-bold uppercase text-white">
                                        {variant.label}:
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setStockValues((cur) => ({
                                            ...cur,
                                            [variant.id]: String(Math.max(0, currentVal - 1)),
                                          }))
                                        }
                                        className="cursor-pointer border border-white/15 bg-white/10 px-2 py-0.5 text-xs font-bold text-white hover:bg-white/20"
                                      >
                                        −
                                      </button>
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
                                        className="w-14 border border-white/15 bg-black px-2 py-0.5 text-center text-xs font-bold text-white"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setStockValues((cur) => ({
                                            ...cur,
                                            [variant.id]: String(currentVal + 1),
                                          }))
                                        }
                                        className="cursor-pointer border border-white/15 bg-white/10 px-2 py-0.5 text-xs font-bold text-white hover:bg-white/20"
                                      >
                                        +
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={handleStockSave}
                                  className="cursor-pointer bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white/85"
                                >
                                  {isSubmitting ? "Salvataggio…" : "✓ Salva Stock"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStockEditId(null)}
                                  className="cursor-pointer border border-white/20 px-3 py-2 text-xs text-white/70 hover:text-white"
                                >
                                  Annulla
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Barra conferma Eliminazione Definitiva */}
                      {isConfirmingDelete && (
                        <tr className="border-b border-red-400/30 bg-red-950/25">
                          <td colSpan={6} className="px-5 py-3.5">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <p className="text-xs font-medium text-red-200">
                                ⚠️ Vuoi eliminare definitivamente{" "}
                                <strong className="text-white">&ldquo;{product.name}&rdquo;</strong> dal
                                catalogo? (Se vuoi solo nasconderlo dallo shop usa &ldquo;Archivia&rdquo;).
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handlePermanentDelete(product.id)}
                                  className="cursor-pointer bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-500"
                                >
                                  {isSubmitting ? "Eliminazione…" : "Sì, Elimina Definitivamente"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="cursor-pointer border border-white/20 px-3 py-1.5 text-xs text-white/75 hover:text-white"
                                >
                                  Annulla
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-white/40">
                      Nessun prodotto trovato con i filtri selezionati.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modale Studio Fotografico & Ritaglio E-Commerce */}
        {(() => {
          const targetImg = form.images.find((img) => img.localId === studioEditingImageId);
          return (
            <PhotoStudioModal
              isOpen={Boolean(targetImg)}
              sourceFile={targetImg?.rawFile}
              sourceUrl={targetImg?.url}
              fileName={targetImg?.fileName || `${form.slug || "capo"}-studio.webp`}
              initialSettings={
                targetImg?.studioSettings ??
                buildDefaultStudioSettings(autoPhotoPreset, autoFrameMode)
              }
              onClose={() => setStudioEditingImageId(null)}
              onApply={async (result) => {
                if (targetImg) {
                  await handleStudioApply(targetImg.localId, result);
                }
              }}
            />
          );
        })()}
      </main>
    </div>
  );
}

// ── Componenti UI di supporto ───────────────────────────────────────────────

function StatusTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${
        active
          ? "border-white bg-white text-black"
          : "border-white/12 bg-white/4 text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label} <span className="ml-1 opacity-70">({count})</span>
    </button>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
        {label}
      </span>
      {children}
    </label>
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
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-white/80 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#e01010]"
      />
      {label}
    </label>
  );
}

// ── Helpers stato & immagini ────────────────────────────────────────────────

function updateForm<Key extends keyof ProductFormState>(
  setForm: Dispatch<SetStateAction<ProductFormState>>,
  key: Key,
  value: ProductFormState[Key],
) {
  setForm((cur) => ({ ...cur, [key]: value }));
}

function buildEmptyForm(categories: AppCategory[], databaseEnabled: boolean): ProductFormState {
  return {
    name: "",
    slug: "",
    description: "",
    categoryId: categories[0]?.id ?? "",
    price: "",
    compareAt: "",
    status: databaseEnabled ? "ACTIVE" : "DRAFT",
    featured: false,
    limitedEdition: false,
    badge: "",
    materialNotes: "",
    careNotes: "",
    seoTitle: "",
    seoDescription: "",
    images: [],
    videos: [],
    variants: [emptyVariantRow()],
  };
}

function emptyVariantRow(): VariantFormRow {
  return {
    localId: genId(),
    sku: "",
    size: "UNI",
    color: "",
    stock: "1",
  };
}

function updateImageRow(
  form: ProductFormState,
  localId: string,
  patch: Partial<ImageFormRow>,
): ProductFormState {
  return {
    ...form,
    images: form.images.map((img) => (img.localId === localId ? { ...img, ...patch } : img)),
  };
}

function updateVariantRow(
  form: ProductFormState,
  localId: string,
  patch: Partial<VariantFormRow>,
): ProductFormState {
  return {
    ...form,
    variants: form.variants.map((v) => (v.localId === localId ? { ...v, ...patch } : v)),
  };
}

function removeImage(form: ProductFormState, localId: string): ProductFormState {
  const images = form.images
    .filter((img) => img.localId !== localId)
    .map((img, i) => ({ ...img, sortOrder: i }));
  return { ...form, images };
}

function setAsPrimaryImage(form: ProductFormState, localId: string): ProductFormState {
  const target = form.images.find((img) => img.localId === localId);
  if (!target) return form;
  const others = form.images.filter((img) => img.localId !== localId);
  return {
    ...form,
    images: [target, ...others].map((img, i) => ({ ...img, sortOrder: i })),
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
  return { ...form, variants: variants.length > 0 ? variants : [emptyVariantRow()] };
}

function parseEuroString(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const num = Number.parseFloat(normalized);
  return Number.isFinite(num) ? num : null;
}

function buildPayload(form: ProductFormState, categories: AppCategory[]) {
  const parsedPrice = parseEuroString(form.price) ?? 0;
  const priceCents = Math.round(parsedPrice * 100);
  const parsedCompare = parseEuroString(form.compareAt);
  const compareAtCents = parsedCompare && parsedCompare >= 0.5 ? Math.round(parsedCompare * 100) : null;

  const resolvedSlug = slugifyValue(form.slug || form.name) || `capo-${Date.now().toString(36)}`;
  const catName = categories.find((c) => c.id === form.categoryId)?.name || "Denim Streetwear";
  const resolvedDescription =
    form.description.trim().length >= 5
      ? form.description.trim()
      : `${form.name.trim()} — ${catName} artigianale Jacopo Peca lavorato a mano in Italia.`;

  return {
    name: form.name.trim(),
    slug: resolvedSlug,
    description: resolvedDescription,
    categoryId: form.categoryId,
    priceCents,
    compareAtCents,
    status: form.status,
    featured: form.featured,
    limitedEdition: form.limitedEdition,
    badge: form.badge.trim(),
    materialNotes: form.materialNotes.trim(),
    careNotes: form.careNotes.trim(),
    seoTitle: form.seoTitle.trim(),
    seoDescription: form.seoDescription.trim(),
    images: form.images
      .filter((img) => img.url.trim() && !img.uploading)
      .map((img, i) => ({
        url: img.url.trim(),
        alt: img.alt.trim() || form.name.trim(),
        width: img.width,
        height: img.height,
        sortOrder: i,
      })),
    videos: form.videos
      .filter((v) => v.url.trim() && !v.uploading)
      .map((v, i) => ({
        url: v.url.trim(),
        posterUrl: v.posterUrl.trim() || null,
        sortOrder: i,
      })),
    variants: form.variants.map((v) => ({
      sku: v.sku.trim(),
      size: v.size.trim() || "UNI",
      color: v.color.trim(),
      stock: Math.max(0, Number.parseInt(v.stock || "0", 10) || 0),
    })),
  };
}

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
  return inStock ? "Attivo" : "Esaurito (0 pz)";
}

function statusClassName(status: AppProduct["status"], inStock: boolean) {
  if (status === "ARCHIVED") return "border-white/15 bg-white/5 text-white/45";
  if (status === "DRAFT") return "border-amber-400/35 bg-amber-400/10 text-amber-300";
  return inStock
    ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-300"
    : "border-red-400/35 bg-red-400/10 text-red-300";
}

function stockCount(product: AppProduct) {
  return product.sizes.reduce((sum, s) => sum + s.stock, 0);
}
