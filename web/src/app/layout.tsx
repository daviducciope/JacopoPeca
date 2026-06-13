import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteUrl, siteName } from "@/lib/seo";
import "./globals.css";

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
    <html lang="it" className="h-full antialiased">
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
