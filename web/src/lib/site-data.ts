export type Category = {
  slug: string;
  name: string;
  pieces: number;
  note: string;
};

export type Product = {
  id: string;
  slug: string;
  category: string;
  name: string;
  price: string;
  compareAt?: string;
  badge?: string;
  palette: string;
  mood: string;
};

export const categories: Category[] = [
  { slug: "felpe", name: "Felpe", pieces: 12, note: "Oversize, lavaggi profondi, dettagli raw." },
  { slug: "tshirt", name: "T-Shirt", pieces: 8, note: "Grafica pulita, cuciture precise, fit deciso." },
  { slug: "jeans", name: "Jeans", pieces: 10, note: "Denim lavorato a mano, fit costruiti nel laboratorio." },
  { slug: "giacche-denim", name: "Giacche Denim", pieces: 9, note: "Pezzi statement, custom, piccole serie." },
  { slug: "camicie-denim", name: "Camicie Denim", pieces: 7, note: "Layering leggero per drop stagionali." },
  { slug: "denim-customize", name: "Customize", pieces: 1, note: "Richieste su misura e interventi unici." },
];

export const featuredProducts: Product[] = [
  {
    id: "jp-001",
    slug: "giacca-denim-custom-001",
    category: "Giacche Denim",
    name: "Giacca Denim Custom #001",
    price: "149,00",
    badge: "Nuovo drop",
    palette: "from-[#1a2f52] via-[#0d1628] to-[#0a0d14]",
    mood: "Patchwork blu notte, spalle rigide, attitudine street couture.",
  },
  {
    id: "jp-002",
    slug: "felpa-oversize-logo-002",
    category: "Felpe",
    name: "Felpa Oversize Logo #002",
    price: "79,00",
    compareAt: "99,00",
    palette: "from-[#4b1f16] via-[#23120d] to-[#090909]",
    mood: "Cotone corposo, stampa frontale secca, silhouette ampia.",
  },
  {
    id: "jp-003",
    slug: "jeans-handcrafted-slim-003",
    category: "Jeans",
    name: "Jeans Handcrafted Slim #003",
    price: "119,00",
    badge: "Bestseller",
    palette: "from-[#3d536d] via-[#17212e] to-[#0b0f15]",
    mood: "Lavaggio stone, fit asciutto, cuciture in evidenza.",
  },
  {
    id: "jp-004",
    slug: "tshirt-grafica-denim-004",
    category: "T-Shirt",
    name: "T-Shirt Grafica Denim #004",
    price: "45,00",
    palette: "from-[#6a4a1f] via-[#2f2211] to-[#0b0b0b]",
    mood: "Base essenziale, stampa forte, layering immediato.",
  },
  {
    id: "jp-005",
    slug: "camicia-denim-custom-005",
    category: "Camicie Denim",
    name: "Camicia Denim Custom #005",
    price: "95,00",
    badge: "Esaurito",
    palette: "from-[#223247] via-[#111922] to-[#090b10]",
    mood: "Taglio boxy, denim leggero, finiture artigianali.",
  },
  {
    id: "jp-006",
    slug: "cappello-ricamato-006",
    category: "Accessori",
    name: "Cappello Ricamato #006",
    price: "35,00",
    palette: "from-[#111111] via-[#292929] to-[#050505]",
    mood: "Ricamo pulito, costruzione asciutta, look everyday.",
  },
];

export const studioStats = [
  { label: "Capi realizzati", value: "500+" },
  { label: "Pezzi limited", value: "31" },
  { label: "Anni di lavoro", value: "8" },
  { label: "Valutazione clienti", value: "4.9" },
];

export const adminOverview = {
  revenue: "€12.840",
  orders: 84,
  conversion: "3.4%",
  avgOrder: "€152",
  topProducts: [
    "Giacca Denim Custom #001",
    "Jeans Handcrafted Slim #003",
    "Felpa Oversize Logo #002",
  ],
  lowStock: [
    { name: "Camicia Denim Custom #005", units: 1 },
    { name: "Cappello Ricamato #006", units: 2 },
    { name: "Giacca Cargo Denim #007", units: 1 },
  ],
  timeline: [
    { day: "Lun", value: 6 },
    { day: "Mar", value: 8 },
    { day: "Mer", value: 5 },
    { day: "Gio", value: 11 },
    { day: "Ven", value: 9 },
    { day: "Sab", value: 14 },
    { day: "Dom", value: 7 },
  ],
};
