"use client";

import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { useCookieConsent } from "@/lib/cookie-consent";
import { contactInfo, socials, storeCategories } from "@/lib/editorial-data";
import { categoryHref } from "@/lib/category-seo";

const infoLinks = [
  { label: "Chi siamo", href: "/about" },
  { label: "Denim Customize", href: "/denim-customize" },
  { label: "Contatti", href: "/contatti" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Termini e Condizioni", href: "/termini-e-condizioni" },
];

export default function Footer() {
  const { openPreferences } = useCookieConsent();
  const vatNumber = process.env.NEXT_PUBLIC_VAT_NUMBER;
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
          <p className="text-[13.5px] text-white/75 leading-[1.75] max-w-[290px] mb-6">
            <strong className="font-semibold text-white">Jacopo Peca</strong> crea capi{" "}
            <em className="italic text-white/95">denim artigianali unici</em>,{" "}
            <strong className="font-semibold text-white">100% fatti a mano</strong> nel laboratorio di
            Montesilvano.
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
                  href={categoryHref(cat.slug)}
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
            <li>
              <button
                type="button"
                onClick={openPreferences}
                className="text-left text-[13px] text-[#888888] hover:text-[#f8f8f8] transition-colors tracking-[0.3px]"
              >
                Preferenze Cookie
              </button>
            </li>
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

      <NewsletterForm />

      {/* ── Partner & Credits Showcase + Bottom Bar ── */}
      <div className="border-t border-[#2a2a2a] bg-[#090909]/90 py-7 text-[12px] text-[#888888] tracking-[0.5px]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5">
          {/* Partner & Agency Badges */}
          <div className="flex flex-col items-center justify-between gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:flex-wrap">
            {/* Badge 1: We are on sircompare.com */}
            <a
              href="https://sircompare.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="We are on sircompare.com"
              className="group relative flex w-full items-center gap-3.5 rounded-md border border-white/10 bg-gradient-to-r from-[#111822]/90 via-[#121212] to-[#141414] px-4 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/45 hover:shadow-[0_8px_28px_-6px_rgba(56,189,248,0.22)] sm:w-auto"
            >
              <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#0b192c] p-0.5 ring-1 ring-sky-400/30 transition-all duration-300 group-hover:scale-105 group-hover:ring-sky-400/70 group-hover:shadow-[0_0_16px_rgba(56,189,248,0.35)]">
                <img
                  src="/images/partners/sir-compare-logo.webp"
                  alt="Sir Compare logo"
                  width={44}
                  height={44}
                  loading="lazy"
                  className="h-full w-full rounded-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[2.4px] text-sky-300/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  We are on
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[14px] font-semibold tracking-[0.4px] text-[#f8f8f8] transition-colors group-hover:text-sky-300">
                  sircompare.com
                  <svg
                    className="h-3.5 w-3.5 text-white/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </a>

            {/* Badge 2: Powered by Stà Comunicazione & Design */}
            <a
              href="https://stacomunicazionedesign.it/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Powered by Stà Comunicazione e Design"
              className="group relative flex w-full items-center gap-4 rounded-md border border-white/10 bg-gradient-to-r from-[#141414] via-[#121212] to-[#0f1922]/85 px-4 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#009fe3]/45 hover:shadow-[0_8px_28px_-6px_rgba(0,159,227,0.22)] sm:w-auto"
            >
              <div className="flex h-11 flex-shrink-0 items-center justify-center rounded bg-white/[0.03] px-2.5 py-1.5 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-white/[0.06] group-hover:ring-[#009fe3]/50">
                <img
                  src="/images/partners/sta-bianco.png"
                  alt="Stà Comunicazione & Design logo"
                  width={56}
                  height={40}
                  loading="lazy"
                  className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_10px_rgba(0,159,227,0.4)]"
                />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9.5px] font-semibold uppercase tracking-[2.4px] text-white/50">
                  Powered by
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[13.5px] font-semibold tracking-[0.3px] text-[#f8f8f8] transition-colors group-hover:text-[#38bdf8]">
                  Stà Comunicazione &amp; Design
                  <svg
                    className="h-3.5 w-3.5 text-white/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#38bdf8]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </a>
          </div>

          {/* Copyright & Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center">
            <span>
              &copy; {new Date().getFullYear()} Jacopo Peca · {contactInfo.address}
              {vatNumber ? ` · P.IVA ${vatNumber}` : ""}
            </span>
            <span aria-hidden="true">&middot;</span>
            <Link href="/privacy-policy" className="text-[#e01010] hover:opacity-80 transition-opacity">
              Privacy Policy
            </Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/cookie-policy" className="text-[#e01010] hover:opacity-80 transition-opacity">
              Cookie Policy
            </Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/termini-e-condizioni" className="text-[#e01010] hover:opacity-80 transition-opacity">
              Termini e Condizioni
            </Link>
            <span aria-hidden="true">&middot;</span>
            <button
              type="button"
              onClick={openPreferences}
              className="text-[#888888] underline underline-offset-4 hover:text-[#f8f8f8] transition-colors"
            >
              Preferenze Cookie
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
