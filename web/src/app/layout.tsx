import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { CartProvider } from "@/lib/cart";
import { CookieConsentProvider } from "@/lib/cookie-consent";
import CookieBanner from "@/components/CookieBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  brandDescription,
  defaultOgImage,
  getSiteUrl,
  organizationJsonLd,
  siteName,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-300.woff2", weight: "300" },
    { path: "./fonts/poppins-400.woff2", weight: "400" },
    { path: "./fonts/poppins-500.woff2", weight: "500" },
    { path: "./fonts/poppins-600.woff2", weight: "600" },
    { path: "./fonts/poppins-700.woff2", weight: "700" },
  ],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});
const roadRage = localFont({
  src: "./fonts/road-rage-400.woff2",
  variable: "--font-road-rage",
  display: "swap",
});

// NOTE: no `alternates.canonical` here on purpose. A canonical set in the root
// layout is inherited by every page that does not override it, which would
// point all those pages to the home page. Each page declares its own canonical.
export const viewport: Viewport = {
  themeColor: "#0d0d0d",
};

// Verifiche proprietà dei motori di ricerca (opzionali, via env):
// Google Search Console, Bing Webmaster Tools, Yandex.
const searchEngineVerification: NonNullable<Metadata["verification"]> = {};
if (process.env.NEXT_PUBLIC_GSC_VERIFICATION) {
  searchEngineVerification.google = process.env.NEXT_PUBLIC_GSC_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_YANDEX_VERIFICATION) {
  searchEngineVerification.yandex = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_BING_VERIFICATION) {
  searchEngineVerification.other = { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION };
}

export const metadata: Metadata = {
  verification: searchEngineVerification,
  // Favicon: /favicon.ico (16-64px) per tutti i motori, icon.png 512px e apple-icon.png in src/app.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  metadataBase: new URL(getSiteUrl()),
  applicationName: siteName,
  title: {
    default: "Jacopo Peca – Jeans e Giacche di Jeans Personalizzate Fatte a Mano",
    template: `%s | ${siteName}`,
  },
  description: brandDescription,
  authors: [{ name: "Jacopo Peca", url: getSiteUrl() }],
  creator: "Jacopo Peca",
  publisher: "Jacopo Peca",
  category: "fashion",
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName,
    title: "Jacopo Peca – Denim Personalizzato e Streetwear Fatto a Mano",
    description: brandDescription,
    images: [
      {
        url: defaultOgImage,
        alt: "Jacopo Peca al lavoro nel laboratorio di denim personalizzato a Montesilvano",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jacopo Peca – Denim Personalizzato e Streetwear Fatto a Mano",
    description: brandDescription,
    images: [defaultOgImage],
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [organizationJsonLd(), websiteJsonLd()],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`h-full antialiased ${poppins.variable} ${roadRage.variable}`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <CookieConsentProvider>
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
            <CookieBanner />
            <GoogleAnalytics />
          </CartProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
