"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CartIcon from "./CartIcon";
import { contactInfo, socials, storeCategories } from "@/lib/editorial-data";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <div className="bg-black border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/50 transition hover:text-white"
              >
                {s.name}
              </a>
            ))}
          </div>
          <a
            href={contactInfo.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/50 transition hover:text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/wp-content/uploads/2023/09/logo-jp.png"
              alt="Jacopo Peca"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 text-sm uppercase tracking-widest text-white/70 lg:flex">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setStoreOpen(true)}
              onMouseLeave={() => setStoreOpen(false)}
            >
              <Link href="/shop" className="transition hover:text-white">
                Store
              </Link>
              {storeOpen && (
                <div className="absolute left-0 top-full pt-2">
                  <div className="min-w-50 rounded-lg border border-white/10 bg-[#111] p-2 shadow-2xl">
                    {storeCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?cat=${cat.slug}`}
                        className="block rounded-md px-3 py-2 text-xs uppercase tracking-widest text-white/60 transition hover:bg-white/5 hover:text-white"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>
            <Link href="/denim-customize" className="transition hover:text-white">
              Customize
            </Link>
            <Link href="/contatti" className="transition hover:text-white">
              Contatti
            </Link>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <CartIcon />
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 lg:hidden"
              aria-label="Menu"
            >
              <span className={`block h-0.5 w-6 bg-white transition-all ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-all ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/5 bg-black px-4 py-6 lg:hidden">
            <nav className="flex flex-col gap-4 text-sm uppercase tracking-widest">
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-white">Home</Link>
              <Link href="/shop" onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-white">Store</Link>
              {storeCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop?cat=${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="pl-4 text-xs text-white/40 hover:text-white"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/about" onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-white">About</Link>
              <Link href="/denim-customize" onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-white">Customize</Link>
              <Link href="/contatti" onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-white">Contatti</Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
