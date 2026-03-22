// Auto-generated from WooCommerce export — do not edit manually.
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

export const categories: CatalogCategory[] = [
  {
    "slug": "jeans-2",
    "name": "Jeans",
    "count": 18,
    "description": "Denim lavorato a mano, fit costruiti nel laboratorio."
  },
  {
    "slug": "t-shirt",
    "name": "T-Shirt",
    "count": 18,
    "description": "Grafica pulita, cuciture precise, fit deciso."
  },
  {
    "slug": "sweatshirt",
    "name": "Felpa",
    "count": 13,
    "description": "Oversize, lavaggi profondi, dettagli raw."
  },
  {
    "slug": "cap",
    "name": "Cappello",
    "count": 8,
    "description": "Ricamo pulito, costruzione asciutta, look everyday."
  },
  {
    "slug": "jackets",
    "name": "Giacca",
    "count": 3,
    "description": "Pezzi statement, costruzione sartoriale su base denim."
  },
  {
    "slug": "giacca-denim",
    "name": "Giacca Denim",
    "count": 3,
    "description": "Giacche custom, piccole serie, pezzi unici."
  },
  {
    "slug": "camicia-jeans",
    "name": "Camicia Denim",
    "count": 2,
    "description": "Layering leggero per drop stagionali."
  },
  {
    "slug": "denim-shorts",
    "name": "Denim Shorts",
    "count": 2,
    "description": "Shorts in denim per i mesi caldi."
  },
  {
    "slug": "pantaloni",
    "name": "Pantaloni",
    "count": 2,
    "description": "Pantaloni con taglio e lavorazione handmade."
  }
];

