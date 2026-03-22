import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jacopo Peca — Handcrafted Denim Streetwear",
  description: "Tutti i nostri capi sono fatti a mano nel mio store. Denim streetwear unici, made in Italy.",
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
