/**
 * SEO configuration for store categories.
 *
 * Client-safe (no server-only imports): used by Navbar, Footer, ShopCatalog,
 * category landing pages, product metadata and the sitemap.
 *
 * Keyword targets combine high-volume Italian search queries with international
 * artisanal/reworked denim entities benchmarked from Gallery Dept., Kapital,
 * Who Decides War, Greg Lauren, Fort Lonesome and Lot, Stock and Barrel
 * (documented in docs/seo-keyword-research.md).
 */

export type CategoryFaq = {
  question: string;
  answer: string;
};

export type CategorySeo = {
  /** Internal category slug (DB / catalog). */
  slug: string;
  /** Public URL segment used in /shop/<path>/. */
  path: string;
  /** <title> for the category landing page (brand suffix added by template). */
  title: string;
  /** Meta description (~150-165 chars). */
  description: string;
  /** Visible H1 on the category page. */
  h1: string;
  /** Singular label used in product titles, e.g. "Jeans personalizzato fatto a mano". */
  productLabel: string;
  /** H2 of the long-form SEO block at the bottom of the category page. */
  contentTitle: string;
  /** Long-form, keyword-rich copy for the bottom of the category page. */
  content: string[];
  /** Craft & technique pills displayed in the editorial footer of the category. */
  craftTags: string[];
  /** Category-specific FAQs rendered on-page and injected as FAQPage JSON-LD. */
  faqs: CategoryFaq[];
  keywords: string[];
};

