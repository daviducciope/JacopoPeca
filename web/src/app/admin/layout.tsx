import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard Admin",
    template: "%s | Admin Jacopo Peca",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
