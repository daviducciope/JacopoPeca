import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrello",
  description: "Riepilogo del tuo carrello sullo store ufficiale Jacopo Peca.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
