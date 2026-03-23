import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { categories, products } from "../src/lib/catalog";

const prisma = new PrismaClient();

function slugifyPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function buildDescription(productName: string, categoryName: string, categoryDescription: string) {
  return `${productName} - ${categoryName}. ${categoryDescription} Capo Jacopo Peca lavorato a mano nel laboratorio di Montesilvano.`;
}

async function main() {
  const categoryMap = new Map<string, string>();

  for (let index = 0; index < categories.length; index += 1) {
    const category = categories[index];
    const saved = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: index,
      },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        sortOrder: index,
      },
    });

    categoryMap.set(category.slug, saved.id);
  }

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const categoryId = categoryMap.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Categoria non trovata per ${product.slug}: ${product.categorySlug}`);
    }

    const compareAtCents = product.salePrice && product.salePrice > product.priceCents ? product.salePrice : null;
    const sizes = product.sizes.length > 0 ? product.sizes : [{ label: "UNI", price: product.priceCents / 100, stock: product.inStock ? 1 : 0 }];
    const totalStock = sizes.reduce((sum, size) => sum + size.stock, 0);

    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      update: {
        name: product.name,
        description: buildDescription(
          product.name,
          product.categoryName,
          categories.find((category) => category.slug === product.categorySlug)?.description ?? product.categoryName,
        ),
        priceCents: product.priceCents,
        compareAtCents,
        featured: index < 8,
        limitedEdition: totalStock <= 2,
        status: "ACTIVE",
        sortOrder: index,
        categoryId,
        images: {
          deleteMany: {},
          create: product.images.map((image, imageIndex) => ({
            url: image.url,
            alt: image.alt || product.name,
            sortOrder: imageIndex,
          })),
        },
        variants: {
          deleteMany: {},
          create: sizes.map((size, sizeIndex) => ({
            sku: product.sku || `${product.slug}-${slugifyPart(size.label || `size-${sizeIndex + 1}`)}`,
            size: size.label || "UNI",
            stock: size.stock,
          })),
        },
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: buildDescription(
          product.name,
          product.categoryName,
          categories.find((category) => category.slug === product.categorySlug)?.description ?? product.categoryName,
        ),
        priceCents: product.priceCents,
        compareAtCents,
        featured: index < 8,
        limitedEdition: totalStock <= 2,
        status: "ACTIVE",
        sortOrder: index,
        createdAt: new Date(product.createdAt),
        categoryId,
        images: {
          create: product.images.map((image, imageIndex) => ({
            url: image.url,
            alt: image.alt || product.name,
            sortOrder: imageIndex,
          })),
        },
        variants: {
          create: sizes.map((size, sizeIndex) => ({
            sku: product.sku || `${product.slug}-${slugifyPart(size.label || `size-${sizeIndex + 1}`)}`,
            size: size.label || "UNI",
            stock: size.stock,
          })),
        },
      },
    });
  }

  console.log(`Seed completato: ${categories.length} categorie, ${products.length} prodotti.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });