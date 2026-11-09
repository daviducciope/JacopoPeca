import "server-only";

import { cache } from "react";
import { z } from "zod";
import type { Prisma, ProductStatus } from "@prisma/client";

import { categories as fallbackCategories, formatPrice, products as fallbackProducts } from "@/lib/catalog";
import { selectDiverseStorefrontProducts } from "@/lib/featured-selection";
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
  // catalog
  products: number;
  inStock: number;
  outOfStock: number;
  draftCount: number;
  archivedCount: number;
  categories: number;
  byCat: Array<{ name: string; slug: string; id: string; count: number }>;
  lowStock: Array<{ id: string; slug: string; name: string; category: string; stock: number; thumb: string | null }>;
  soldOutSizes: Array<{ id: string; productId: string; name: string; size: string; category: string }>;
  unfulfilledOrders: Array<{ id: string; orderNumber: string; totalFormatted: string; createdAt: string }>;
  unfulfilledCount: number;
  recentProducts: Array<{
    id: string;
    slug: string;
    name: string;
    category: string;
    priceFormatted: string;
    status: string;
    inStock: boolean;
    stock: number;
    thumb: string | null;
  }>;
  // orders (real — populated only when DB is available)
  revenueFormatted: string;
  ordersTotal: number;
  ordersLast30: number;
  aovFormatted: string;
  topProducts: Array<{ name: string; qty: number }>;
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
  url: z.string().trim().min(1, "Inserisci o carica almeno un'immagine."),
  alt: z.string().trim().max(200).optional().default(""),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

const adminVariantSchema = z.object({
  sku: z.string().trim().max(80).optional().default(""),
  size: z.string().trim().min(1, "La taglia è obbligatoria.").max(40),
  color: z.string().trim().max(80).optional().default(""),
  stock: z.number().int().min(0, "Lo stock non può essere negativo."),
});

