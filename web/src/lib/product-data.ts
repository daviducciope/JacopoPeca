import "server-only";

import { z } from "zod";
import type { Prisma, ProductStatus } from "@prisma/client";

import { categories as fallbackCategories, formatPrice, products as fallbackProducts } from "@/lib/catalog";
import { isDatabaseConfigured, prisma, requirePrisma } from "@/lib/prisma";

export type AppProductImage = {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isThumbnail: boolean;
};

export type AppProductSize = {
  id: string;
  label: string;
  sku: string;
  color: string | null;
  stock: number;
  price: number;
};

export type AppProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  salePrice: number | null;
  sku: string | null;
  inStock: boolean;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  images: AppProductImage[];
  sizes: AppProductSize[];
  createdAt: string;
  status: ProductStatus | "ACTIVE";
  featured: boolean;
  limitedEdition: boolean;
  badge: string | null;
  materialNotes: string | null;
  careNotes: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type AppCategory = {
  id: string;
  slug: string;
  name: string;
  count: number;
  description: string;
};

export type AdminProductsPageData = {
  products: AppProduct[];
  categories: AppCategory[];
  databaseEnabled: boolean;
  usingFallbackData: boolean;
};

export type AdminDashboardData = {
  revenue: string;
  products: number;
  inStock: number;
  categories: number;
  topProducts: string[];
  lowStock: Array<{ name: string; category: string }>;
  byCat: Array<{ name: string; count: number }>;
  databaseEnabled: boolean;
  usingFallbackData: boolean;
};

const productWithRelations = {
  include: {
    category: true,
    images: {
      orderBy: {
        sortOrder: "asc",
      },
    },
    variants: {
      orderBy: {
        size: "asc",
      },
    },
  },
} satisfies Prisma.ProductDefaultArgs;

type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>;

const adminImageSchema = z.object({
  url: z.string().trim().min(1, "Inserisci l'URL immagine."),
  alt: z.string().trim().max(200).optional().default(""),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

const adminVariantSchema = z.object({
  sku: z.string().trim().min(1, "Lo SKU variante e obbligatorio.").max(80),
  size: z.string().trim().min(1, "La taglia e obbligatoria.").max(40),
  color: z.string().trim().max(80).optional().default(""),
  stock: z.number().int().min(0, "Lo stock non puo essere negativo."),
});

export const adminProductSchema = z.object({
  name: z.string().trim().min(2, "Il nome deve avere almeno 2 caratteri."),
  slug: z
    .string()
    .trim()
    .min(2, "Lo slug deve avere almeno 2 caratteri.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo lettere minuscole, numeri e trattini."),
  description: z.string().trim().min(10, "Aggiungi una descrizione piu completa."),
  categoryId: z.string().trim().min(1, "Seleziona una categoria."),
  priceCents: z.number().int().min(50, "Il prezzo minimo e 0,50 EUR."),
  compareAtCents: z.number().int().min(50).nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean().default(false),
  limitedEdition: z.boolean().default(false),
  badge: z.string().trim().max(80).optional().default(""),
  materialNotes: z.string().trim().max(1200).optional().default(""),
  careNotes: z.string().trim().max(1200).optional().default(""),
  seoTitle: z.string().trim().max(70).optional().default(""),
  seoDescription: z.string().trim().max(170).optional().default(""),
  images: z.array(adminImageSchema).min(1, "Inserisci almeno un'immagine."),
  variants: z.array(adminVariantSchema).min(1, "Inserisci almeno una variante."),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;

function toFallbackProduct(product: (typeof fallbackProducts)[number]): AppProduct {
  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    description: `${product.name} - ${product.categoryName} handmade Jacopo Peca.`,
    priceCents: product.priceCents,
    salePrice: product.salePrice,
    sku: product.sku,
    inStock: product.inStock,
    categoryId: product.categorySlug,
    categorySlug: product.categorySlug,
    categoryName: product.categoryName,
    images: product.images.map((image, index) => ({
      id: `${product.id}-image-${index}`,
      url: image.url,
      alt: image.alt,
      width: null,
      height: null,
      sortOrder: index,
      isThumbnail: image.isThumbnail,
    })),
    sizes: product.sizes.map((size, index) => ({
      id: `${product.id}-size-${index}`,
      label: size.label,
      sku: product.sku || `${product.slug}-${slugifyValue(size.label)}`,
      color: null,
      stock: size.stock,
      price: size.price,
    })),
    createdAt: new Date(product.createdAt).toISOString(),
    status: "ACTIVE",
    featured: false,
    limitedEdition: product.sizes.reduce((sum, size) => sum + size.stock, 0) <= 2,
    badge: null,
    materialNotes: null,
    careNotes: null,
    seoTitle: null,
    seoDescription: null,
  };
}

function toFallbackCategory(category: (typeof fallbackCategories)[number]): AppCategory {
  return {
    id: category.slug,
    slug: category.slug,
    name: category.name,
    count: category.count,
    description: category.description,
  };
}

function toAppProduct(product: ProductWithRelations): AppProduct {
  const sizes = product.variants.map((variant) => ({
    id: variant.id,
    label: variant.size,
    sku: variant.sku,
    color: variant.color,
    stock: variant.stock,
    price: product.priceCents / 100,
  }));
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    salePrice: product.compareAtCents,
    sku: product.variants[0]?.sku ?? null,
    inStock: product.status === "ACTIVE" && totalStock > 0,
    categoryId: product.categoryId,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    images: product.images.map((image, index) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      width: image.width,
      height: image.height,
      sortOrder: image.sortOrder,
      isThumbnail: index === 0,
    })),
    sizes,
    createdAt: product.createdAt.toISOString(),
    status: product.status,
    featured: product.featured,
    limitedEdition: product.limitedEdition,
    badge: product.badge,
    materialNotes: product.materialNotes,
    careNotes: product.careNotes,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
  };
}

