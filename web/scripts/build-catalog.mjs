#!/usr/bin/env node
/**
 * Parses recovered WooCommerce JSONL data and generates
 * a TypeScript catalog module for the static Next.js export.
 *
 * Usage: node scripts/build-catalog.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

// ── Read source files ──────────────────────────────────────────

const productsRaw = readFileSync(
  resolve(ROOT, "recovered-wordpress/products.jsonl"),
  "utf-8"
);
const fullExportRaw = readFileSync(
  resolve(ROOT, "recovered-wordpress/full-export.jsonl"),
  "utf-8"
);

// ── Parse JSONL sections ───────────────────────────────────────

function parseJsonlLines(text) {
  return text
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("==="))
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function parseSections(text) {
  const sections = {};
  let current = null;
  for (const line of text.split("\n")) {
    const m = line.match(/^=== (.+?) ===/);
    if (m) {
      current = m[1];
      sections[current] = [];
      continue;
    }
    if (current && line.trim()) {
      try {
        sections[current].push(JSON.parse(line));
      } catch {
        /* skip */
      }
    }
  }
  return sections;
}

const products = parseJsonlLines(productsRaw);
const sections = parseSections(fullExportRaw);

const categoriesRaw = sections["CATEGORIES JSON"] || [];
const variationsRaw = sections["VARIATIONS JSON"] || [];
const imagesRaw = sections["IMAGE PATHS JSON"] || [];
const relationsRaw = sections["PRODUCT-CATEGORY RELATIONSHIPS"] || [];

// ── Build lookup maps ──────────────────────────────────────────

const WP_UPLOADS_BASE = "https://jacopopeca.com/wp-content/uploads";

// attachment_id → url path
const imageMap = new Map();
for (const img of imagesRaw) {
  imageMap.set(img.attachment_id, `${WP_UPLOADS_BASE}/${img.url}`);
}

// product_id → term_id[]
const productCategoryMap = new Map();
for (const rel of relationsRaw) {
  if (!productCategoryMap.has(rel.product_id)) {
    productCategoryMap.set(rel.product_id, []);
  }
  productCategoryMap.get(rel.product_id).push(rel.term_id);
}

// term_id → category object
const categoryMap = new Map();
for (const cat of categoriesRaw) {
  categoryMap.set(cat.term_id, cat);
}

// parent_id → variations[]
const variationsByParent = new Map();
for (const v of variationsRaw) {
  if (!variationsByParent.has(v.parent_id)) {
    variationsByParent.set(v.parent_id, []);
  }
  variationsByParent.get(v.parent_id).push(v);
}

// ── Build categories ───────────────────────────────────────────

const activeCategories = categoriesRaw
  .filter((c) => c.count > 0)
  .sort((a, b) => b.count - a.count);

// Category descriptions for richer display
const categoryDescriptions = {
  Jeans: "Denim lavorato a mano, fit costruiti nel laboratorio.",
  "T-Shirt": "Grafica pulita, cuciture precise, fit deciso.",
  Felpa: "Oversize, lavaggi profondi, dettagli raw.",
  Cappello: "Ricamo pulito, costruzione asciutta, look everyday.",
  Giacca: "Pezzi statement, costruzione sartoriale su base denim.",
  "Giacca Denim": "Giacche custom, piccole serie, pezzi unici.",
  "Camicia Denim": "Layering leggero per drop stagionali.",
  "Denim Shorts": "Shorts in denim per i mesi caldi.",
  Pantaloni: "Pantaloni con taglio e lavorazione handmade.",
  Maglia: "Maglieria pesante con dettagli cuciti a mano.",
  "Camicia": "Camicie con lavorazione denim e dettagli hand-painted.",
};

// ── Build products ─────────────────────────────────────────────

function extractSize(variationTitle) {
  const parts = variationTitle.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1].trim() : null;
}

