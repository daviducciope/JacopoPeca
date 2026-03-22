import "server-only";

import { z } from "zod";
import type { Prisma, ProductStatus } from "@prisma/client";

import { categories as fallbackCategories, formatPrice, products as fallbackProducts } from "@/lib/catalog";
import { isDatabaseConfigured, prisma, requirePrisma } from "@/lib/prisma";

export type AppProductImage = {
  url: string;
  alt: string;
  isThumbnail: boolean;
};

export type AppProductSize = {
  label: string;
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
  sku: z.string().trim().max(80).optional().default(""),
  imageUrl: z.string().trim().min(1, "Inserisci almeno un'immagine."),
  imageAlt: z.string().trim().max(200).optional().default(""),
  stock: z.number().int().min(0, "Lo stock non puo essere negativo."),
  sizesText: z.string().trim().optional().default(""),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean().default(false),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;

function toFallbackProduct(product: (typeof fallbackProducts)[number]): AppProduct {
  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    description: `${product.name} — ${product.categoryName} handmade Jacopo Peca.`,
    priceCents: product.priceCents,
    salePrice: product.salePrice,
    sku: product.sku,
    inStock: product.inStock,
    categoryId: product.categorySlug,
    categorySlug: product.categorySlug,
    categoryName: product.categoryName,
    images: product.images,
    sizes: product.sizes.map((size) => ({
      label: size.label,
      stock: size.stock,
      price: size.price,
    })),
    createdAt: new Date(product.createdAt).toISOString(),
    status: "ACTIVE",
    featured: false,
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
    label: variant.size,
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
      url: image.url,
      alt: image.alt,
      isThumbnail: index === 0,
    })),
    sizes,
    createdAt: product.createdAt.toISOString(),
    status: product.status,
    featured: product.featured,
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
      where: includeArchived
        ? undefined
        : {
            status: "ACTIVE",
          },
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
          where: includeArchived
            ? undefined
            : {
                status: "ACTIVE",
              },
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
  const products = await getStorefrontProducts();
  const lookup = new Map<string, AppProduct>();

  for (const product of products) {
    if (slugs.includes(product.slug)) {
      lookup.set(product.slug, product);
    }
  }

  return lookup;
}

function normalizeSizes(sizesText: string) {
  return [...new Set(sizesText
    .split(/[\n,]/)
    .map((size) => size.trim())
    .filter(Boolean))];
}

function slugifyValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildVariantInputs(input: AdminProductInput) {
  const sizes = normalizeSizes(input.sizesText);
  if (sizes.length === 0) {
    return [
      {
        sku: input.sku || `${input.slug}-uni`,
        size: "UNI",
        stock: input.stock,
      },
    ];
  }

  return sizes.map((size) => ({
    sku: `${input.sku || input.slug}-${slugifyValue(size)}`,
    size,
    stock: input.stock,
  }));
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

export async function createAdminProduct(input: AdminProductInput) {
  const db = requirePrisma();
  const variants = buildVariantInputs(input);

  const product = await db.product.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      status: input.status,
      featured: input.featured,
      categoryId: input.categoryId,
      images: {
        create: [
          {
            url: input.imageUrl,
            alt: input.imageAlt || input.name,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: variants,
      },
    },
  });

  return mapSavedProduct(product.id);
}

export async function updateAdminProduct(productId: string, input: AdminProductInput) {
  const db = requirePrisma();
  const variants = buildVariantInputs(input);

  await db.product.update({
    where: {
      id: productId,
    },
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      status: input.status,
      featured: input.featured,
      categoryId: input.categoryId,
      images: {
        deleteMany: {},
        create: [
          {
            url: input.imageUrl,
            alt: input.imageAlt || input.name,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        deleteMany: {},
        create: variants,
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