function buildCategories(products: AppProduct[]): AppCategory[] {
  const counts = new Map<string, AppCategory>();

  for (const product of products) {
    const entry = counts.get(product.categorySlug);
    if (entry) {
      entry.count += 1;
      continue;
    }

    counts.set(product.categorySlug, {
      id: product.categoryId,
      slug: product.categorySlug,
      name: product.categoryName,
      count: 1,
      description: `${product.categoryName} Jacopo Peca`,
    });
  }

  return [...counts.values()].sort((left, right) => left.name.localeCompare(right.name));
}

async function loadProductsFromDatabase(includeArchived = false) {
  if (!prisma) {
    return null;
  }

  try {
    const records = await prisma.product.findMany({
      ...productWithRelations,
      where: includeArchived ? undefined : { status: "ACTIVE" },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return records.map(toAppProduct);
  } catch (error) {
    console.error("Database products unavailable, using fallback catalog.", error);
    return null;
  }
}

async function loadCategoriesFromDatabase(includeArchived = false) {
  if (!prisma) {
    return null;
  }

  try {
    const records = await prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true,
          },
          where: includeArchived ? undefined : { status: "ACTIVE" },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return records.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      count: category.products.length,
      description: category.description ?? `${category.name} Jacopo Peca`,
    }));
  } catch (error) {
    console.error("Database categories unavailable, using fallback categories.", error);
    return null;
  }
}

export async function getStorefrontProducts(categorySlug?: string): Promise<AppProduct[]> {
  const databaseProducts = await loadProductsFromDatabase(false);
  const products = databaseProducts ?? fallbackProducts.map(toFallbackProduct);

  if (!categorySlug) {
    return products;
  }

  return products.filter((product) => product.categorySlug === categorySlug);
}

export async function getStorefrontCategories(): Promise<AppCategory[]> {
  const databaseCategories = await loadCategoriesFromDatabase(false);
  if (databaseCategories) {
    return databaseCategories;
  }

  return fallbackCategories.map(toFallbackCategory);
}

export async function getFeaturedStorefrontProducts(limit = 8): Promise<AppProduct[]> {
  const products = await getStorefrontProducts();
  const featured = products.filter((product) => product.featured);

  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }

  const seen = new Set(featured.map((product) => product.id));
  const fallback = products.filter((product) => !seen.has(product.id));
  return [...featured, ...fallback].slice(0, limit);
}

export async function getStorefrontProductBySlug(slug: string): Promise<AppProduct | null> {
  const databaseProducts = await loadProductsFromDatabase(false);
  if (databaseProducts) {
    return databaseProducts.find((product) => product.slug === slug) ?? null;
  }

  return fallbackProducts.map(toFallbackProduct).find((product) => product.slug === slug) ?? null;
}

export async function getRelatedStorefrontProducts(
  categorySlug: string,
  currentProductId: string,
  limit = 4,
): Promise<AppProduct[]> {
  const products = await getStorefrontProducts(categorySlug);
  return products.filter((product) => product.id !== currentProductId).slice(0, limit);
}

