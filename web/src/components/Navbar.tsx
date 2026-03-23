"use client";

import { useState } from "react";
import Link from "next/link";
import CartIcon from "./CartIcon";
import { contactInfo, socials, storeCategories } from "@/lib/editorial-data";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);

  return (
    <>
      {/* ── Topbar ── */}
      <div className="bg-[#e01010] py-1.5 text-[12px] tracking-[1.5px] uppercase font-medium text-center">
        <div className="mx-auto max-w-[1280px] px-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm opacity-90 hover:opacity-100 transition-opacity"
              >
                {s.name}
              </a>
            ))}
          </div>
          <span className="tracking-[2px] hidden sm:block">✦ CONSEGNA GRATUITA SOPRA €100 ✦</span>
          <a
            href={contactInfo.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-[12px]"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* ── Full-screen mobile menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-[#0a0a0a] z-[999] pt-[100px] px-[30px] pb-10 flex flex-col overflow-y-auto">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 right-6 bg-transparent text-[#f8f8f8] text-[28px] leading-none cursor-pointer border-none"
            aria-label="Chiudi menu"
          >
            ✕
          </button>

          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block py-3.5 text-[20px] font-semibold tracking-[2px] uppercase border-b border-[#2a2a2a] text-[#f8f8f8] hover:text-[#e01010] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="block py-3.5 text-[20px] font-semibold tracking-[2px] uppercase border-b border-[#2a2a2a] text-[#f8f8f8] hover:text-[#e01010] transition-colors"
            >
              Store
            </Link>
            <div className="flex flex-col pl-5">
              {storeCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop?cat=${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3.5 text-[14px] tracking-[1.2px] uppercase border-b border-white/5 text-[#888888] hover:text-[#f8f8f8] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="block py-3.5 text-[20px] font-semibold tracking-[2px] uppercase border-b border-[#2a2a2a] text-[#f8f8f8] hover:text-[#e01010] transition-colors"
            >
              About
            </Link>
            <Link
              href="/denim-customize"
              onClick={() => setMobileOpen(false)}
              className="block py-3.5 text-[20px] font-semibold tracking-[2px] uppercase border-b border-[#2a2a2a] text-[#f8f8f8] hover:text-[#e01010] transition-colors"
            >
              Customize
            </Link>
            <Link
              href="/contatti"
              onClick={() => setMobileOpen(false)}
              className="block py-3.5 text-[20px] font-semibold tracking-[2px] uppercase border-b border-[#2a2a2a] text-[#f8f8f8] hover:text-[#e01010] transition-colors"
            >
              Contatti
            </Link>
          </nav>
        </div>
      )}

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-[1000] bg-[#0a0a0a] border-b border-[#2a2a2a]">
        <div className="mx-auto max-w-[1280px] px-5 h-[72px] flex items-center justify-between gap-6">

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-[32px] tracking-[4px] text-[#f8f8f8] uppercase flex-shrink-0 leading-none"
          >
            JACOPO <span className="text-[#e01010]">PECA</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              href="/"
              className="block px-3 py-2 text-[12px] font-semibold tracking-[1.8px] uppercase text-[#cccccc] hover:text-[#f8f8f8] transition-colors rounded-sm"
            >
              Home
            </Link>

            {/* Store + dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setStoreOpen(true)}
              onMouseLeave={() => setStoreOpen(false)}
            >
              <Link
                href="/shop"
                className="block px-3 py-2 text-[12px] font-semibold tracking-[1.8px] uppercase text-[#cccccc] hover:text-[#f8f8f8] transition-colors rounded-sm"
              >
                Store
              </Link>
              {storeOpen && (
                <div
                  className="absolute top-[calc(100%+12px)] left-0 min-w-[200px] bg-[#161616] border border-[#2a2a2a] py-2 z-[100]"
                  style={{ borderTop: "2px solid #e01010" }}
                >
                  {storeCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop?cat=${cat.slug}`}
                      className="block px-5 py-2.5 text-[12px] tracking-[1.2px] uppercase text-[#888888] hover:text-[#f8f8f8] hover:bg-white/[0.04] hover:pl-[26px] transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="block px-3 py-2 text-[12px] font-semibold tracking-[1.8px] uppercase text-[#cccccc] hover:text-[#f8f8f8] transition-colors rounded-sm"
            >
              About
            </Link>

            <Link
              href="/denim-customize"
              className="block px-3.5 py-[7px] text-[12px] font-semibold tracking-[1.8px] uppercase text-[#d95f00] border border-[#d95f00] rounded-sm hover:bg-[#d95f00] hover:text-white transition-all"
            >
              Customize
            </Link>

            <Link
              href="/contatti"
              className="block px-3 py-2 text-[12px] font-semibold tracking-[1.8px] uppercase text-[#cccccc] hover:text-[#f8f8f8] transition-colors rounded-sm"
            >
              Contatti
            </Link>
          </nav>

          {/* Actions: cart + hamburger */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <CartIcon />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex flex-col gap-[5px] p-1 bg-transparent border-none cursor-pointer"
              aria-label="Menu"
            >
              <span
                className={`block w-6 bg-[#f8f8f8] transition-all duration-300 ${
                  mobileOpen ? "translate-y-[7px] rotate-45 h-px" : "h-px"
                }`}
                style={{ height: "2px" }}
              />
              <span
                className={`block w-6 bg-[#f8f8f8] transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : ""
                }`}
                style={{ height: "2px" }}
              />
              <span
                className={`block w-6 bg-[#f8f8f8] transition-all duration-300 ${
                  mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
                style={{ height: "2px" }}
              />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
