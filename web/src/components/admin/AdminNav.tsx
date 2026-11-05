"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AdminNav({
  onNewProductClick,
}: {
  onNewProductClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === "/admin" || pathname === "/admin/";
  const isProducts = pathname.startsWith("/admin/products");
  const isOrders = pathname.startsWith("/admin/orders");

  async function handleLogout() {
    await fetch("/api/admin/auth/logout/", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="border-b border-white/10 bg-[#121212] print:hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="mr-2 border border-[#e01010]/40 bg-[#e01010]/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff5252]">
            Admin Panel
          </span>
          <Link
            href="/admin"
            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
              isDashboard
                ? "bg-white text-black"
                : "border border-white/15 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            📊 Riepilogo
          </Link>
          <Link
            href="/admin/products"
            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
              isProducts
                ? "bg-white text-black"
                : "border border-white/15 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            👕 Catalogo Prodotti
          </Link>
          <Link
            href="/admin/orders"
            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
              isOrders
                ? "bg-white text-black"
                : "border border-white/15 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            📦 Ordini & Spedizioni
          </Link>
          <Link href="/admin/email" className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${pathname.startsWith("/admin/email") ? "bg-white text-black" : "border border-white/15 bg-white/5 text-white/75"}`}>Email & Newsletter</Link>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNewProductClick ? (
            <button
              type="button"
              onClick={onNewProductClick}
              className="cursor-pointer border-2 border-[#e01010] bg-[#e01010] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b80d0d]"
            >
              + Carica Nuovo Prodotto
            </button>
          ) : (
            <Link
              href="/admin/products?new=1"
              className="border-2 border-[#e01010] bg-[#e01010] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b80d0d]"
            >
              + Carica Nuovo Prodotto
            </Link>
          )}
          <Link
            href="/shop"
            target="_blank"
            className="border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Vedi Negozio ↗
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer border border-white/15 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45 transition hover:border-white/30 hover:text-white"
            title="Esci dal pannello admin"
          >
            Esci
          </button>
        </div>
      </div>
    </div>
  );
}