export async function getAdminProductsPageData(): Promise<AdminProductsPageData> {
  const databaseProducts = await loadProductsFromDatabase(true);
  const databaseCategories = await loadCategoriesFromDatabase(true);

  if (databaseProducts && databaseCategories) {
    return {
      products: databaseProducts,
      categories: databaseCategories,
      databaseEnabled: isDatabaseConfigured,
      usingFallbackData: false,
    };
  }

  const fallback = fallbackProducts.map(toFallbackProduct);
  return {
    products: fallback,
    categories: buildCategories(fallback),
    databaseEnabled: isDatabaseConfigured,
    usingFallbackData: true,
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const { products, categories, databaseEnabled, usingFallbackData } = await getAdminProductsPageData();
  const inStock = products.filter((product) => product.inStock);
  const outOfStock = products.filter((product) => !product.inStock);
  const totalRevenuePotential = inStock.reduce((sum, product) => sum + product.priceCents, 0);

  return {
    revenue: formatPrice(totalRevenuePotential),
    products: products.length,
    inStock: inStock.length,
    categories: categories.length,
    topProducts: inStock.slice(0, 3).map((product) => product.name),
    lowStock: outOfStock.slice(0, 3).map((product) => ({
      name: product.name,
      category: product.categoryName,
    })),
    byCat: categories.map((category) => ({
      name: category.name,
      count: category.count,
    })),
    databaseEnabled,
    usingFallbackData,
  };
}

export async function getCheckoutProductsBySlugs(slugs: string[]): Promise<Map<string, AppProduct>> {
  const products = await loadProductsFromDatabase(false);
  const lookup = new Map<string, AppProduct>();

  if (!products) {
    return lookup;
  }

  for (const product of products) {
    if (slugs.includes(product.slug)) {
      lookup.set(product.slug, product);
    }
  }

  return lookup;
}

function slugifyValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function normalizeOptionalText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

async function mapSavedProduct(productId: string) {
  const db = requirePrisma();
  const record = await db.product.findUnique({
    ...productWithRelations,
    where: {
      id: productId,
    },
  });

  if (!record) {
    throw new Error("Prodotto non trovato dopo il salvataggio.");
  }

  return toAppProduct(record);
}

function buildImages(input: AdminProductInput) {
  return input.images.map((image, index) => ({
    url: image.url,
    alt: image.alt || input.name,
    width: image.width ?? null,
    height: image.height ?? null,
    sortOrder: image.sortOrder ?? index,
  }));
}

function buildVariants(input: AdminProductInput) {
  return input.variants.map((variant) => ({
    sku: variant.sku || `${input.slug}-${slugifyValue(variant.size)}`,
    size: variant.size,
    color: normalizeOptionalText(variant.color),
    stock: variant.stock,
  }));
}

function buildProductData(input: AdminProductInput) {
  return {
    slug: input.slug,
    name: input.name,
    description: input.description,
    priceCents: input.priceCents,
    compareAtCents: input.compareAtCents ?? null,
    status: input.status,
    featured: input.featured,
    limitedEdition: input.limitedEdition,
    badge: normalizeOptionalText(input.badge),
    materialNotes: normalizeOptionalText(input.materialNotes),
    careNotes: normalizeOptionalText(input.careNotes),
    seoTitle: normalizeOptionalText(input.seoTitle),
    seoDescription: normalizeOptionalText(input.seoDescription),
    categoryId: input.categoryId,
  };
}

export async function createAdminProduct(input: AdminProductInput) {
  const db = requirePrisma();

  const product = await db.product.create({
    data: {
      ...buildProductData(input),
      images: {
        create: buildImages(input),
      },
      variants: {
        create: buildVariants(input),
      },
    },
  });

  return mapSavedProduct(product.id);
}

export async function updateAdminProduct(productId: string, input: AdminProductInput) {
  const db = requirePrisma();

  await db.product.update({
    where: {
      id: productId,
    },
    data: {
      ...buildProductData(input),
      images: {
        deleteMany: {},
        create: buildImages(input),
      },
      variants: {
        deleteMany: {},
        create: buildVariants(input),
      },
    },
  });

  return mapSavedProduct(productId);
}

export async function archiveAdminProduct(productId: string) {
  const db = requirePrisma();

  await db.product.update({
    where: {
      id: productId,
    },
    data: {
      status: "ARCHIVED",
      featured: false,
    },
  });

  return mapSavedProduct(productId);
}
