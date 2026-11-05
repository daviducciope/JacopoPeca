import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopCatalog } from "@/components/ShopCatalog";
import { categoryHref, categoryPathSegment, categorySlugFromPath, getCategorySeo } from "@/lib/category-seo";
import { getStorefrontCategories, getStorefrontProducts } from "@/lib/product-data";
import { ensureDynamicRendering } from "@/lib/render-mode";
import { absoluteUrl, breadcrumbJsonLd, defaultOgImage } from "@/lib/seo";
import { productListJsonLd } from "@/lib/shop-seo";

type Params = Promise<{ categoria: string }>;

export async function generateStaticParams() {
  const categories = await getStorefrontCategories();
  return categories.map((category) => ({ categoria: categoryPathSegment(category.slug) }));
}

async function resolveCategory(segment: string) {
  const slug = categorySlugFromPath(decodeURIComponent(segment));
  const categories = await getStorefrontCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return null;
  return { category, categories, seo: getCategorySeo(slug) };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categoria } = await params;
  const resolved = await resolveCategory(categoria);
  if (!resolved) return { title: "Categoria non trovata", robots: { index: false, follow: true } };

  const { category, seo } = resolved;
  const title = seo?.title ?? `${category.name} fatti a mano – Streetwear artigianale`;
  const description =
    seo?.description ??
    `${category.name} streetwear fatti a mano nel laboratorio Jacopo Peca di Montesilvano (PE). ${category.description ?? ""} Pezzi unici made in Italy.`.trim();
  const path = categoryHref(category.slug);

  return {
    title,
    description,
    keywords: seo?.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: `${title} | Jacopo Peca`,
      description,
      images: [{ url: absoluteUrl(defaultOgImage), alt: seo?.h1 ?? category.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Jacopo Peca`,
      description,
      images: [absoluteUrl(defaultOgImage)],
    },
  };
}

export default async function ShopCategoryPage({ params }: { params: Params }) {
  await ensureDynamicRendering();

  const { categoria } = await params;
  const resolved = await resolveCategory(categoria);
  if (!resolved) notFound();

  const { category, categories, seo } = resolved;
  const products = await getStorefrontProducts();
  const categoryProducts = products.filter((product) => product.categorySlug === category.slug);
  const inStockCount = products.filter((product) => product.inStock).length;
  const path = categoryHref(category.slug);
  const name = seo?.h1 ?? category.name;

  const faqNode =
    seo && seo.faqs.length > 0
      ? {
          "@type": "FAQPage",
          "@id": absoluteUrl(`${path}#faq`),
          mainEntity: seo.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl(`${path}#collection`),
        url: absoluteUrl(path),
        name,
        description: seo?.description ?? category.description,
        keywords: seo?.keywords.join(", "),
        inLanguage: "it-IT",
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": absoluteUrl("/#atelier") },
        numberOfItems: categoryProducts.length,
        mainEntity: productListJsonLd(categoryProducts),
      },
      ...(faqNode ? [faqNode] : []),
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: category.name, path },
      ]),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ShopCatalog
        categories={categories}
        products={products}
        totalInStock={inStockCount}
        initialCategory={category.slug}
      />
    </>
  );
}