export const CATEGORY_SEO: CategorySeo[] = [
  {
    slug: "jeans-2",
    path: "jeans",
    title: "Jeans Personalizzati Fatti a Mano – One-of-One Distressed Denim",
    description:
      "Jeans personalizzati e strappati fatti a mano a Montesilvano (PE): patchwork boro, cuciture a vista, ricami chainstitch tattoo e hand-painting. Pezzi unici 1/1 made in Italy.",
    h1: "Jeans Personalizzati Fatti a Mano",
    productLabel: "Jeans personalizzato fatto a mano",
    contentTitle: "Jeans custom artigianali 1/1, tra rammendi boro, aerografo e tattoo clothing",
    content: [
      "Ogni paio di jeans personalizzati Jacopo Peca nasce su denim selezionato ad alta densità e viene lavorato interamente a mano nel laboratorio di Montesilvano (Pescara): strappi calibrati, rammendi a vista ispirati alla tradizione boro e sashiko, patchwork tessile, ricami chainstitch in stile tattoo e interventi hand-painted ad aerografo.",
      "Niente lavaggi industriali o grafiche stampate in serie: sono jeans uomo e donna one-of-one (1/1) o in micro-tiratura, pensati per chi cerca la qualità dell'artisanal distressed denim internazionale prodotta in Italia. Se un modello è esaurito o non trovi la tua taglia (es. W30–W38), puoi commissionare una lavorazione simile su misura tramite Denim Customize.",
    ],
    craftTags: [
      "1-of-1 Handcrafted Denim",
      "Hand-Distressed & Boro Patchwork",
      "Cornely Chainstitch Embroidery",
      "Airbrush & Hand-Painted",
      "Made in Montesilvano, Italy",
    ],
    faqs: [
      {
        question: "Come si lavano i jeans personalizzati e dipinti a mano?",
        answer:
          "I colori per tessuto e i ricami sono fissati in laboratorio per durare nel tempo. Consigliamo il lavaggio a mano in acqua fredda o in lavatrice a massimo 30°C con capo rovesciato, ciclo delicato e senza asciugatrice.",
      },
      {
        question: "Come scelgo la taglia giusta dei jeans custom?",
        answer:
          "Ogni scheda prodotto riporta le taglie disponibili (es. W31, W32, W33, W34, W38). Prima o dopo l'ordine puoi scrivere su WhatsApp per ricevere le misure esatte in centimetri di vita, cavallo, coscia e lunghezza.",
      },
      {
        question: "Posso richiedere un paio di jeans personalizzati sulla mia taglia se è esaurito?",
        answer:
          "Sì. Ogni paio resta un pezzo unico 1/1, ma dal servizio Denim Customize possiamo realizzare un nuovo intervento su una base della tua taglia o direttamente su un tuo jeans.",
      },
    ],
    keywords: [
      "jeans personalizzati",
      "jeans fatti a mano",
      "jeans strappati uomo artigianali",
      "jeans custom",
      "jeans pezzo unico",
      "jeans dipinti a mano",
      "jeans patchwork",
      "jeans made in Italy",
      "hand-painted distressed jeans",
      "reworked patchwork denim",
      "one of one jeans",
      "boro sashiko jeans",
    ],
  },
  {
    slug: "giacca-denim",
    path: "giacche-di-jeans",
    title: "Giacche di Jeans Personalizzate e Dipinte a Mano – Chainstitch & 1/1",
    description:
      "Giacche di jeans personalizzate, dipinte a mano e ricamate con macchina Cornely chainstitch nel laboratorio Jacopo Peca. Pezzi unici 1/1 di denim art made in Italy.",
    h1: "Giacche di Jeans Personalizzate",
    productLabel: "Giacca di jeans personalizzata",
    contentTitle: "Giacche in denim dipinte a mano e ricamate a punto catenella Cornely",
    content: [
      "La giacca di jeans è il capo manifesto dell'atelier Jacopo Peca: una tela viva su cui lavorare con aerografo, pittura per tessuti, ricamo a punto catenella (chainstitch) guidato a mano su macchina d'epoca Cornely, toppe e intarsi. Ogni giacca di jeans personalizzata è un esemplare one-of-one (1/1) firmato in laboratorio.",
      "Che tu stia cercando una giacca jeans dipinta a mano pronta da indossare o voglia commissionare un backpiece in stile tattoo old-school o un lettering chainstitch sulla schiena, puoi scegliere un pezzo disponibile nello store oppure aprire una richiesta su misura nella pagina Denim Customize.",
    ],
    craftTags: [
      "1/1 Custom Denim Jacket",
      "Vintage Cornely Chainstitch",
      "Hand-Painted Backpiece",
      "Tattoo Clothing Art",
      "Made in Italy",
    ],
    faqs: [
      {
        question: "Il dipinto e il ricamo sulla giacca di jeans resistono ai lavaggi?",
        answer:
          "Sì. Utilizziamo pigmenti specifici per fibre naturali fissati termicamente e filati ad alta tenuta cuciti con macchina Cornely. Lavando la giacca a mano o a freddo al rovescio, pittura e ricamo mantengono intatta la loro resa.",
      },
      {
        question: "Posso far dipingere o ricamare una mia giacca di jeans?",
        answer:
          "Certamente. Dalla sezione Denim Customize puoi inviarci le foto della tua giacca e l'idea del soggetto (sulla schiena, sul petto o sulle maniche) per concordare intervento, tempi e preventivo prima di spedirla in laboratorio.",
      },
    ],
    keywords: [
      "giacca di jeans personalizzata",
      "giacca jeans dipinta a mano",
      "giubbotto di jeans personalizzato",
      "giacca jeans ricamata",
      "giacca denim artigianale",
      "custom denim jacket",
      "chainstitch denim jacket",
      "hand-painted denim jacket",
      "ricamo Cornely su jeans",
      "one of one denim jacket",
    ],
  },
  {
    slug: "sweatshirt",
    path: "felpe",
    title: "Felpe Personalizzate Fatte a Mano – Custom Streetwear 1/1",
    description:
      "Felpe personalizzate streetwear fatte a mano: aerografo, inserti in denim, ricami Cornely e cuciture artigianali. Felpe oversize uniche, made in Italy da Jacopo Peca.",
    h1: "Felpe Personalizzate Fatte a Mano",
    productLabel: "Felpa personalizzata fatta a mano",
    contentTitle: "Felpe streetwear custom in tiratura limitata e pezzi 1/1",
    content: [
      "Le felpe Jacopo Peca sono lavorate una per una nel laboratorio di Montesilvano: inserti in denim, aerografo a mano libera, ricami chainstitch e cuciture a contrasto trasformano una base in cotone pesante in una felpa personalizzata dal carattere urbano irripetibile.",
      "Volumi boxy e oversize, dettagli distressed e grafiche ispirate al tattoo clothing: ogni felpa è un pezzo unico o una micro-serie numerata, spedita con corriere tracciato in tutta Italia ed Europa.",
    ],
    craftTags: [
      "Heavyweight Cotton & Denim Inserts",
      "Hand-Airbrushed Graphics",
      "Chainstitch & Raw Seams",
      "Limited / 1-of-1 Streetwear",
    ],
    faqs: [
      {
        question: "Che vestibilità hanno le felpe Jacopo Peca?",
        answer:
          "Le felpe hanno un taglio streetwear rilassato/oversize in cotone strutturato. Se desideri le misure esatte di spalle, torace e lunghezza prima dell'acquisto puoi scriverci su WhatsApp.",
      },
      {
        question: "Le grafiche sulle felpe sono stampate in serigrafia?",
        answer:
          "No, nessuna stampa industriale in serie: gli interventi sono eseguiti a mano con aerografo, pittura su tessuto, applicazioni in denim e cuciture artigianali.",
      },
    ],
    keywords: [
      "felpe personalizzate",
      "felpa fatta a mano",
      "felpa streetwear artigianale",
      "felpa oversize custom",
      "felpa ricamata",
      "felpa dipinta a mano",
      "custom distressed hoodie",
      "hand-painted sweatshirt",
    ],
  },
  {
    slug: "t-shirt",
    path: "t-shirt",
    title: "T-Shirt Dipinte a Mano – Magliette Streetwear Personalizzate",
    description:
      "T-shirt dipinte a mano e personalizzate con aerografo, cuciture a vista e dettagli tattoo clothing. Magliette streetwear artigianali 1/1, made in Italy.",
    h1: "T-Shirt Dipinte a Mano",
    productLabel: "T-shirt dipinta a mano",
    contentTitle: "Magliette streetwear personalizzate a mano, mai stampate in serie",
    content: [
      "Le t-shirt Jacopo Peca sono dipinte a mano con aerografo e pigmenti per tessuto, poi rifinite con cuciture a vista, intarsi e dettagli destroyed. Ogni maglietta personalizzata ha sfumature, passaggi di colore e segni impossibili da replicare industrialmente.",
      "Realizzate su cotone strutturato con soggetti ispirati al mondo del tatuaggio e della street art, sono t-shirt artigianali made in Italy pensate per chi cerca un pezzo autentico da collezione.",
    ],
    craftTags: [
      "Hand-Painted & Airbrushed Tee",
      "Zero Industrial Screenprint",
      "Tattoo Flash & Street Art",
      "100% Made in Italy",
    ],
    faqs: [
      {
        question: "Ogni t-shirt dipinta a mano è un pezzo unico?",
        answer:
          "Sì, essendo lavorata manualmente ad aerografo e pennello in laboratorio, anche quando un soggetto fa parte di una piccola capsule ogni maglietta presenta sfumature e dettagli unici.",
      },
    ],
    keywords: [
      "t-shirt dipinte a mano",
      "magliette personalizzate",
      "t-shirt streetwear artigianali",
      "t-shirt aerografo",
      "maglietta fatta a mano",
      "hand-painted streetwear tee",
      "custom airbrush t-shirt",
    ],
  },
  {
    slug: "camicia-jeans",
    path: "camicie-di-jeans",
    title: "Camicie di Jeans Personalizzate Fatte a Mano – Reworked Denim",
    description:
      "Camicie di jeans personalizzate a mano con toppe, schizzi di colore, ricami e cuciture a contrasto. Camicie denim uniche 1/1 dal laboratorio Jacopo Peca.",
    h1: "Camicie di Jeans Personalizzate",
    productLabel: "Camicia di jeans personalizzata",
    contentTitle: "Camicie in denim lavorate, dipinte e cucite a mano",
    content: [
      "Ogni camicia di jeans Jacopo Peca viene reinterpretata a mano in laboratorio con toppe in tessuto, ricami, schizzi di colore e cuciture a contrasto. Perfetta da indossare aperta sopra una t-shirt o come strato protagonista del tuo look streetwear.",
      "Pezzi unici 1/1 o micro-serie: se cerchi una camicia denim personalizzata sulla tua taglia puoi richiederla su misura tramite il servizio Denim Customize.",
    ],
    craftTags: [
      "Reworked Denim Shirt",
      "Patchwork & Paint Splatter",
      "Hand-Stitched Details",
      "Made in Italy",
    ],
    faqs: [
      {
        question: "Posso personalizzare una camicia di jeans con le mie iniziali o un disegno?",
        answer:
          "Sì, tramite la pagina Denim Customize puoi richiedere un ricamo a punto catenella o un intervento pittorico su misura.",
      },
    ],
    keywords: [
      "camicia di jeans personalizzata",
      "camicia denim fatta a mano",
      "camicia jeans custom",
      "reworked denim shirt",
      "hand-painted denim shirt",
    ],
  },
  {
    slug: "cap",
    path: "cappelli",
    title: "Cappelli Ricamati e Bucket Hat Custom Fatti a Mano",
    description:
      "Cappelli e bucket hat custom ricamati, dipinti o ricostruiti in denim a mano. Accessori streetwear artigianali firmati Jacopo Peca, made in Italy.",
    h1: "Cappelli Ricamati e Custom",
    productLabel: "Cappello custom fatto a mano",
    contentTitle: "Cappelli e bucket hat streetwear lavorati a mano in laboratorio",
    content: [
      "Cappelli con visiera e bucket hat lavorati singolarmente in laboratorio: ricami a macchina vintage, hand-painting, strappi e inserti in denim o bandana per completare il look con un accessorio one-of-one firmato Jacopo Peca.",
    ],
    craftTags: [
      "Custom Embroidered Cap",
      "Upcycled Denim & Bandana",
      "Hand-Finished in Atelier",
    ],
    faqs: [
      {
        question: "Che taglia hanno i cappelli custom?",
        answer:
          "La maggior parte dei cappelli è a taglia unica regolabile; eventuali misure specifiche sono indicate nella scheda del singolo pezzo.",
      },
    ],
    keywords: [
      "cappelli ricamati",
      "bucket hat custom",
      "cappello personalizzato",
      "cappello streetwear fatto a mano",
      "custom distressed cap",
    ],
  },
  {
    slug: "jackets",
    path: "giacche",
    title: "Giacche Custom Fatte a Mano – Reworked Streetwear 1/1",
    description:
      "Giacche custom streetwear con costruzione sartoriale su base denim e workwear, lavorate a mano nel laboratorio Jacopo Peca. Pezzi statement 1/1 made in Italy.",
    h1: "Giacche Custom Fatte a Mano",
    productLabel: "Giacca custom fatta a mano",
    contentTitle: "Giacche statement e workwear ricostruite a mano",
    content: [
      "Giacche dalla costruzione sartoriale e workwear lavorate a mano con ricami Cornely, hand-painting e applicazioni tessili: pezzi statement one-of-one pensati per essere riconoscibili al primo sguardo.",
    ],
    craftTags: [
      "1/1 Statement Jacket",
      "Deconstructed & Reworked",
      "Cornely & Airbrush",
    ],
    faqs: [],
    keywords: [
      "giacca custom",
      "giacca streetwear fatta a mano",
      "giacca personalizzata",
      "reworked workwear jacket",
      "bespoke streetwear jacket",
    ],
  },
  {
    slug: "denim-shorts",
    path: "shorts-di-jeans",
    title: "Shorts di Jeans Custom Fatti a Mano – Distressed Denim Shorts",
    description:
      "Shorts di jeans custom con orli sfilacciati a mano, patchwork e personalizzazioni grafiche. Bermuda in denim streetwear artigianali 1/1, made in Italy.",
    h1: "Shorts di Jeans Custom",
    productLabel: "Shorts di jeans custom",
    contentTitle: "Bermuda e shorts in denim personalizzati a mano",
    content: [
      "Tagli netti, orli sfilacciati a mano, rammendi e personalizzazioni pittoriche: shorts di jeans costruiti in laboratorio a partire da basi denim selezionate per uno streetwear estivo autentico e irripetibile.",
    ],
    craftTags: [
      "Raw Frayed Hem",
      "Hand-Distressed Denim Shorts",
      "1-of-1 Summer Streetwear",
    ],
    faqs: [],
    keywords: [
      "shorts di jeans personalizzati",
      "bermuda jeans custom",
      "pantaloncini jeans fatti a mano",
      "distressed denim shorts",
      "custom carpenter shorts",
    ],
  },
  {
    slug: "pantaloni",
    path: "pantaloni",
    title: "Pantaloni Custom Fatti a Mano – Reworked Streetwear",
    description:
      "Pantaloni custom streetwear con taglio e lavorazione handmade: cuciture a vista, patchwork e dettagli artigianali dal laboratorio Jacopo Peca di Montesilvano.",
    h1: "Pantaloni Custom Fatti a Mano",
    productLabel: "Pantaloni custom fatti a mano",
    contentTitle: "Pantaloni streetwear artigianali in pezzo unico",
    content: [
      "Pantaloni dal taglio deciso lavorati a mano con cuciture a vista, patch e dettagli destroyed, realizzati in pezzo unico o piccola serie nel laboratorio di Montesilvano (PE).",
    ],
    craftTags: [
      "Hand-Reworked Pants",
      "Patchwork & Exposed Seams",
      "Made in Italy",
    ],
    faqs: [],
    keywords: [
      "pantaloni personalizzati",
      "pantaloni streetwear fatti a mano",
      "pantaloni custom",
      "reworked cargo pants",
    ],
  },
  {
    slug: "maglie",
    path: "maglie",
    title: "Maglie Personalizzate Fatte a Mano – Custom Streetwear 1/1",
    description:
      "Maglie personalizzate, dipinte e lavorate a mano nel laboratorio Jacopo Peca: aerografo, ricami chainstitch, cuciture a vista e dettagli distressed. Pezzi unici 1/1 made in Italy.",
    h1: "Maglie Personalizzate Fatte a Mano",
    productLabel: "Maglia personalizzata fatta a mano",
    contentTitle: "Maglie streetwear lavorate, dipinte e cucite a mano in laboratorio",
    content: [
      "Le maglie Jacopo Peca nascono nel laboratorio di Montesilvano (PE) con interventi manuali ad aerografo, ricami a punto catenella Cornely, intarsi tessili e cuciture a vista che rendono ogni capo irripetibile.",
      "Nessuna produzione industriale in serie: ogni maglia è un pezzo unico 1/1 o una micro-tiratura artigianale made in Italy.",
    ],
    craftTags: [
      "1-of-1 Handcrafted Knit & Jersey",
      "Airbrush & Hand-Painted",
      "Cornely Chainstitch & Raw Seams",
      "Made in Montesilvano, Italy",
    ],
    faqs: [
      {
        question: "Come si lavano le maglie personalizzate a mano?",
        answer:
          "Consigliamo il lavaggio a mano in acqua fredda o in lavatrice a massimo 30°C con capo rovesciato, ciclo delicato e senza asciugatrice.",
      },
    ],
    keywords: [
      "maglie personalizzate",
      "maglie fatte a mano",
      "maglie streetwear artigianali",
      "maglia dipinta a mano",
      "maglia custom",
      "custom streetwear top",
    ],
  },
];

