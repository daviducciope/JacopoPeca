import type { Metadata } from "next";
import localFont from "next/font/local";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteUrl, siteName } from "@/lib/seo";
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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: siteName,
  title: {
    default: "Jacopo Peca - Handcrafted Denim Streetwear",
    template: `%s - ${siteName}`,
  },
  description: "Tutti i nostri capi sono fatti a mano nel mio store. Denim streetwear unici, made in Italy.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName,
    title: "Jacopo Peca - Handcrafted Denim Streetwear",
    description: "Denim streetwear handmade, pezzi unici e limited edition made in Italy.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jacopo Peca - Handcrafted Denim Streetwear",
    description: "Denim streetwear handmade, pezzi unici e limited edition made in Italy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`h-full antialiased ${poppins.variable} ${roadRage.variable}`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
