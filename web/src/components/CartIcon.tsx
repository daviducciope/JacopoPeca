"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 text-sm uppercase tracking-widest text-white/70 transition hover:text-white"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      {totalItems > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
}
