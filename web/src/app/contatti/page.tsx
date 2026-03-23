import type { Metadata } from "next";
import Image from "next/image";

import { contactInfo, socials } from "@/lib/editorial-data";

export const metadata: Metadata = {
  title: "Contatti - Jacopo Peca",
  description:
    "Contatti ufficiali Jacopo Peca: email, telefono, WhatsApp, social e laboratorio a Montesilvano.",
};

export default function ContattiPage() {
  return (
    <main className="flex flex-1 flex-col bg-black text-white">
      <section className="border-b border-white/8">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-white/40">Contatti</p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl">Parliamone in modo diretto.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/65">
              Per informazioni su ordini, richieste custom, disponibilita, collaborazioni o assistenza post-vendita,
              questi sono i riferimenti attivi del progetto Jacopo Peca.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <ContactCard label="Email" value={contactInfo.email} href={`mailto:${contactInfo.email}`} />
              <ContactCard label="Telefono" value={contactInfo.phoneDisplay} href={contactInfo.phoneHref} />
              <ContactCard label="WhatsApp" value={contactInfo.whatsappLabel} href={contactInfo.whatsappHref} />
              <ContactCard label="Laboratorio" value={contactInfo.address} />
            </div>
          </div>
          <div className="relative min-h-[28rem] overflow-hidden border border-white/8 bg-[#111]">
            <Image
              src="/wp-content/uploads/2024/07/Image-Contact.webp"
              alt="Immagine contatti Jacopo Peca"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.55))]" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="border border-white/8 bg-[#111] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/35">Social</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Canali attivi</h2>
          <div className="mt-6 grid gap-3">
            {socials.map((social) => (
              <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between border border-white/8 px-4 py-4 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">
                <span>{social.name}</span>
                <span className="text-white/35">Apri</span>
              </a>
            ))}
          </div>
        </div>

        <div className="border border-white/8 bg-[#111] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/35">Informazioni utili</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Cosa scrivere nel primo messaggio</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
            <li>Nome del prodotto o slug se stai chiedendo disponibilita su un capo esistente.</li>
            <li>Taglia, misure o fit desiderato se vuoi assistenza prima dell'acquisto.</li>
            <li>Idea, foto di riferimento e base del capo se la richiesta e per una customizzazione.</li>
            <li>Tempistiche richieste se il pezzo serve per shooting, evento o drop specifico.</li>
          </ul>
          <div className="mt-8 border border-white/8 bg-black/40 p-4 text-sm leading-7 text-white/55">
            <p>Email secondaria storica del progetto: {contactInfo.emailSecondary}</p>
            <p className="mt-2">Citta operativa: {contactInfo.city}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="border border-white/8 bg-[#111] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</p>
      <p className="mt-3 text-sm leading-7 text-white">{value}</p>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
      {content}
    </a>
  );
}