export const products: CatalogProduct[] = [
  {
    "id": 5496,
    "slug": "sabbione",
    "name": "SABBIONE",
    "priceCents": 6000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "cap",
    "categoryName": "Cappello",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1425-scaled.jpg",
        "alt": "SABBIONE",
        "isThumbnail": true
      }
    ],
    "sizes": [
      {
        "label": "57cm",
        "price": 60,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-28 18:00:36"
  },
  {
    "id": 5484,
    "slug": "matricola-5",
    "name": "MATRICOLA 5",
    "priceCents": 7000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "cap",
    "categoryName": "Cappello",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1419-scaled.jpg",
        "alt": "MATRICOLA 5",
        "isThumbnail": true
      }
    ],
    "sizes": [
      {
        "label": "57cm",
        "price": 70,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-28 17:46:03"
  },
  {
    "id": 5476,
    "slug": "matricola-4-2",
    "name": "MATRICOLA 4",
    "priceCents": 7000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "cap",
    "categoryName": "Cappello",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1428-scaled.jpg",
        "alt": "MATRICOLA 4",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1429-scaled.jpg",
        "alt": "MATRICOLA 4",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "57cm",
        "price": 70,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-28 17:39:36"
  },
  {
    "id": 5473,
    "slug": "matricola-4",
    "name": "MATRICOLA 3",
    "priceCents": 7000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "cap",
    "categoryName": "Cappello",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1434-scaled.jpg",
        "alt": "MATRICOLA 3",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1433-scaled.jpg",
        "alt": "MATRICOLA 3",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1435-scaled.jpg",
        "alt": "MATRICOLA 3",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "57cm",
        "price": 70,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-28 17:31:35"
  },
  {
    "id": 5467,
    "slug": "matricola-3",
    "name": "MATRICOLA 3",
    "priceCents": 7000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "denim-shorts",
    "categoryName": "Denim Shorts",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1434-scaled.jpg",
        "alt": "MATRICOLA 3",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1435-scaled.jpg",
        "alt": "MATRICOLA 3",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1433-scaled.jpg",
        "alt": "MATRICOLA 3",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "57cm",
        "price": 70,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-28 17:19:03"
  },
  {
    "id": 5461,
    "slug": "matricola-2",
    "name": "MATRICOLA 2",
    "priceCents": 7000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "cap",
    "categoryName": "Cappello",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1431-scaled.jpg",
        "alt": "MATRICOLA 2",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1432-scaled.jpg",
        "alt": "MATRICOLA 2",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1430-scaled.jpg",
        "alt": "MATRICOLA 2",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "57cm",
        "price": 70,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-28 17:11:51"
  },
  {
    "id": 5455,
    "slug": "matricola-1",
    "name": "MATRICOLA 1",
    "priceCents": 7000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "cap",
    "categoryName": "Cappello",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1422-scaled.jpg",
        "alt": "MATRICOLA 1",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1420-scaled.jpg",
        "alt": "MATRICOLA 1",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1423-scaled.jpg",
        "alt": "MATRICOLA 1",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "57cm",
        "price": 70,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-28 16:47:27"
  },
  {
    "id": 5444,
    "slug": "harry",
    "name": "HARRY",
    "priceCents": 11000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1403-scaled.jpg",
        "alt": "HARRY",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1404-scaled.jpg",
        "alt": "HARRY",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1455-scaled.jpg",
        "alt": "HARRY",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1457-scaled.jpg",
        "alt": "HARRY",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1458-scaled.jpg",
        "alt": "HARRY",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "S",
        "price": 110,
        "stock": 1
      },
      {
        "label": "M",
        "price": 110,
        "stock": 1
      },
      {
        "label": "L",
        "price": 110,
        "stock": 1
      },
      {
        "label": "XL",
        "price": 110,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-28 16:29:59"
  },
  {
    "id": 5433,
    "slug": "nerd",
    "name": "NERD",
    "priceCents": 11000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1405-scaled.jpg",
        "alt": "NERD",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1406-scaled.jpg",
        "alt": "NERD",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1463-scaled.jpg",
        "alt": "NERD",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1464-scaled.jpg",
        "alt": "NERD",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1465-scaled.jpg",
        "alt": "NERD",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "S",
        "price": 110,
        "stock": 1
      },
      {
        "label": "M",
        "price": 110,
        "stock": 1
      },
      {
        "label": "L",
        "price": 110,
        "stock": 1
      },
      {
        "label": "XL",
        "price": 110,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-28 15:58:35"
  },
  {
    "id": 5424,
    "slug": "in-guerra",
    "name": "IN GUERRA",
    "priceCents": 17000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "pantaloni",
    "categoryName": "Pantaloni",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1412-scaled.jpg",
        "alt": "IN GUERRA",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1414-scaled.jpg",
        "alt": "IN GUERRA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1415-scaled.jpg",
        "alt": "IN GUERRA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1452-scaled.jpg",
        "alt": "IN GUERRA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1453-scaled.jpg",
        "alt": "IN GUERRA",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "L",
        "price": 170,
        "stock": 0
      },
      {
        "label": "XL",
        "price": 170,
        "stock": 0
      },
      {
        "label": "S",
        "price": 170,
        "stock": 0
      },
      {
        "label": "M",
        "price": 170,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-28 11:02:56"
  },
  {
    "id": 5401,
    "slug": "jack",
    "name": "JACK",
    "priceCents": 17000,
    "salePrice": null,
    "sku": null,
    "inStock": false,
    "categorySlug": "pantaloni",
    "categoryName": "Pantaloni",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1408-scaled.jpg",
        "alt": "JACK",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1408-1-scaled.jpg",
        "alt": "JACK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1409-scaled.jpg",
        "alt": "JACK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1410-scaled.jpg",
        "alt": "JACK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1446-scaled.jpg",
        "alt": "JACK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1450-scaled.jpg",
        "alt": "JACK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1447-scaled.jpg",
        "alt": "JACK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1448-scaled.jpg",
        "alt": "JACK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1449-scaled.jpg",
        "alt": "JACK",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "XL",
        "price": 170,
        "stock": 0
      },
      {
        "label": "M",
        "price": 170,
        "stock": 0
      },
      {
        "label": "L",
        "price": 170,
        "stock": 0
      },
      {
        "label": "XL",
        "price": 170,
        "stock": 0
      }
    ],
    "createdAt": "2024-11-28 10:49:51"
  },
  {
    "id": 5358,
    "slug": "senza-luce-jeans-jp-jacopo-peca",
    "name": "SENZA LUCE",
    "priceCents": 29000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/senza-luce-scaled.jpg",
        "alt": "SENZA LUCE",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/senza-luce-3-scaled.jpg",
        "alt": "SENZA LUCE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/senza-luce-2-scaled.jpg",
        "alt": "SENZA LUCE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/senza-luce-12-scaled.jpg",
        "alt": "SENZA LUCE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/senza-luce-11-scaled.jpg",
        "alt": "SENZA LUCE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/senza-luce-9-scaled.jpg",
        "alt": "SENZA LUCE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/senza-luce-10-scaled.jpg",
        "alt": "SENZA LUCE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/senza-luce-7-scaled.jpg",
        "alt": "SENZA LUCE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/senza-luce-14-scaled.jpg",
        "alt": "SENZA LUCE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/senza-luce-8-scaled.jpg",
        "alt": "SENZA LUCE",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "W30",
        "price": 290,
        "stock": 1
      },
      {
        "label": "W31",
        "price": 290,
        "stock": 1
      },
      {
        "label": "W32",
        "price": 290,
        "stock": 1
      },
      {
        "label": "W34",
        "price": 290,
        "stock": 1
      },
      {
        "label": "W36",
        "price": 290,
        "stock": 1
      },
      {
        "label": "W38",
        "price": 290,
        "stock": 1
      },
      {
        "label": "40",
        "price": 290,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-27 17:51:39"
  },
  {
    "id": 5344,
    "slug": "nuovi-ragazzi-felpa-sweather-jp-jacopo-peca",
    "name": "NUOVI RAGAZZI",
    "priceCents": 25000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/Nuovi-ragazzi-scaled.jpg",
        "alt": "NUOVI RAGAZZI",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/Nuovi-ragazzi-4-scaled.jpg",
        "alt": "NUOVI RAGAZZI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Nuovi-ragazzi-2-scaled.jpg",
        "alt": "NUOVI RAGAZZI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Nuovi-ragazzi-5-scaled.jpg",
        "alt": "NUOVI RAGAZZI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Nuovi-ragazzi-7-scaled.jpg",
        "alt": "NUOVI RAGAZZI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Nuovi-ragazzi-8-scaled.jpg",
        "alt": "NUOVI RAGAZZI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Nuovi-ragazzi-6-scaled.jpg",
        "alt": "NUOVI RAGAZZI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Nuovi-ragazzi-9-scaled.jpg",
        "alt": "NUOVI RAGAZZI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "NUOVI RAGAZZI",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "S",
        "price": 250,
        "stock": 0
      },
      {
        "label": "M",
        "price": 250,
        "stock": 1
      },
      {
        "label": "L",
        "price": 250,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-27 17:34:26"
  },
  {
    "id": 5333,
    "slug": "scimmia-in-testa-felpa-jp-jacopo-peca",
    "name": "SCIMMIA IN TESTA",
    "priceCents": 20000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/scimmia-scaled.jpg",
        "alt": "SCIMMIA IN TESTA",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/scimmia-4-scaled.jpg",
        "alt": "SCIMMIA IN TESTA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/scimmia-3-scaled.jpg",
        "alt": "SCIMMIA IN TESTA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/scimmia-2-scaled.jpg",
        "alt": "SCIMMIA IN TESTA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/scimmia-5-scaled.jpg",
        "alt": "SCIMMIA IN TESTA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "SCIMMIA IN TESTA",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "M",
        "price": 200,
        "stock": 0
      },
      {
        "label": "L",
        "price": 200,
        "stock": 1
      },
      {
        "label": "XL",
        "price": 200,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-27 17:14:24"
  },
  {
    "id": 5328,
    "slug": "senza-zainetto",
    "name": "SENZA ZAINETTO",
    "priceCents": 15000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/Senza-zainetto-scaled.jpg",
        "alt": "SENZA ZAINETTO",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/Senza-zainetto-5-scaled.jpg",
        "alt": "SENZA ZAINETTO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Senza-zainetto-2-scaled.jpg",
        "alt": "SENZA ZAINETTO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Senza-zainetto-3-scaled.jpg",
        "alt": "SENZA ZAINETTO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Senza-zainetto-4-scaled.jpg",
        "alt": "SENZA ZAINETTO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Senza-zainetto-6-scaled.jpg",
        "alt": "SENZA ZAINETTO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/Senza-zainetto-7-scaled.jpg",
        "alt": "SENZA ZAINETTO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "SENZA ZAINETTO",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "S",
        "price": 150,
        "stock": 1
      },
      {
        "label": "M",
        "price": 150,
        "stock": 1
      },
      {
        "label": "L",
        "price": 150,
        "stock": 1
      }
    ],
    "createdAt": "2024-11-27 17:07:24"
  },
  {
    "id": 5303,
    "slug": "anemic-cinema",
    "name": "ANEMIC CINEMA",
    "priceCents": 18000,
    "salePrice": null,
    "sku": null,
    "inStock": false,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/anemic--scaled.jpg",
        "alt": "ANEMIC CINEMA",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/anemic-3-scaled.jpg",
        "alt": "ANEMIC CINEMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/anemic-4-scaled.jpg",
        "alt": "ANEMIC CINEMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/anemic-scaled.jpg",
        "alt": "ANEMIC CINEMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/anemic-2-scaled.jpg",
        "alt": "ANEMIC CINEMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/anemic-6-scaled.jpg",
        "alt": "ANEMIC CINEMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/anemic-5-scaled.jpg",
        "alt": "ANEMIC CINEMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "ANEMIC CINEMA",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "S",
        "price": 180,
        "stock": 0
      },
      {
        "label": "M",
        "price": 180,
        "stock": 0
      },
      {
        "label": "L",
        "price": 180,
        "stock": 0
      },
      {
        "label": "XL",
        "price": 180,
        "stock": 0
      }
    ],
    "createdAt": "2024-11-27 16:48:41"
  },
  {
    "id": 5286,
    "slug": "support",
    "name": "SUPPORT JP",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": false,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/support-scaled.jpg",
        "alt": "SUPPORT JP",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/support-4-scaled.jpg",
        "alt": "SUPPORT JP",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/support-8-scaled.jpg",
        "alt": "SUPPORT JP",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/support-2-scaled.jpg",
        "alt": "SUPPORT JP",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/support-3-scaled.jpg",
        "alt": "SUPPORT JP",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/support-5-scaled.jpg",
        "alt": "SUPPORT JP",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/support-6-scaled.jpg",
        "alt": "SUPPORT JP",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/support-7-scaled.jpg",
        "alt": "SUPPORT JP",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "SUPPORT JP",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "M",
        "price": 220,
        "stock": 0
      },
      {
        "label": "L",
        "price": 220,
        "stock": 0
      },
      {
        "label": "XL",
        "price": 220,
        "stock": 0
      }
    ],
    "createdAt": "2024-11-27 16:37:41"
  },
  {
    "id": 5275,
    "slug": "non-sei-a-casa",
    "name": "NON SEI A CASA",
    "priceCents": 25000,
    "salePrice": null,
    "sku": null,
    "inStock": false,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/non-sei-a-casa-5-scaled.jpg",
        "alt": "NON SEI A CASA",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/non-sei-a-casa-scaled.jpg",
        "alt": "NON SEI A CASA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/non-sei-a-casa-4-scaled.jpg",
        "alt": "NON SEI A CASA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/non-sei-a-casa-3-scaled.jpg",
        "alt": "NON SEI A CASA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/non-sei-a-casa-2-scaled.webp",
        "alt": "NON SEI A CASA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764818_y.jpg",
        "alt": "NON SEI A CASA",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-10-18 15:22:22"
  },
  {
    "id": 5263,
    "slug": "frank",
    "name": "FRANK",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/frank-scaled.jpg",
        "alt": "FRANK",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/frank-2-scaled.jpg",
        "alt": "FRANK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/frank-4-scaled.jpg",
        "alt": "FRANK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/frank-3-scaled.jpg",
        "alt": "FRANK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/frank-5-scaled.jpg",
        "alt": "FRANK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/frank-6-scaled.jpg",
        "alt": "FRANK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "FRANK",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "M",
        "price": 90,
        "stock": 1
      },
      {
        "label": "L",
        "price": 90,
        "stock": 1
      },
      {
        "label": "XL",
        "price": 90,
        "stock": 1
      }
    ],
    "createdAt": "2024-10-18 15:08:55"
  },
  {
    "id": 5256,
    "slug": "scimmiato",
    "name": "SCIMMIATO",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/scimmiato-1-scaled.jpg",
        "alt": "SCIMMIATO",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/scimmiato-2-1-scaled.jpg",
        "alt": "SCIMMIATO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/scimmiato-3-1-scaled.jpg",
        "alt": "SCIMMIATO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/scimmiato-4-1-scaled.webp",
        "alt": "SCIMMIATO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/scimmiato-5-1-scaled.jpg",
        "alt": "SCIMMIATO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "SCIMMIATO",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-10-18 14:55:52"
  },
  {
    "id": 5241,
    "slug": "occhi-chiusi",
    "name": "OCCHI CHIUSI",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/occhi-chiusi-scaled.jpg",
        "alt": "OCCHI CHIUSI",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/occhi-chiusi-2-scaled.jpg",
        "alt": "OCCHI CHIUSI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/occhi-chiusi-3-scaled.jpg",
        "alt": "OCCHI CHIUSI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/occhi-chiusi-5-scaled.jpg",
        "alt": "OCCHI CHIUSI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/occhi-chiusi-4-scaled.jpg",
        "alt": "OCCHI CHIUSI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "OCCHI CHIUSI",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-10-15 17:28:44"
  },
  {
    "id": 5232,
    "slug": "0854916",
    "name": "0854916",
    "priceCents": 11000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/0854916-scaled.jpg",
        "alt": "0854916",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/0854916-2-scaled.jpg",
        "alt": "0854916",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/0854916-5-scaled.jpg",
        "alt": "0854916",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/0854916-6-scaled.jpg",
        "alt": "0854916",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/0854916-4-scaled.jpg",
        "alt": "0854916",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/0854916-3-scaled.jpg",
        "alt": "0854916",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "0854916",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-10-15 17:21:26"
  },
  {
    "id": 5225,
    "slug": "regola-di-strada",
    "name": "REGOLA DI STRADA",
    "priceCents": 11000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/regola-di-strada-scaled.jpg",
        "alt": "REGOLA DI STRADA",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/regola-di-strada-2-scaled.jpg",
        "alt": "REGOLA DI STRADA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/regola-di-strada-3-scaled.jpg",
        "alt": "REGOLA DI STRADA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/regola-di-strada-4-scaled.jpg",
        "alt": "REGOLA DI STRADA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/regola-di-strada-5-scaled.jpg",
        "alt": "REGOLA DI STRADA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "REGOLA DI STRADA",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-10-15 17:14:42"
  },
  {
    "id": 5214,
    "slug": "3-colori",
    "name": "3 COLORI",
    "priceCents": 18000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/3-colori-scaled.jpg",
        "alt": "3 COLORI",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/3-colori-2-scaled.jpg",
        "alt": "3 COLORI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/3-colori-5-scaled.jpg",
        "alt": "3 COLORI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/3-colori-4-scaled.jpg",
        "alt": "3 COLORI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/3-colori-3-scaled.webp",
        "alt": "3 COLORI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "3 COLORI",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "M",
        "price": 180,
        "stock": 1
      },
      {
        "label": "L",
        "price": 180,
        "stock": 1
      }
    ],
    "createdAt": "2024-10-15 17:07:26"
  },
  {
    "id": 5207,
    "slug": "its-not-4",
    "name": "IT'S NOT 4",
    "priceCents": 18000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/its-not-4-scaled.jpg",
        "alt": "IT'S NOT 4",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-4-2-scaled.jpg",
        "alt": "IT'S NOT 4",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-4-3-scaled.jpg",
        "alt": "IT'S NOT 4",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-4-4-scaled.jpg",
        "alt": "IT'S NOT 4",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/LT__0680-scaled.jpg",
        "alt": "IT'S NOT 4",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/LT__0681-scaled.jpg",
        "alt": "IT'S NOT 4",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "IT'S NOT 4",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-10-15 16:59:10"
  },
  {
    "id": 5201,
    "slug": "its-not-3-doppia-felpa-girocollo-cotone-made-in-italy",
    "name": "IT'S NOT 3",
    "priceCents": 18000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/its-not-3-1-scaled.jpg",
        "alt": "IT'S NOT 3",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-3-scaled.jpg",
        "alt": "IT'S NOT 3",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-3.-3-scaled.jpg",
        "alt": "IT'S NOT 3",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-3.-2-scaled.jpg",
        "alt": "IT'S NOT 3",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/LT__0680-scaled.jpg",
        "alt": "IT'S NOT 3",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/LT__0681-scaled.jpg",
        "alt": "IT'S NOT 3",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "IT'S NOT 3",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-10-15 16:52:28"
  },
  {
    "id": 5194,
    "slug": "its-not-2-doppia-felpa-girocollo-cotone-made-in-italy",
    "name": "IT'S NOT 2",
    "priceCents": 18000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/its-not-2-1-scaled.jpg",
        "alt": "IT'S NOT 2",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-2-2-scaled.jpg",
        "alt": "IT'S NOT 2",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-2-3-scaled.jpg",
        "alt": "IT'S NOT 2",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-2-4-scaled.jpg",
        "alt": "IT'S NOT 2",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/LT__0681-scaled.jpg",
        "alt": "IT'S NOT 2",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/LT__0680-scaled.jpg",
        "alt": "IT'S NOT 2",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "IT'S NOT 2",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-10-15 16:44:43"
  },
  {
    "id": 5183,
    "slug": "its-not-doppia-felpa-girocollo-cotone-made-in-italy",
    "name": "IT'S NOT",
    "priceCents": 18000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/its-not-1-scaled.jpg",
        "alt": "IT'S NOT",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-1-2-scaled.jpg",
        "alt": "IT'S NOT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-1-4-scaled.jpg",
        "alt": "IT'S NOT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-1-3-scaled.jpg",
        "alt": "IT'S NOT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/its-not-1-5-scaled.jpg",
        "alt": "IT'S NOT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/LT__0680-scaled.jpg",
        "alt": "IT'S NOT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/LT__0681-scaled.jpg",
        "alt": "IT'S NOT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "IT'S NOT",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-10-15 16:31:28"
  },
  {
    "id": 5163,
    "slug": "marshall-felpa-garzata-cotone-made-in-italy",
    "name": "MARSHALL",
    "priceCents": 20000,
    "salePrice": null,
    "sku": null,
    "inStock": false,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/marshall-3-scaled.jpg",
        "alt": "MARSHALL",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/marshall-scaled.jpg",
        "alt": "MARSHALL",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/marshall-7-scaled.jpg",
        "alt": "MARSHALL",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/marshall-4-scaled.jpg",
        "alt": "MARSHALL",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/marshall-5-scaled.jpg",
        "alt": "MARSHALL",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/marshall-6-scaled.jpg",
        "alt": "MARSHALL",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/marshall-9-scaled.jpg",
        "alt": "MARSHALL",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/marshall-8-scaled.jpg",
        "alt": "MARSHALL",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "MARSHALL",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "L",
        "price": 200,
        "stock": 0
      },
      {
        "label": "XL",
        "price": 200,
        "stock": 0
      }
    ],
    "createdAt": "2024-10-14 19:00:22"
  },
  {
    "id": 5148,
    "slug": "1920-felpa-garzata-cotone-made-in-italy",
    "name": "1920",
    "priceCents": 18000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "sweatshirt",
    "categoryName": "Felpa",
    "images": [
      {
        "url": "/wp-content/uploads/2024/10/1920-1-scaled.jpg",
        "alt": "1920",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/10/1920-5-scaled.jpg",
        "alt": "1920",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/1920-scaled.jpg",
        "alt": "1920",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/1920-6-scaled.jpg",
        "alt": "1920",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/1920-4-scaled.jpg",
        "alt": "1920",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/1920-3-scaled.jpg",
        "alt": "1920",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/1920-2-scaled.jpg",
        "alt": "1920",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/1920-7-scaled.jpg",
        "alt": "1920",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/10/1920-8-scaled.jpg",
        "alt": "1920",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764817_y.jpg",
        "alt": "1920",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "M",
        "price": 180,
        "stock": 1
      },
      {
        "label": "L",
        "price": 180,
        "stock": 1
      }
    ],
    "createdAt": "2024-10-14 18:24:06"
  },
  {
    "id": 5054,
    "slug": "che-doppio-w-33-3",
    "name": "CHE DOPPIO (W 33)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/zdouble-w33-1-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/zdouble-w33-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/zdouble-w33-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/zdouble-w33-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/zdouble-w33-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 16:45:48"
  },
  {
    "id": 5047,
    "slug": "che-doppio-w-33-2",
    "name": "CHE DOPPIO (W 33)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/w33-1-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/w33-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/w33-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/w33-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/w33-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 16:41:11"
  },
  {
    "id": 5040,
    "slug": "che-doppio-w-34-2",
    "name": "CHE DOPPIO (W 34)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/IMG_1191-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/IMG_1195-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/IMG_1192-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/IMG_1193-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/IMG_1194-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 16:33:58"
  },
  {
    "id": 5033,
    "slug": "che-doppio-w-30",
    "name": "CHE DOPPIO (W 30)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/DOUBLE-W30-1-scaled.jpg",
        "alt": "CHE DOPPIO (W 30)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/DOUBLE-W30-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 30)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/DOUBLE-W30-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 30)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/DOUBLE-W30-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 30)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/DOUBLE-W30-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 30)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 30)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 30)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 30)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 30)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 16:26:49"
  },
  {
    "id": 5026,
    "slug": "che-doppio-w-31-2",
    "name": "CHE DOPPIO (W 31)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/double-w31-1-scaled.webp",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/double-w31-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/double-w31-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/double-w31-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/double-w31-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 16:14:03"
  },
  {
    "id": 5018,
    "slug": "che-doppio-w-32",
    "name": "CHE DOPPIO (W 32)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-W32-1-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-W32-6-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-W32-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-W32-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-W32-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-W32-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 16:09:31"
  },
  {
    "id": 5010,
    "slug": "che-doppio-w-31",
    "name": "CHE DOPPIO (W 31)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-w31-1-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-w31-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-w31-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-w31-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-w31-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/CHE-DOPPIO-w31-6-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 31)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 15:52:30"
  },
  {
    "id": 5003,
    "slug": "che-doppio-w-38",
    "name": "CHE DOPPIO (W 38)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w38-1-scaled.jpg",
        "alt": "CHE DOPPIO (W 38)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w38-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 38)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w38-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 38)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w38-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 38)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w38-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 38)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 38)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 38)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 38)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 38)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 15:39:11"
  },
  {
    "id": 4994,
    "slug": "che-doppio-w-33",
    "name": "CHE DOPPIO (W 33)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w33-1-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w33-6-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w33-7-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w33-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w33-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w33-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-w33-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 15:35:31"
  },
  {
    "id": 4987,
    "slug": "che-doppio-w-34",
    "name": "CHE DOPPIO (W 34)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-w34-1-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-w34-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-w34-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-w34-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-w34-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 34)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 15:30:20"
  },
  {
    "id": 4976,
    "slug": "che-doppio-w33",
    "name": "CHE DOPPIO (W 33)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-2-1-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-2-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-2-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-2-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/che-doppio-2-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 33)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 15:20:52"
  },
  {
    "id": 4963,
    "slug": "che-doppio-w32",
    "name": "CHE DOPPIO (W 32)",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-1-1-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-1-6-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-1-2-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-1-3-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-1-4-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-1-5-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Che-doppio-1-7-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0591-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0592-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0594-scaled.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "CHE DOPPIO (W 32)",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-10 15:15:38"
  },
  {
    "id": 4668,
    "slug": "doppia-fenice",
    "name": "DOPPIA FENICE",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/Doppia-fenice-1-scaled.jpg",
        "alt": "DOPPIA FENICE",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/Doppia-fenice-4-scaled.jpg",
        "alt": "DOPPIA FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Doppia-fenice-2-scaled.jpg",
        "alt": "DOPPIA FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Doppia-fenice-5-scaled.jpg",
        "alt": "DOPPIA FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Doppia-fenice-3-scaled.jpg",
        "alt": "DOPPIA FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/Doppia-fenice-7-1-scaled.jpg",
        "alt": "DOPPIA FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910-3.jpg",
        "alt": "DOPPIA FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909-3.jpg",
        "alt": "DOPPIA FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "DOPPIA FENICE",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-03 16:20:54"
  },
  {
    "id": 4659,
    "slug": "cappuccetto-arancio",
    "name": "CAPPUCCETTO ARANCIO",
    "priceCents": 18000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jackets",
    "categoryName": "Giacca",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/cappuccetto-1-scaled.jpg",
        "alt": "CAPPUCCETTO ARANCIO",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/cappuccetto-6-scaled.jpg",
        "alt": "CAPPUCCETTO ARANCIO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/cappuccetto-2-scaled.jpg",
        "alt": "CAPPUCCETTO ARANCIO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/cappuccetto-4-scaled.jpg",
        "alt": "CAPPUCCETTO ARANCIO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/cappuccetto-5-scaled.jpg",
        "alt": "CAPPUCCETTO ARANCIO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/cappuccetto-7-scaled.jpg",
        "alt": "CAPPUCCETTO ARANCIO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/cappuccetto3-scaled.jpg",
        "alt": "CAPPUCCETTO ARANCIO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0577-scaled.jpg",
        "alt": "CAPPUCCETTO ARANCIO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0578-scaled.jpg",
        "alt": "CAPPUCCETTO ARANCIO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5940701556288635085_y_8_11zon.webp",
        "alt": "CAPPUCCETTO ARANCIO",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-03 16:11:22"
  },
  {
    "id": 4648,
    "slug": "nuvola",
    "name": "NUVOLA",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jackets",
    "categoryName": "Giacca",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/nuvola-1-scaled.jpg",
        "alt": "NUVOLA",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/nuvola-6-scaled.jpg",
        "alt": "NUVOLA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuvola--scaled.jpg",
        "alt": "NUVOLA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuvola-2-scaled.jpg",
        "alt": "NUVOLA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuvola-3-scaled.jpg",
        "alt": "NUVOLA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuvola-4-scaled.jpg",
        "alt": "NUVOLA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuvola-5-scaled.jpg",
        "alt": "NUVOLA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuvola-7-scaled.jpg",
        "alt": "NUVOLA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuvola-8-scaled.jpg",
        "alt": "NUVOLA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5940701556288635085_y_8_11zon.webp",
        "alt": "NUVOLA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0580-scaled.jpg",
        "alt": "NUVOLA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0581-scaled.webp",
        "alt": "NUVOLA",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-03 16:03:19"
  },
  {
    "id": 4639,
    "slug": "nuove-democrazie",
    "name": "NUOVE DEMOCRAZIE",
    "priceCents": 24000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jackets",
    "categoryName": "Giacca",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/nuove-democrazie-1-scaled.jpg",
        "alt": "NUOVE DEMOCRAZIE",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/nuove-democrazie-7-scaled.jpg",
        "alt": "NUOVE DEMOCRAZIE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuove-demlocrazie-2-scaled.jpg",
        "alt": "NUOVE DEMOCRAZIE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuove-democrazie-3-scaled.jpg",
        "alt": "NUOVE DEMOCRAZIE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuove-democrazie-4-scaled.jpg",
        "alt": "NUOVE DEMOCRAZIE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuove-democrazie-5-scaled.jpg",
        "alt": "NUOVE DEMOCRAZIE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/nuove-democrazie-8-scaled.jpg",
        "alt": "NUOVE DEMOCRAZIE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0575-scaled.jpg",
        "alt": "NUOVE DEMOCRAZIE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0576-scaled.webp",
        "alt": "NUOVE DEMOCRAZIE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5940701556288635085_y_8_11zon.webp",
        "alt": "NUOVE DEMOCRAZIE",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-03 15:55:00"
  },
  {
    "id": 4631,
    "slug": "fenice",
    "name": "FENICE",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/fenice-1-scaled.jpg",
        "alt": "FENICE",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/ffenice-4-scaled.jpg",
        "alt": "FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/fenice-2-scaled.jpg",
        "alt": "FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/fenice-3-scaled.jpg",
        "alt": "FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/fenice-5-scaled.jpg",
        "alt": "FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/fenice-6-scaled.jpg",
        "alt": "FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0553-scaled.webp",
        "alt": "FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/LT__0554-scaled.jpg",
        "alt": "FENICE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "FENICE",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-03 15:41:35"
  },
  {
    "id": 4622,
    "slug": "faccia-a-faccia",
    "name": "FACCIA A FACCIA",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/08/faccia-a-faccia-1-scaled.jpg",
        "alt": "FACCIA A FACCIA",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/08/faccia-a-faccia4-scaled.jpg",
        "alt": "FACCIA A FACCIA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/faccia-afaccia-2-scaled.jpg",
        "alt": "FACCIA A FACCIA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/08/faccia-a-faccia-3-scaled.jpg",
        "alt": "FACCIA A FACCIA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909-4.jpg",
        "alt": "FACCIA A FACCIA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910-4.jpg",
        "alt": "FACCIA A FACCIA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "FACCIA A FACCIA",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-08-03 15:28:00"
  },
  {
    "id": 4481,
    "slug": "scacco_cucito",
    "name": "SCACCO CUCITO",
    "priceCents": 7000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "cap",
    "categoryName": "Cappello",
    "images": [
      {
        "url": "/wp-content/uploads/2024/11/LT__1437-scaled.jpg",
        "alt": "SCACCO CUCITO",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1438-scaled.jpg",
        "alt": "SCACCO CUCITO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/11/LT__1436-scaled.jpg",
        "alt": "SCACCO CUCITO",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-16 09:58:00"
  },
  {
    "id": 4460,
    "slug": "bianco-su-bianco",
    "name": "BIANCO SU BIANCO",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/bianco-su-bianco-2-scaled.jpg",
        "alt": "BIANCO SU BIANCO",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/Bianco-su-biano-1-scaled.jpg",
        "alt": "BIANCO SU BIANCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Bianco-su-bianco-7-scaled.jpg",
        "alt": "BIANCO SU BIANCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/bianco-su-bianco-6-scaled.jpg",
        "alt": "BIANCO SU BIANCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/bianco-su-bianco-5-scaled.jpg",
        "alt": "BIANCO SU BIANCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/bianco-su-bianco-4-scaled.jpg",
        "alt": "BIANCO SU BIANCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909-2.jpg",
        "alt": "BIANCO SU BIANCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910-2.jpg",
        "alt": "BIANCO SU BIANCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "BIANCO SU BIANCO",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-16 09:31:53"
  },
  {
    "id": 4417,
    "slug": "ipsilon",
    "name": "IPSILON",
    "priceCents": 8000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "cap",
    "categoryName": "Cappello",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/Ipsilon-1-scaled.jpg",
        "alt": "IPSILON",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/Ipsilon-2-scaled.jpg",
        "alt": "IPSILON",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Ipsilon-3-scaled.jpg",
        "alt": "IPSILON",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-14 06:54:22"
  },
  {
    "id": 4367,
    "slug": "sinogramma",
    "name": "SINOGRAMMA",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/Sinogramma-1-scaled.jpg",
        "alt": "SINOGRAMMA",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/sinogramma-scaled.jpg",
        "alt": "SINOGRAMMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Sinogramma-2-scaled.jpg",
        "alt": "SINOGRAMMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Sinogramma-3-scaled.jpg",
        "alt": "SINOGRAMMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Sinogramma-5-scaled.jpg",
        "alt": "SINOGRAMMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Sinogramma-4-scaled.jpg",
        "alt": "SINOGRAMMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Sinogramma-6-scaled.jpg",
        "alt": "SINOGRAMMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909-10.jpg",
        "alt": "SINOGRAMMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910-10.jpg",
        "alt": "SINOGRAMMA",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "SINOGRAMMA",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-13 14:15:30"
  },
  {
    "id": 4357,
    "slug": "falso",
    "name": "FALSO",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/Falso-1-scaled.jpg",
        "alt": "FALSO",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/Falso-5-scaled.jpg",
        "alt": "FALSO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Falso-2-scaled.jpg",
        "alt": "FALSO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Falso-3-scaled.jpg",
        "alt": "FALSO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Falso-4-scaled.jpg",
        "alt": "FALSO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Falso-6-scaled.jpg",
        "alt": "FALSO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909-5.jpg",
        "alt": "FALSO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910-5.jpg",
        "alt": "FALSO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "FALSO",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "S",
        "price": 90,
        "stock": 1
      },
      {
        "label": "L",
        "price": 90,
        "stock": 1
      },
      {
        "label": "M",
        "price": 90,
        "stock": 1
      },
      {
        "label": "XL",
        "price": 90,
        "stock": 1
      }
    ],
    "createdAt": "2024-07-13 14:10:09"
  },
  {
    "id": 4348,
    "slug": "alt",
    "name": "ALT",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/ALT-1-scaled.jpg",
        "alt": "ALT",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/ALT-4-scaled.jpg",
        "alt": "ALT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/ALT-2-scaled.jpg",
        "alt": "ALT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/ALT-3-scaled.jpg",
        "alt": "ALT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/ALT-5-scaled.jpg",
        "alt": "ALT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910-1.jpg",
        "alt": "ALT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909-1.jpg",
        "alt": "ALT",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "ALT",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-13 13:59:31"
  },
  {
    "id": 4340,
    "slug": "fanculo-larte",
    "name": "FANCULO L'ARTE",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/Fanculo-larte-1-scaled.jpg",
        "alt": "FANCULO L'ARTE",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/Fanculo-larte-5-scaled.jpg",
        "alt": "FANCULO L'ARTE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Fanculo-larte-2-scaled.jpg",
        "alt": "FANCULO L'ARTE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Fanculo-larte-3-scaled.jpg",
        "alt": "FANCULO L'ARTE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Fanculo-larte-4-scaled.jpg",
        "alt": "FANCULO L'ARTE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910-6.jpg",
        "alt": "FANCULO L'ARTE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909-6.jpg",
        "alt": "FANCULO L'ARTE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "FANCULO L'ARTE",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-13 13:53:40"
  },
  {
    "id": 4334,
    "slug": "agli-ordini",
    "name": "AGLI ORDINI",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": false,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/Agli-ordini-1-scaled.jpg",
        "alt": "AGLI ORDINI",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/Agli-ordini-2-scaled.jpg",
        "alt": "AGLI ORDINI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Agli-ordini-3-scaled.jpg",
        "alt": "AGLI ORDINI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Agli-ordini-4-scaled.jpg",
        "alt": "AGLI ORDINI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909.jpg",
        "alt": "AGLI ORDINI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910.jpg",
        "alt": "AGLI ORDINI",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "AGLI ORDINI",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-13 13:46:02"
  },
  {
    "id": 4324,
    "slug": "luomo-con-il-cappello",
    "name": "L'UOMO CON IL CAPPELLO",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/Luomo-con-il-cappello-1-scaled.jpg",
        "alt": "L'UOMO CON IL CAPPELLO",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/Luomo-con-il-cappello-5-scaled.jpg",
        "alt": "L'UOMO CON IL CAPPELLO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Luomo-con-il-cappello-2-scaled.jpg",
        "alt": "L'UOMO CON IL CAPPELLO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Luomo-con-il-cappello-3-scaled.jpg",
        "alt": "L'UOMO CON IL CAPPELLO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Luomo-con-il-cappello-4-scaled.jpg",
        "alt": "L'UOMO CON IL CAPPELLO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Luomo-con-il-cappello-6-scaled.jpg",
        "alt": "L'UOMO CON IL CAPPELLO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910-9.jpg",
        "alt": "L'UOMO CON IL CAPPELLO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909-9.jpg",
        "alt": "L'UOMO CON IL CAPPELLO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "L'UOMO CON IL CAPPELLO",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-12 17:16:00"
  },
  {
    "id": 4309,
    "slug": "il-fantasma-nel-bosco",
    "name": "IL FANTASMA NEL BOSCO",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/Il-fantasma-nel-bosco-1-scaled.jpg",
        "alt": "IL FANTASMA NEL BOSCO",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/Il-fantasma-nel-bosco-6-scaled.jpg",
        "alt": "IL FANTASMA NEL BOSCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Il-fantasma-nel-bosco-2-scaled.jpg",
        "alt": "IL FANTASMA NEL BOSCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Il-fantasma-nel-bosco-3-scaled.jpg",
        "alt": "IL FANTASMA NEL BOSCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Il-fantasma-nel-bosco-4-scaled.jpg",
        "alt": "IL FANTASMA NEL BOSCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Il-fantasma-nel-bosco-5-scaled.jpg",
        "alt": "IL FANTASMA NEL BOSCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/Il-fantasma-nel-bosco-7-scaled.jpg",
        "alt": "IL FANTASMA NEL BOSCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909-7.jpg",
        "alt": "IL FANTASMA NEL BOSCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910-7.jpg",
        "alt": "IL FANTASMA NEL BOSCO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "IL FANTASMA NEL BOSCO",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-12 17:02:16"
  },
  {
    "id": 4301,
    "slug": "king-kong-1933",
    "name": "KING KONG 1933",
    "priceCents": 9000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/King-Kong-1933-1-scaled.jpg",
        "alt": "KING KONG 1933",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/King-Kong-1933-6-scaled.jpg",
        "alt": "KING KONG 1933",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/King-Kong-1933-3-scaled.jpg",
        "alt": "KING KONG 1933",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/King-Kong-1933-2-scaled.jpg",
        "alt": "KING KONG 1933",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/King-Kong-1933-4-scaled.jpg",
        "alt": "KING KONG 1933",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/King-Kong-1933-5-scaled.jpg",
        "alt": "KING KONG 1933",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635910-8.jpg",
        "alt": "KING KONG 1933",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/09/1000635909-8.jpg",
        "alt": "KING KONG 1933",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "KING KONG 1933",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-12 16:44:33"
  },
  {
    "id": 4297,
    "slug": "x",
    "name": "X",
    "priceCents": 7000,
    "salePrice": null,
    "sku": "X",
    "inStock": true,
    "categorySlug": "t-shirt",
    "categoryName": "T-Shirt",
    "images": [
      {
        "url": "/wp-content/uploads/2024/07/x-1-scaled.jpg",
        "alt": "X",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2024/07/x-5-scaled.jpg",
        "alt": "X",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/x-6-scaled.jpg",
        "alt": "X",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/x-4-scaled.jpg",
        "alt": "X",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/x-3-scaled.jpg",
        "alt": "X",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2024/07/x-2-scaled.jpg",
        "alt": "X",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764821_y.jpg",
        "alt": "X",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2024-07-12 16:31:29"
  },
  {
    "id": 3768,
    "slug": "open-the-cage",
    "name": "OPEN THE CAGE",
    "priceCents": 22000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2023/10/Open-the-cage-fron-jeans-scaled.jpg",
        "alt": "OPEN THE CAGE",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2023/10/open-the-cage-retro-jeans-scaled.jpg",
        "alt": "OPEN THE CAGE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/open-the-cage-dettaglio-2-jeans.png",
        "alt": "OPEN THE CAGE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/open-the-cage-dettaglio-1-jeans.png",
        "alt": "OPEN THE CAGE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/open-the-cage-dettaglio-3-jeans.png",
        "alt": "OPEN THE CAGE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5994598271957450804_y.jpg",
        "alt": "OPEN THE CAGE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "OPEN THE CAGE",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "W30",
        "price": 220,
        "stock": 1
      },
      {
        "label": "W31",
        "price": 220,
        "stock": 1
      },
      {
        "label": "W32",
        "price": 220,
        "stock": 1
      },
      {
        "label": "W33",
        "price": 220,
        "stock": 1
      },
      {
        "label": "W34",
        "price": 220,
        "stock": 1
      },
      {
        "label": "W36",
        "price": 220,
        "stock": 1
      },
      {
        "label": "W38",
        "price": 220,
        "stock": 1
      },
      {
        "label": "W40",
        "price": 220,
        "stock": 1
      }
    ],
    "createdAt": "2024-03-09 13:43:45"
  },
  {
    "id": 3757,
    "slug": "ninety-degrees",
    "name": "NINETY DEGREES",
    "priceCents": 11000,
    "salePrice": null,
    "sku": null,
    "inStock": false,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2023/12/ninety-degrees-front-jeans-scaled.jpg",
        "alt": "NINETY DEGREES",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2023/12/ninety-degrees-retro-jeans-scaled.jpg",
        "alt": "NINETY DEGREES",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/12/ninety-degrees-dettaglio-1-jeans.png",
        "alt": "NINETY DEGREES",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "NINETY DEGREES",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "W30",
        "price": 110,
        "stock": 0
      },
      {
        "label": "W31",
        "price": 110,
        "stock": 0
      },
      {
        "label": "W32",
        "price": 110,
        "stock": 0
      },
      {
        "label": "W33",
        "price": 110,
        "stock": 0
      },
      {
        "label": "W34",
        "price": 110,
        "stock": 0
      },
      {
        "label": "W36",
        "price": 110,
        "stock": 0
      },
      {
        "label": "W38",
        "price": 110,
        "stock": 0
      },
      {
        "label": "W40",
        "price": 110,
        "stock": 0
      }
    ],
    "createdAt": "2024-03-09 13:36:32"
  },
  {
    "id": 3679,
    "slug": "two-face-2",
    "name": "TWO-FACE",
    "priceCents": 20000,
    "salePrice": null,
    "sku": null,
    "inStock": true,
    "categorySlug": "denim-shorts",
    "categoryName": "Denim Shorts",
    "images": [
      {
        "url": "/wp-content/uploads/2023/11/two-face-retro-jeans-2-scaled.jpg",
        "alt": "TWO-FACE",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2023/11/two-face-retro-jeans-1-scaled.jpg",
        "alt": "TWO-FACE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/two-face-dettaglio-1-jeans.png",
        "alt": "TWO-FACE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/two-face-dettaglio-2-jeans.png",
        "alt": "TWO-FACE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "TWO-FACE",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "W 30",
        "price": 200,
        "stock": 1
      },
      {
        "label": "W 31",
        "price": 200,
        "stock": 1
      },
      {
        "label": "W 32",
        "price": 200,
        "stock": 1
      },
      {
        "label": "W 33",
        "price": 200,
        "stock": 1
      },
      {
        "label": "W 34",
        "price": 200,
        "stock": 1
      },
      {
        "label": "W36",
        "price": 200,
        "stock": 1
      },
      {
        "label": "W38",
        "price": 200,
        "stock": 1
      },
      {
        "label": "W40",
        "price": 200,
        "stock": 1
      }
    ],
    "createdAt": "2024-02-28 18:43:10"
  },
  {
    "id": 3579,
    "slug": "krokodil",
    "name": "KROKODIL",
    "priceCents": 15000,
    "salePrice": null,
    "sku": "krokodile",
    "inStock": true,
    "categorySlug": "jeans-2",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/wp-content/uploads/2023/12/krokodil-front-jeans-scaled.webp",
        "alt": "KROKODIL",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2023/12/krocodil-retro-jeans-scaled.webp",
        "alt": "KROKODIL",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/12/krokodil-dettaglio-1-scaled.webp",
        "alt": "KROKODIL",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5861685513935764819_y.jpg",
        "alt": "KROKODIL",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "W30",
        "price": 150,
        "stock": 0
      },
      {
        "label": "W31",
        "price": 150,
        "stock": 0
      },
      {
        "label": "W32",
        "price": 150,
        "stock": 0
      },
      {
        "label": "W33",
        "price": 150,
        "stock": 0
      },
      {
        "label": "W34",
        "price": 150,
        "stock": 0
      },
      {
        "label": "W36",
        "price": 150,
        "stock": 0
      },
      {
        "label": "W38",
        "price": 150,
        "stock": 0
      },
      {
        "label": "W40",
        "price": 150,
        "stock": 0
      }
    ],
    "createdAt": "2023-12-31 15:48:39"
  },
  {
    "id": 3178,
    "slug": "point-break",
    "name": "POINT BREAK",
    "priceCents": 13000,
    "salePrice": null,
    "sku": "POINT BREAK",
    "inStock": true,
    "categorySlug": "camicia-jeans",
    "categoryName": "Camicia Denim",
    "images": [
      {
        "url": "/wp-content/uploads/2023/12/point-break-front-camicia-jeans-scaled.jpg",
        "alt": "POINT BREAK",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2023/12/point-break-retro-camicia-jeans-scaled.jpg",
        "alt": "POINT BREAK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/12/Point-break-dettaglio-2-camicia-jeans.png",
        "alt": "POINT BREAK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/12/Point-break-dettaglio-1-camicia-jeans.png",
        "alt": "POINT BREAK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/12/photo_5769647349784756291_y.jpg",
        "alt": "POINT BREAK",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2023-12-13 17:44:44"
  },
  {
    "id": 2648,
    "slug": "crazy-pocket-three",
    "name": "CRAZY POCKET THREE",
    "priceCents": 45000,
    "salePrice": null,
    "sku": "CRAZY POCKET 3",
    "inStock": true,
    "categorySlug": "giacca-denim",
    "categoryName": "Giacca Denim",
    "images": [
      {
        "url": "/wp-content/uploads/2023/10/crazy-pocket-three-front-giacca-jeans-scaled.jpg",
        "alt": "CRAZY POCKET THREE",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2023/10/crazy-pocket-retro-giacca-jeans-scaled.jpg",
        "alt": "CRAZY POCKET THREE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/crazy-pocket-three-dettaglio-4-giacca.png",
        "alt": "CRAZY POCKET THREE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/crazy-pocket-three-dettaglio-2-giacca.png",
        "alt": "CRAZY POCKET THREE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/crazy-poket-thrre-dettaglio-2-giacca.png",
        "alt": "CRAZY POCKET THREE",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5940701556288635085_y_8_11zon.webp",
        "alt": "CRAZY POCKET THREE",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2023-11-14 16:27:17"
  },
  {
    "id": 2637,
    "slug": "crazy-pocket-two",
    "name": "CRAZY POCKET TWO",
    "priceCents": 45000,
    "salePrice": null,
    "sku": "CRAZY POCKET 2",
    "inStock": true,
    "categorySlug": "giacca-denim",
    "categoryName": "Giacca Denim",
    "images": [
      {
        "url": "/wp-content/uploads/2023/10/crazy-pocket-two-front-giacca-jeans-scaled.jpg",
        "alt": "CRAZY POCKET TWO",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2023/10/crazy-pocket-retro-giacca-jeans-scaled.jpg",
        "alt": "CRAZY POCKET TWO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/crazy-pocket-two-dettaglio-2-giacca.png",
        "alt": "CRAZY POCKET TWO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/crazy-pocket-two-dettaglio-4-giacca.png",
        "alt": "CRAZY POCKET TWO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5769647349784756199_y.jpg",
        "alt": "CRAZY POCKET TWO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5769647349784756196_y.jpg",
        "alt": "CRAZY POCKET TWO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5769647349784756197_y.jpg",
        "alt": "CRAZY POCKET TWO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5769647349784756195_y.jpg",
        "alt": "CRAZY POCKET TWO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5769647349784756194_y.jpg",
        "alt": "CRAZY POCKET TWO",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5940701556288635085_y_8_11zon.webp",
        "alt": "CRAZY POCKET TWO",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2023-11-14 16:12:36"
  },
  {
    "id": 2174,
    "slug": "2174",
    "name": "MILITARY PINK",
    "priceCents": 22000,
    "salePrice": null,
    "sku": "military pink",
    "inStock": true,
    "categorySlug": "giacca-denim",
    "categoryName": "Giacca Denim",
    "images": [
      {
        "url": "/wp-content/uploads/2023/10/Military-pink-front-giacca-jeans-scaled.jpg",
        "alt": "MILITARY PINK",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2023/10/military-pink-retro-giacca-jeans-scaled.jpg",
        "alt": "MILITARY PINK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/military-pink-dettaglio-giacca-jeans-3.png",
        "alt": "MILITARY PINK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/Military-pink-dettaglio-giacca-jeans-2.png",
        "alt": "MILITARY PINK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/military-pink-dettaglio-giacca-jeans-1.png",
        "alt": "MILITARY PINK",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/11/photo_5940701556288635085_y_8_11zon.webp",
        "alt": "MILITARY PINK",
        "isThumbnail": false
      }
    ],
    "sizes": [],
    "createdAt": "2023-10-24 16:07:41"
  },
  {
    "id": 1664,
    "slug": "pray-for-me",
    "name": "PRAY FOR ME",
    "priceCents": 17000,
    "salePrice": null,
    "sku": "Pray for me",
    "inStock": true,
    "categorySlug": "camicia-jeans",
    "categoryName": "Camicia Denim",
    "images": [
      {
        "url": "/wp-content/uploads/2023/10/pray-for-me-L-front-camicia-scaled.jpg",
        "alt": "PRAY FOR ME",
        "isThumbnail": true
      },
      {
        "url": "/wp-content/uploads/2023/10/Pray-for-me-retro-camicia-scaled.jpg",
        "alt": "PRAY FOR ME",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/pray-for-me-dettaglio-1-camicia-scaled.jpg",
        "alt": "PRAY FOR ME",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5881809501596794144_y.jpg",
        "alt": "PRAY FOR ME",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5881809501596794143_y.jpg",
        "alt": "PRAY FOR ME",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5881809501596794146_y.jpg",
        "alt": "PRAY FOR ME",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/10/photo_5881809501596794145_y.jpg",
        "alt": "PRAY FOR ME",
        "isThumbnail": false
      },
      {
        "url": "/wp-content/uploads/2023/12/photo_5769647349784756291_y.jpg",
        "alt": "PRAY FOR ME",
        "isThumbnail": false
      }
    ],
    "sizes": [
      {
        "label": "M",
        "price": 170,
        "stock": 0
      },
      {
        "label": "L",
        "price": 170,
        "stock": 0
      }
    ],
    "createdAt": "2023-10-10 17:13:02"
  }
];

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
