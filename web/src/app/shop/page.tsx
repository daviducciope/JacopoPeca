import type { Metadata } from "next";

import { getStorefrontCategories, getStorefrontProducts } from "@/lib/product-data";
import { ensureDynamicRendering } from "@/lib/render-mode";
import { absoluteUrl, breadcrumbJsonLd, defaultOgImage } from "@/lib/seo";
import { productListJsonLd } from "@/lib/shop-seo";
import { ShopCatalog } from "@/components/ShopCatalog";

const shopTitle = "Shop Jeans e Giacche Personalizzate Fatte a Mano";
const shopDescription =
  "Shop ufficiale Jacopo Peca: jeans personalizzati, giacche di jeans dipinte a mano, felpe e t-shirt streetwear fatte a mano a Montesilvano (PE). Pezzi unici made in Italy.";

export const metadata: Metadata = {
  title: shopTitle,
  description: shopDescription,
  keywords: [
    "shop streetwear artigianale",
    "jeans personalizzati",
    "giacche di jeans dipinte a mano",
    "felpe personalizzate",
    "abbigliamento fatto a mano made in Italy",
    "tattoo clothing",
    "pezzi unici streetwear",
  ],
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: `${shopTitle} | Jacopo Peca`,
    description: shopDescription,
    url: "/shop",
    type: "website",
    images: [
      {
        url: absoluteUrl(defaultOgImage),
        alt: "Jacopo Peca — laboratorio di denim streetwear fatto a mano",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${shopTitle} | Jacopo Peca`,
    description: shopDescription,
    images: [absoluteUrl(defaultOgImage)],
  },
};

export default async function ShopPage() {
  await ensureDynamicRendering();

  const [categories, products] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontProducts(),
  ]);

  const inStockCount = products.filter((p) => p.inStock).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl("/shop#collection"),
        url: absoluteUrl("/shop"),
        name: shopTitle,
        description: shopDescription,
        inLanguage: "it-IT",
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": absoluteUrl("/#atelier") },
        numberOfItems: products.length,
        mainEntity: productListJsonLd(products),
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShopCatalog
        categories={categories}
        products={products}
        totalInStock={inStockCount}
      />
    </>
  );
}
