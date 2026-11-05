import type { AppProduct } from "@/lib/product-data";

export const siteName = "Jacopo Peca";
export const defaultSiteUrl = "https://jacopopeca.com";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl).replace(/\/$/, "");
}

export function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  return `${getSiteUrl()}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function productSeoTitle(product: AppProduct) {
  return (
    product.seoTitle ||
    `${product.name} — ${product.categoryName} Artigianale Fatto a Mano | ${siteName}`
  );
}

export function productSeoDescription(product: AppProduct) {
  if (product.seoDescription) return product.seoDescription;
  const availableSizes = product.sizes
    .filter((s) => s.stock > 0)
    .map((s) => s.label)
    .join(", ");
  const sizeNote = availableSizes ? ` Taglie disponibili: ${availableSizes}.` : "";
  return `Scopri ${product.name}: ${product.categoryName.toLowerCase()} streetwear 100% fatto a mano in Italia da Jacopo Peca nel laboratorio di Montesilvano. Pezzo unico o tiratura limitata con spedizione rapida.${sizeNote}`;
}

export function productAvailability(product: AppProduct) {
  return product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
}
