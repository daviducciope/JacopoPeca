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
  return product.seoTitle || `${product.name} - ${siteName}`;
}

export function productSeoDescription(product: AppProduct) {
  return (
    product.seoDescription ||
    `${product.categoryName} handmade Jacopo Peca. Pezzo unico o limited edition made in Italy.`
  );
}

export function productAvailability(product: AppProduct) {
  return product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
}