function getPrice(product, variations) {
  if (product.regular_price) return parseInt(product.regular_price, 10);
  if (variations && variations.length > 0) {
    for (const v of variations) {
      if (v.regular_price) return parseInt(v.regular_price, 10);
    }
  }
  return null;
}

function resolveImages(product) {
  const imgs = [];
  if (product.thumbnail_id && imageMap.has(product.thumbnail_id)) {
    imgs.push({
      url: imageMap.get(product.thumbnail_id),
      alt: product.title,
      isThumbnail: true,
    });
  }
  if (product.gallery_ids) {
    const ids =
      typeof product.gallery_ids === "string"
        ? product.gallery_ids.split(",").map(Number)
        : [product.gallery_ids];
    for (const id of ids) {
      if (imageMap.has(id) && id !== product.thumbnail_id) {
        imgs.push({
          url: imageMap.get(id),
          alt: product.title,
          isThumbnail: false,
        });
      }
    }
  }
  return imgs;
}

const catalogProducts = [];

for (const p of products) {
  // Only include published products
  if (p.status !== "publish") continue;

  const variations = variationsByParent.get(p.id) || [];
  const priceCents = getPrice(p, variations);
  if (!priceCents) continue; // skip products without any price

  const termIds = productCategoryMap.get(p.id) || [];
  const category = termIds.length > 0 ? categoryMap.get(termIds[0]) : null;
  const images = resolveImages(p);

  const sizes = [];
  for (const v of variations) {
    const size = extractSize(v.title);
    if (size) {
      sizes.push({
        label: size,
        price: v.regular_price ? parseInt(v.regular_price, 10) : priceCents,
        stock: v.stock_status === "instock" ? (v.stock ? parseInt(v.stock, 10) : 1) : 0,
      });
    }
  }

  catalogProducts.push({
    id: p.id,
    slug: p.slug,
    name: p.title,
    priceCents: priceCents * 100,
    salePrice: p.sale_price ? parseInt(p.sale_price, 10) * 100 : null,
    sku: p.sku || null,
    inStock: p.stock_status === "instock",
    categorySlug: category?.slug || "uncategorized",
    categoryName: category?.name || "Altro",
    images,
    sizes,
    createdAt: p.date,
  });
}

// Sort by date descending (newest first)
catalogProducts.sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

// ── Generate TypeScript ────────────────────────────────────────

const ts = `// Auto-generated from WooCommerce export — do not edit manually.
// Run: node scripts/build-catalog.mjs

export type CatalogCategory = {
  slug: string;
  name: string;
  count: number;
  description: string;
};

export type ProductImage = {
  url: string;
  alt: string;
  isThumbnail: boolean;
};

export type ProductSize = {
  label: string;
  price: number;
  stock: number;
};

export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  /** Price in euro-cents */
  priceCents: number;
  salePrice: number | null;
  sku: string | null;
  inStock: boolean;
  categorySlug: string;
  categoryName: string;
  images: ProductImage[];
  sizes: ProductSize[];
  createdAt: string;
};

export const categories: CatalogCategory[] = ${JSON.stringify(
  activeCategories.map((c) => ({
    slug: c.slug,
    name: c.name,
    count: c.count,
    description: categoryDescriptions[c.name] || "",
  })),
  null,
  2
)};

export const products: CatalogProduct[] = ${JSON.stringify(catalogProducts, null, 2)};

export function getProductBySlug(slug: string): CatalogProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): CatalogProduct[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(count = 6): CatalogProduct[] {
  return products.filter((p) => p.inStock).slice(0, count);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
`;

const outPath = resolve(__dirname, "../src/lib/catalog.ts");
writeFileSync(outPath, ts, "utf-8");

console.log(`✓ Generated ${outPath}`);
console.log(`  Categories: ${activeCategories.length}`);
console.log(`  Products:   ${catalogProducts.length}`);
console.log(
  `  With images: ${catalogProducts.filter((p) => p.images.length > 0).length}`
);
console.log(
  `  With sizes:  ${catalogProducts.filter((p) => p.sizes.length > 0).length}`
);
