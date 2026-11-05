"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import CartIcon from "./CartIcon";
import { contactInfo, socials, storeCategories } from "@/lib/editorial-data";
import { categoryHref } from "@/lib/category-seo";

const shopCategories = storeCategories;

const desktopLinks = [
  { href: "/about", label: "About" },
  { href: "/denim-customize", label: "Customize" },
  { href: "/contatti", label: "Contatti" },
];

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function isCurrent(pathname: string, href: string) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return current === target || current.startsWith(`${target}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const mobileOpen = openOnPath === pathname;

  function openMenu() {
    setOpenOnPath(pathname);
  }

  function closeMenu() {
    setOpenOnPath(null);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenOnPath(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="bg-[#e01010] text-white">
        <div className="relative mx-auto flex h-9 max-w-[1280px] items-center justify-between px-4 sm:px-5">
          <div className="hidden items-center gap-4 lg:flex">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 transition hover:text-white"
              >
                {social.name}
              </a>
            ))}
          </div>
          <p className="pointer-events-none absolute inset-x-14 truncate text-center text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.2em]">
            Consegna gratuita sopra €100
          </p>
          <a
            href={contactInfo.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-white lg:inline"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-[1000] border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-5">
          <Link
            href="/"
            className="font-display text-[28px] leading-none tracking-[2px] text-white uppercase sm:text-[34px] sm:tracking-[3px]"
          >
            Jacopo <span className="text-[#e01010]">Peca</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principale">
            <div className="group relative">
              <Link
                href="/shop"
                aria-current={isCurrent(pathname, "/shop") ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold tracking-[0.16em] uppercase transition ${
                  isCurrent(pathname, "/shop") ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                Store
                <span className="text-[9px] text-white/50 transition group-hover:text-white" aria-hidden="true">
                  ▾
                </span>
              </Link>
              <div className="pointer-events-none absolute top-full left-0 z-50 w-56 pt-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                <div className="border border-white/10 border-t-2 border-t-[#e01010] bg-[#121212] py-2 shadow-2xl">
                  <Link
                    href="/shop"
                    className="block px-4 py-2.5 text-[12px] font-semibold tracking-[0.14em] text-white uppercase transition hover:bg-white/5"
                  >
                    Tutti i pezzi
                  </Link>
                  {shopCategories.map((category) => (
                    <Link
                      key={category.slug}
                      href={categoryHref(category.slug)}
                      className="block px-4 py-2.5 text-[12px] tracking-[0.12em] text-white/65 uppercase transition hover:bg-white/5 hover:text-white"
                    >
                      {category.name}
                    </Link>
                  ))}
                  <Link
                    href="/denim-customize"
                    className="mt-1 block border-t border-white/10 px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] text-[#e01010] uppercase transition hover:bg-white/5 hover:text-white"
                  >
                    Customizza un capo
                  </Link>
                </div>
              </div>
            </div>

            {desktopLinks.map((link) => {
              const active = isCurrent(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-2 text-[12px] font-semibold tracking-[0.16em] uppercase transition ${
                    link.href === "/denim-customize"
                      ? active
                        ? "text-[#e01010]"
                        : "text-[#e01010]/80 hover:text-[#e01010]"
                      : active
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <div className="p-2">
              <CartIcon />
            </div>
            <button
              type="button"
              onClick={openMenu}
              className="inline-flex h-11 w-11 items-center justify-center lg:hidden"
              aria-label="Apri menu"
              aria-expanded={mobileOpen}
            >
              <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
                <span className="h-0.5 w-full bg-white" />
                <span className="h-0.5 w-full bg-white" />
                <span className="h-0.5 w-4 bg-white" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[1100] flex flex-col bg-[#0a0a0a] text-white lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Link href="/" className="font-display text-[28px] leading-none tracking-[2px] uppercase" onClick={closeMenu}>
              Jacopo <span className="text-[#e01010]">Peca</span>
            </Link>
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex h-11 w-11 items-center justify-center text-2xl"
              aria-label="Chiudi menu"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <nav className="flex flex-col" aria-label="Mobile">
              {[
                { href: "/", label: "Home" },
                { href: "/shop", label: "Store" },
                { href: "/about", label: "About" },
                { href: "/denim-customize", label: "Customize" },
                { href: "/contatti", label: "Contatti" },
              ].map((link) => {
                const active = isCurrent(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                    className={`border-b border-white/10 py-4 text-2xl font-semibold tracking-[0.08em] uppercase ${
                      active ? "text-[#e01010]" : "text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <p className="mt-8 text-[11px] font-semibold tracking-[0.2em] text-white/45 uppercase">Categorie</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {shopCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={categoryHref(category.slug)}
                  onClick={closeMenu}
                  className="border border-white/12 px-3 py-3 text-xs font-semibold tracking-[0.12em] text-white/80 uppercase"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-white/10 px-5 py-4">
            <Link href="/cart" onClick={closeMenu} className="inline-flex min-h-12 items-center justify-center border border-white/20 text-xs font-bold tracking-[0.16em] uppercase">
              Carrello
            </Link>
            <a
              href={contactInfo.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="home-primary inline-flex min-h-12 items-center justify-center text-xs font-bold tracking-[0.16em] uppercase"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
