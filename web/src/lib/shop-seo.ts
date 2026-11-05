import type { AppProduct } from "@/lib/product-data";
import { absoluteUrl, productAvailability } from "@/lib/seo";

/** schema.org ItemList of products, shared by the shop and category pages. */
export function productListJsonLd(products: AppProduct[], limit = 36) {
  return {
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: products.slice(0, limit).map((product, index) => {
      const thumb = product.images.find((img) => img.isThumbnail) || product.images[0];
      const url = absoluteUrl(`/product/${product.slug}`);
      return {
        "@type": "ListItem",
        position: index + 1,
        url,
        item: {
          "@type": "Product",
          name: product.name,
          url,
          category: product.categoryName,
          image: thumb ? absoluteUrl(thumb.url) : undefined,
          brand: { "@type": "Brand", name: "Jacopo Peca" },
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: (product.priceCents / 100).toFixed(2),
            availability: productAvailability(product),
            url,
          },
        },
      };
    }),
  };
}
