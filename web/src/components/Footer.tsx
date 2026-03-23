"use client";

import Link from "next/link";
import { contactInfo, socials } from "@/lib/editorial-data";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Denim Customize", href: "/denim-customize" },
  { label: "Contatti", href: "/contatti" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Termini e Condizioni", href: "/termini-e-condizioni" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5">
      {/* Newsletter + social */}
      <div className="bg-[#111]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 lg:px-10">
          {/* Newsletter */}
          <div>
            <h3 className="font-display text-4xl text-white md:text-5xl">
              Vuoi ricevere una dose di ispirazione denim?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Iscriviti alla nostra newsletter per non perderti le ultime creazioni.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6 flex gap-2"
            >
              <input
                type="email"
                placeholder="La tua email"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wider text-black transition hover:bg-white/90"
              >
                Iscriviti
              </button>
            </form>
          </div>

          {/* Social / follow */}
          <div className="flex flex-col justify-center md:items-end">
            <p className="text-sm uppercase tracking-widest text-white/40">
              Non perderti le nostre ultime creazioni
            </p>
            <p className="mt-1 text-sm text-white/40">Seguici su:</p>
            <div className="mt-4 flex gap-4">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-[#0d0d0d]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30">Email</p>
            <a href={`mailto:${contactInfo.email}`} className="mt-1 block text-sm text-white/70 hover:text-white">
              {contactInfo.email}
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30">Telefono</p>
            <a href={contactInfo.phoneHref} className="mt-1 block text-sm text-white/70 hover:text-white">
              {contactInfo.phoneDisplay}
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30">Indirizzo</p>
            <p className="mt-1 text-sm text-white/70">
              {contactInfo.address}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#080808]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row lg:px-10">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} jacopopeca.com
          </p>
          <div className="flex gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/30 transition hover:text-white/60"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