const bySlug = new Map(CATEGORY_SEO.map((entry) => [entry.slug, entry]));
const byPath = new Map(CATEGORY_SEO.map((entry) => [entry.path, entry]));

export function getCategorySeo(slug: string | undefined | null): CategorySeo | undefined {
  if (!slug) return undefined;
  return bySlug.get(slug);
}

/** Public URL segment for a category slug (falls back to the slug itself). */
export function categoryPathSegment(slug: string) {
  return bySlug.get(slug)?.path ?? slug;
}

/** Public, indexable URL of a category landing page. */
export function categoryHref(slug: string) {
  return `/shop/${categoryPathSegment(slug)}/`;
}

/** Resolve a public URL segment back to the internal category slug. */
export function categorySlugFromPath(path: string) {
  return byPath.get(path)?.slug ?? path;
}

/**
 * Rich, search-friendly alt text for product images.
 * In the legacy catalog `image.alt` is identical to `product.name` (e.g.
 * "SABBIONE"), which gives Google Images / Google Lens zero context on the
 * garment type or technique. When the stored alt is missing or equals the raw
 * product name, we build a descriptive alt using the category SEO label.
 */
export function buildProductImageAlt(
  product: { name: string; categorySlug?: string; categoryName: string },
  storedAlt?: string | null,
  viewLabel?: string,
) {
  const cleanStored = (storedAlt ?? "").trim();
  if (cleanStored && cleanStored.toLowerCase() !== product.name.trim().toLowerCase()) {
    return cleanStored;
  }

  const label =
    getCategorySeo(product.categorySlug)?.productLabel ??
    `${product.categoryName} fatto a mano`;
  const viewSuffix = viewLabel ? ` (${viewLabel})` : "";
  return `${product.name} – ${label}${viewSuffix} | Jacopo Peca`;
}
