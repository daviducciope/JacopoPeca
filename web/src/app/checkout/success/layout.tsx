import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conferma Ordine",
  description: "Conferma del pagamento e riepilogo dell'ordine sullo store Jacopo Peca.",
  alternates: { canonical: "/checkout/success" },
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
