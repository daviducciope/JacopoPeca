"use client";

import Link from "next/link";
import { contactInfo, socials, storeCategories } from "@/lib/editorial-data";

const infoLinks = [
  { label: "Chi siamo", href: "/about" },
  { label: "Denim Customize", href: "/denim-customize" },
  { label: "Contatti", href: "/contatti" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Termini e Condizioni", href: "/termini-e-condizioni" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#0d0d0d] border-t border-[#2a2a2a]" style={{ paddingTop: "64px" }}>
      {/* ── 4-column grid ── */}
      <div className="mx-auto max-w-[1280px] px-5 pb-14 grid grid-cols-1 gap-9 md:grid-cols-2 md:gap-10 lg:grid-cols-[2fr_1fr_1fr_1.5fr] lg:gap-12">
        {/* Col 1 — Brand */}
        <div>
          <Link
            href="/"
            className="font-display text-[28px] tracking-[4px] text-[#f8f8f8] uppercase leading-none block mb-4"
          >
            JACOPO <span className="text-[#e01010]">PECA</span>
          </Link>
          <p className="text-[13px] text-[#888888] leading-[1.7] max-w-[280px] mb-6">
            Jacopo Peca crea capi denim artigianali unici, fatti a mano nel
            laboratorio di Montesilvano.
          </p>
          <div className="flex gap-2.5">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[38px] h-[38px] border border-[#2a2a2a] flex items-center justify-center text-[11px] font-semibold tracking-wide text-[#888888] hover:border-[#e01010] hover:text-[#e01010] hover:bg-[rgba(224,16,16,0.07)] transition-all rounded-sm"
                title={s.name}
              >
                {s.name.slice(0, 2).toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Shop */}
        <div>
          <h4 className="text-[11px] font-bold tracking-[3px] uppercase text-[#f8f8f8] mb-5">
            Shop
          </h4>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link
                href="/shop"
                className="text-[13px] text-[#888888] hover:text-[#f8f8f8] transition-colors tracking-[0.3px]"
              >
                Tutte le categorie
              </Link>
            </li>
            {storeCategories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/shop?cat=${cat.slug}`}
                  className="text-[13px] text-[#888888] hover:text-[#f8f8f8] transition-colors tracking-[0.3px]"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Info */}
        <div>
          <h4 className="text-[11px] font-bold tracking-[3px] uppercase text-[#f8f8f8] mb-5">
            Info
          </h4>
          <ul className="flex flex-col gap-2.5">
            {infoLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[13px] text-[#888888] hover:text-[#f8f8f8] transition-colors tracking-[0.3px]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Contacts */}
        <div>
          <h4 className="text-[11px] font-bold tracking-[3px] uppercase text-[#f8f8f8] mb-5">
            Contatti
          </h4>

          {/* Address */}
          <div className="flex items-start gap-3 mb-3.5">
            <svg
              className="text-[#e01010] flex-shrink-0 mt-0.5"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="text-[13px] text-[#888888] leading-[1.5]">
              {contactInfo.address}
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 mb-3.5">
            <svg
              className="text-[#e01010] flex-shrink-0 mt-0.5"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            <a
              href={contactInfo.phoneHref}
              className="text-[13px] text-[#888888] hover:text-[#f8f8f8] transition-colors leading-[1.5]"
            >
              {contactInfo.phoneDisplay}
            </a>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <svg
              className="text-[#e01010] flex-shrink-0 mt-0.5"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <a
              href={`mailto:${contactInfo.email}`}
              className="text-[13px] text-[#888888] hover:text-[#f8f8f8] transition-colors leading-[1.5]"
            >
              {contactInfo.email}
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[#2a2a2a] py-5 text-center text-[12px] text-[#888888] tracking-[0.5px]">
        <div className="mx-auto max-w-[1280px] px-5">
          &copy; {new Date().getFullYear()} Jacopo Peca. Tutti i diritti riservati. &mdash;{" "}
          <Link href="/privacy-policy" className="text-[#e01010] hover:opacity-80 transition-opacity">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