export const adminProductSchema = z.object({
  name: z.string().trim().min(2, "Inserisci il nome del prodotto (min. 2 caratteri)."),
  slug: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
  categoryId: z.string().trim().min(1, "Seleziona una categoria."),
  priceCents: z.number().int().min(50, "Il prezzo minimo è 0,50 €."),
  compareAtCents: z.number().int().min(50).nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  featured: z.boolean().default(false),
  limitedEdition: z.boolean().default(false),
  badge: z.string().trim().max(80).optional().default(""),
  materialNotes: z.string().trim().max(1200).optional().default(""),
  careNotes: z.string().trim().max(1200).optional().default(""),
  seoTitle: z.string().trim().max(120).optional().default(""),
  seoDescription: z.string().trim().max(250).optional().default(""),
  images: z.array(adminImageSchema).min(1, "Carica almeno una foto del prodotto."),
  variants: z.array(adminVariantSchema).min(1, "Inserisci almeno una taglia."),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;

// These WooCommerce attachments were never recovered locally or on S3.
// Keep them out of the storefront so galleries don't request broken photos.
const UNAVAILABLE_PRODUCT_IMAGE =
  /(?:1000635909(?:-\d+)?|1000635910(?:-\d+)?|krocodil-retro-jeans-scaled|Che-doppio-w34-2-scaled)\.[a-z0-9]+$/i;

function availableImages<T extends { url: string }>(images: T[]): T[] {
  return images.filter((image) => image.url.trim() && !UNAVAILABLE_PRODUCT_IMAGE.test(image.url));
}

function toFallbackProduct(product: (typeof fallbackProducts)[number]): AppProduct {
  const images = availableImages(product.images);
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
    images: images.map((image, index) => ({
      id: `${product.id}-image-${index}`,
      url: image.url,
      alt: image.alt,
      width: null,
      height: null,
      sortOrder: index,
      isThumbnail: image.isThumbnail || index === 0,
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
    images: availableImages(product.images).map((image, index) => ({
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

// Share catalogue reads within a render, keeping stock fresh on every request.
const loadProductsFromDatabase = cache(async (includeArchived = false) => {
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
});

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
  const products = (await getStorefrontProducts()).filter((product) =>
    product.images.some((image) => image.url.trim().length > 0),
  );
  return selectDiverseStorefrontProducts(products, limit);
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
  const activeProducts = products.filter((p) => p.status === "ACTIVE");
  const inStock = activeProducts.filter((product) => product.inStock);
  const outOfStock = activeProducts.filter((product) => !product.inStock);
  const draftCount = products.filter((p) => p.status === "DRAFT").length;
  const archivedCount = products.filter((p) => p.status === "ARCHIVED").length;

  let revenueFormatted = "€0,00";
  let ordersTotal = 0;
  let ordersLast30 = 0;
  let aovFormatted = "—";
  let unfulfilledCount = 0;
  let unfulfilledOrders: AdminDashboardData["unfulfilledOrders"] = [];
  let topProducts: Array<{ name: string; qty: number }> = inStock
    .slice(0, 5)
    .map((p) => ({ name: p.name, qty: 0 }));

  if (prisma && !usingFallbackData) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [orderStats, recentCount, topItems, openCount, openOrders] = await Promise.all([
        prisma.order.aggregate({
          where: { status: { in: ["PAID", "FULFILLED"] } },
          _sum: { totalCents: true },
          _count: { _all: true },
          _avg: { totalCents: true },
        }),
        prisma.order.count({
          where: { status: { in: ["PAID", "FULFILLED"] }, createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.orderItem.groupBy({
          by: ["productName"],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 5,
        }),
        prisma.order.count({ where: { status: "PAID" } }),
        prisma.order.findMany({
          where: { status: "PAID" },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { id: true, orderNumber: true, totalCents: true, createdAt: true },
        }),
      ]);

      const totalRevenueCents = orderStats._sum.totalCents ?? 0;
      const count = orderStats._count._all;
      const avgCents = orderStats._avg.totalCents ?? 0;

      revenueFormatted = formatPrice(totalRevenueCents);
      ordersTotal = count;
      ordersLast30 = recentCount;
      aovFormatted = count > 0 ? formatPrice(Math.round(avgCents)) : "—";
      unfulfilledCount = openCount;
      unfulfilledOrders = openOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalFormatted: formatPrice(order.totalCents),
        createdAt: order.createdAt.toISOString(),
      }));
      if (topItems.length > 0) {
        topProducts = topItems.map((item) => ({
          name: item.productName,
          qty: item._sum.quantity ?? 0,
        }));
      }
    } catch (error) {
      console.error("Unable to load order stats for dashboard.", error);
    }
  }

  const sortedByRecent = [...products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    products: products.length,
    inStock: inStock.length,
    outOfStock: outOfStock.length,
    draftCount,
    archivedCount,
    categories: categories.length,
    byCat: categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      id: category.id,
      count: category.count,
    })),
    soldOutSizes: activeProducts.flatMap((product) =>
      product.sizes
        .filter((size) => size.stock <= 0)
        .map((size) => ({
          id: size.id,
          productId: product.id,
          name: product.name,
          size: size.label,
          category: product.categoryName,
        })),
    ).slice(0, 12),
    unfulfilledOrders,
    unfulfilledCount,
    lowStock: outOfStock.slice(0, 8).map((product) => {
      const thumb = product.images.find((img) => img.isThumbnail)?.url ?? product.images[0]?.url ?? null;
      const stock = product.sizes.reduce((s, v) => s + v.stock, 0);
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.categoryName,
        stock,
        thumb,
      };
    }),
    recentProducts: sortedByRecent.slice(0, 6).map((product) => {
      const thumb = product.images.find((img) => img.isThumbnail)?.url ?? product.images[0]?.url ?? null;
      const stock = product.sizes.reduce((s, v) => s + v.stock, 0);
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.categoryName,
        priceFormatted: formatPrice(product.priceCents),
        status: product.status,
        inStock: product.inStock,
        stock,
        thumb,
      };
    }),
    revenueFormatted,
    ordersTotal,
    ordersLast30,
    aovFormatted,
    topProducts,
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

async function ensureUniqueProductSlug(
  desiredSlug: string,
  productName: string,
  excludeProductId?: string,
): Promise<string> {
  const db = requirePrisma();
  const baseSlug = slugifyValue(desiredSlug || productName) || `prodotto-${Date.now().toString(36)}`;
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await db.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeProductId) {
      return candidate;
    }
    candidate = `${baseSlug.slice(0, 52)}-${counter}`;
    counter += 1;
  }
}

async function buildUniqueVariants(
  input: AdminProductInput,
  resolvedSlug: string,
  excludeProductId?: string,
) {
  const db = requirePrisma();
  const seen = new Set<string>();
  const results: Array<{
    sku: string;
    size: string;
    color: string | null;
    stock: number;
  }> = [];

  for (let index = 0; index < input.variants.length; index += 1) {
    const variant = input.variants[index];
    const sizeSlug = slugifyValue(variant.size || "uni") || "uni";
    const rawSku = variant.sku?.trim() || "";
    const isGenericDefault =
      !rawSku ||
      rawSku === "prodotto-uni" ||
      rawSku.startsWith("prodotto-") ||
      rawSku === "uni";

    const baseSku = isGenericDefault
      ? `${resolvedSlug}-${sizeSlug}`
      : slugifyValue(rawSku) || `${resolvedSlug}-${sizeSlug}`;

    let candidate = seen.has(baseSku) ? `${baseSku}-${index + 1}` : baseSku;
    let suffix = 2;

    while (true) {
      if (!seen.has(candidate)) {
        const existingVariant = await db.productVariant.findUnique({
          where: { sku: candidate },
          select: { productId: true },
        });
        if (!existingVariant || existingVariant.productId === excludeProductId) {
          break;
        }
      }
      candidate = `${baseSku.slice(0, 65)}-${suffix}`;
      suffix += 1;
    }

    seen.add(candidate);
    results.push({
      sku: candidate,
      size: variant.size.trim() || "UNI",
      color: normalizeOptionalText(variant.color),
      stock: Math.max(0, Math.floor(variant.stock)),
    });
  }

  return results;
}

function buildProductData(input: AdminProductInput, resolvedSlug: string) {
  const trimmedDesc = input.description?.trim() || "";
  const description =
    trimmedDesc.length >= 3
      ? trimmedDesc
      : `${input.name.trim()} — Capo artigianale Jacopo Peca lavorato a mano in Italia.`;

  return {
    slug: resolvedSlug,
    name: input.name.trim(),
    description,
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
  const resolvedSlug = await ensureUniqueProductSlug(input.slug, input.name);
  const variants = await buildUniqueVariants(input, resolvedSlug);

  const product = await db.product.create({
    data: {
      ...buildProductData(input, resolvedSlug),
      images: {
        create: buildImages(input),
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
  const resolvedSlug = await ensureUniqueProductSlug(input.slug, input.name, productId);
  const variants = await buildUniqueVariants(input, resolvedSlug, productId);

  // Unlink orderItems variantId before recreating variants so foreign keys never block updates
  await db.orderItem.updateMany({
    where: { productId },
    data: { variantId: null },
  });

  await db.product.update({
    where: {
      id: productId,
    },
    data: {
      ...buildProductData(input, resolvedSlug),
      images: {
        deleteMany: {},
        create: buildImages(input),
      },
      variants: {
        deleteMany: {},
        create: variants,
      },
    },
  });

  return mapSavedProduct(productId);
}

export async function updateAdminProductStatus(
  productId: string,
  status: "DRAFT" | "ACTIVE" | "ARCHIVED",
) {
  const db = requirePrisma();

  await db.product.update({
    where: { id: productId },
    data: {
      status,
      ...(status === "ARCHIVED" ? { featured: false } : {}),
    },
  });

  return mapSavedProduct(productId);
}

export async function updateAdminProductQuickFlags(
  productId: string,
  flags: {
    status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
    featured?: boolean;
    pinToTop?: boolean;
  },
) {
  const db = requirePrisma();

  let nextSortOrder: number | undefined;
  if (flags.pinToTop) {
    const minSort = await db.product.aggregate({
      _min: { sortOrder: true },
    });
    nextSortOrder = (minSort._min.sortOrder ?? 0) - 1;
  }

  await db.product.update({
    where: { id: productId },
    data: {
      ...(flags.status ? { status: flags.status } : {}),
      ...(flags.status === "ARCHIVED" ? { featured: false } : {}),
      ...(typeof flags.featured === "boolean" ? { featured: flags.featured } : {}),
      ...(nextSortOrder !== undefined ? { sortOrder: nextSortOrder, featured: true } : {}),
    },
  });

  return mapSavedProduct(productId);
}

export async function archiveAdminProduct(productId: string) {
  return updateAdminProductStatus(productId, "ARCHIVED");
}

export async function deleteAdminProduct(productId: string) {
  const db = requirePrisma();

  await db.$transaction([
    db.orderItem.updateMany({
      where: { productId },
      data: { productId: null, variantId: null },
    }),
    db.product.delete({
      where: { id: productId },
    }),
  ]);

  return { deletedId: productId };
}

export async function createAdminCategory(name: string, description?: string): Promise<AppCategory> {
  const db = requirePrisma();
  const trimmedName = name.trim();

  const existingByName = await db.category.findFirst({
    where: { name: { equals: trimmedName, mode: "insensitive" } },
  });
  if (existingByName) {
    throw new Error(`La categoria "${existingByName.name}" esiste già.`);
  }

  const baseSlug = slugifyValue(trimmedName) || `categoria-${Date.now().toString(36)}`;

  let slug = baseSlug;
  let counter = 2;
  while (await db.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const count = await db.category.count();
  const created = await db.category.create({
    data: {
      name: trimmedName,
      slug,
      description: description?.trim() || `${trimmedName} Jacopo Peca`,
      sortOrder: count,
    },
  });

  return {
    id: created.id,
    slug: created.slug,
    name: created.name,
    count: 0,
    description: created.description ?? `${created.name} Jacopo Peca`,
  };
}

export async function updateAdminCategory(
  categoryId: string,
  input: { name: string; description?: string },
): Promise<AppCategory> {
  const db = requirePrisma();
  const trimmedName = input.name.trim();

  const existing = await db.category.findUnique({
    where: { id: categoryId },
  });
  if (!existing) {
    throw new Error("Categoria non trovata.");
  }

  const duplicateName = await db.category.findFirst({
    where: {
      id: { not: categoryId },
      name: { equals: trimmedName, mode: "insensitive" },
    },
  });
  if (duplicateName) {
    throw new Error(`Esiste già un'altra categoria chiamata "${duplicateName.name}".`);
  }

  const nextDescription =
    input.description !== undefined
      ? input.description.trim() || `${trimmedName} Jacopo Peca`
      : existing.description ?? `${trimmedName} Jacopo Peca`;

  const updated = await db.category.update({
    where: { id: categoryId },
    data: {
      name: trimmedName,
      description: nextDescription,
    },
    include: {
      products: {
        select: { id: true },
      },
    },
  });

  return {
    id: updated.id,
    slug: updated.slug,
    name: updated.name,
    count: updated.products.length,
    description: updated.description ?? `${updated.name} Jacopo Peca`,
  };
}

export async function deleteAdminCategory(
  categoryId: string,
  reassignToCategoryId?: string,
): Promise<{
  deletedId: string;
  movedProducts: number;
  targetCategoryId: string | null;
  targetCategoryName: string | null;
  targetCategorySlug: string | null;
}> {
  const db = requirePrisma();

  const existing = await db.category.findUnique({
    where: { id: categoryId },
    include: {
      products: { select: { id: true } },
    },
  });

  if (!existing) {
    throw new Error("Categoria non trovata.");
  }

  const otherCategories = await db.category.findMany({
    where: { id: { not: categoryId } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  if (otherCategories.length === 0) {
    throw new Error("Impossibile eliminare l'unica categoria rimasta nel catalogo.");
  }

  const productCount = existing.products.length;
  const targetCategory =
    (reassignToCategoryId
      ? otherCategories.find((cat) => cat.id === reassignToCategoryId)
      : undefined) ?? otherCategories[0];

  await db.$transaction(async (tx) => {
    if (productCount > 0 && targetCategory) {
      await tx.product.updateMany({
        where: { categoryId },
        data: { categoryId: targetCategory.id },
      });
    }
    await tx.category.delete({
      where: { id: categoryId },
    });
  });

  return {
    deletedId: categoryId,
    movedProducts: productCount,
    targetCategoryId: productCount > 0 && targetCategory ? targetCategory.id : null,
    targetCategoryName: productCount > 0 && targetCategory ? targetCategory.name : null,
    targetCategorySlug: productCount > 0 && targetCategory ? targetCategory.slug : null,
  };
}

export async function updateAdminProductStock(
  productId: string,
  updates: Array<{ id: string; stock: number }>,
) {
  const db = requirePrisma();

  await db.$transaction(
    updates.map(({ id, stock }) =>
      db.productVariant.update({
        where: { id, productId },
        data: { stock },
      }),
    ),
  );

  return mapSavedProduct(productId);
}
