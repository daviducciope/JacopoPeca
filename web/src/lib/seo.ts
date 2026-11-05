import type { AppProduct } from "@/lib/product-data";
import { getCategorySeo } from "@/lib/category-seo";

export const siteName = "Jacopo Peca";
export const defaultSiteUrl = "https://jacopopeca.com";

/** Default share image used when a page has no specific one. */
export const defaultOgImage = "/images/atelier/atelier-embroidery.jpg";

export const brandDescription =
  "Jeans, giacche di jeans e felpe personalizzate fatte a mano da Jacopo Peca nel laboratorio di Montesilvano (Pescara). Denim streetwear, tattoo clothing e pezzi unici made in Italy.";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl).replace(/\/$/, "");
}

/**
 * Builds an absolute URL. Page paths get a trailing slash to match the
 * `trailingSlash: true` setting in next.config.ts (and the canonical tags that
 * Next.js generates), while asset paths with a file extension are left as-is.
 */
export function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  const match = normalized.match(/^([^?#]*)(.*)$/);
  let pathname = match?.[1] ?? normalized;
  const suffix = match?.[2] ?? "";
  const lastSegment = pathname.split("/").pop() ?? "";

  if (!pathname.endsWith("/") && !lastSegment.includes(".")) {
    pathname = `${pathname}/`;
  }

  return `${getSiteUrl()}${pathname}${suffix}`;
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function toTitleCase(value: string) {
  // Product names are stored in uppercase (e.g. "SABBIONE"): keep them readable in SERP.
  if (value !== value.toUpperCase()) return value;
  return value
    .toLowerCase()
    .replace(/(^|[\s\-(])(\p{L})/gu, (_, sep: string, letter: string) => `${sep}${letter.toUpperCase()}`);
}

export function productDisplayName(product: AppProduct) {
  return toTitleCase(product.name.trim());
}

export function productSeoLabel(product: AppProduct) {
  return (
    getCategorySeo(product.categorySlug)?.productLabel ||
    `${product.categoryName} fatto a mano`
  );
}

/**
 * Full product <title>. Returned as an absolute title (the brand is already
 * included) so the layout template does not append the brand twice.
 */
export function productSeoTitle(product: AppProduct) {
  if (product.seoTitle) return product.seoTitle;
  return `${productDisplayName(product)} – ${productSeoLabel(product)} | ${siteName}`;
}

export function productSeoDescription(product: AppProduct) {
  if (product.seoDescription) return product.seoDescription;
  const availableSizes = product.sizes
    .filter((s) => s.stock > 0)
    .map((s) => s.label)
    .join(", ");
  const sizeNote = availableSizes ? ` Taglie: ${availableSizes}.` : "";
  const label = productSeoLabel(product).toLowerCase();
  const base = `${productDisplayName(product)}: ${label} da Jacopo Peca nel laboratorio di Montesilvano (PE). Pezzo unico streetwear made in Italy, spedizione tracciata.`;
  return truncate(`${base}${sizeNote}`, 175);
}

export function productAvailability(product: AppProduct) {
  return product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
}

/** Shared Organization / store entity referenced by @id from every page. */
export function organizationJsonLd() {
  return {
    "@type": ["ClothingStore", "Organization"],
    "@id": absoluteUrl("/#atelier"),
    name: "Jacopo Peca",
    alternateName: ["JP Custom Clothing", "Tattoo JP Clothing", "Identity Denim JP"],
    description: brandDescription,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/favicon.ico"),
    image: absoluteUrl(defaultOgImage),
    email: "jacopopecajp@gmail.com",
    telephone: "+390852934313",
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Carta di credito, Apple Pay, Google Pay",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Via Benedetto Croce 18",
      addressLocality: "Montesilvano",
      addressRegion: "PE",
      postalCode: "65016",
      addressCountry: "IT",
    },
    areaServed: ["IT", "EU"],
    founder: { "@id": absoluteUrl("/about#jacopo-peca") },
    knowsAbout: [
      "Jeans personalizzati",
      "Giacche di jeans dipinte a mano",
      "Customizzazione denim",
      "Tattoo clothing",
      "Ricamo Cornely",
      "Upcycling denim",
      "Streetwear artigianale",
    ],
    sameAs: [
      "https://www.instagram.com/jpcustomclothing/",
      "https://www.tiktok.com/@jpcustomclothing",
      "https://www.facebook.com/peca.jacopo",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: absoluteUrl("/"),
    name: siteName,
    inLanguage: "it-IT",
    publisher: { "@id": absoluteUrl("/#atelier") },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
