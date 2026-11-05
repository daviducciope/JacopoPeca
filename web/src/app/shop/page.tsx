import type { Metadata } from "next";

import { getStorefrontCategories, getStorefrontProducts } from "@/lib/product-data";
import { ensureDynamicRendering } from "@/lib/render-mode";
import { absoluteUrl, productAvailability } from "@/lib/seo";
import { ShopCatalog } from "@/components/ShopCatalog";

export const metadata: Metadata = {
  title: "Store Ufficiale — Denim Streetwear Artigianale & Pezzi Unici",
  description:
    "Esplora lo Store ufficiale di Jacopo Peca: jeans custom, giacche denim dipinte a mano, felpe, t-shirt e pezzi unici 100% fatti a mano in Italia nel laboratorio di Montesilvano.",
  keywords: [
    "Jacopo Peca shop",
    "denim streetwear artigianale",
    "jeans custom fatti a mano",
    "giacche denim dipinte a mano",
    "streetwear made in Italy",
    "tattoo clothing",
    "pezzi unici streetwear",
  ],
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Store Ufficiale Jacopo Peca — Handcrafted Denim Streetwear",
    description:
      "Capi streetwear e denim lavorati, cuciti e dipinti a mano in laboratorio. Pezzi unici e serie limitate con spedizione rapida in Italia ed Europa.",
    url: "/shop",
    type: "website",
    images: [
      {
        url: absoluteUrl("/images/atelier/atelier-embroidery.jpg"),
        alt: "Jacopo Peca — Laboratorio Denim Streetwear Fatto a Mano",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Store Ufficiale Jacopo Peca — Handcrafted Denim Streetwear",
    description:
      "Jeans, giacche denim, felpe e t-shirt lavorate e dipinte a mano in Italia. Scopri i pezzi unici disponibili.",
    images: [absoluteUrl("/images/atelier/atelier-embroidery.jpg")],
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
        name: "Store Ufficiale Jacopo Peca — Handcrafted Denim Streetwear",
        description:
          "Catalogo ufficiale di capi streetwear e denim artigianali fatti a mano in Italia da Jacopo Peca.",
        isPartOf: {
          "@type": "WebSite",
          name: "Jacopo Peca",
          url: absoluteUrl("/"),
        },
        numberOfItems: products.length,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListOrder: "https://schema.org/ItemListUnordered",
          itemListElement: products.slice(0, 36).map((product, index) => {
            const thumb =
              product.images.find((img) => img.isThumbnail) || product.images[0];
            return {
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/product/${product.slug}`),
              item: {
                "@type": "Product",
                name: product.name,
                url: absoluteUrl(`/product/${product.slug}`),
                category: product.categoryName,
                image: thumb ? absoluteUrl(thumb.url) : undefined,
                brand: {
                  "@type": "Brand",
                  name: "Jacopo Peca",
                },
                offers: {
                  "@type": "Offer",
                  priceCurrency: "EUR",
                  price: (product.priceCents / 100).toFixed(2),
                  availability: productAvailability(product),
                  url: absoluteUrl(`/product/${product.slug}`),
                },
              },
            };
          }),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Store",
            item: absoluteUrl("/shop"),
          },
        ],
      },
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
