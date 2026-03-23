"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center text-[#f8f8f8] hover:text-[#e01010] transition-colors"
      aria-label="Carrello"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {totalItems > 0 && (
        <span
          className="absolute flex items-center justify-center rounded-full bg-[#e01010] text-white font-bold"
          style={{
            fontSize: "10px",
            width: "18px",
            height: "18px",
            top: "-10px",
            right: "-4px",
          }}
        >
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
}
