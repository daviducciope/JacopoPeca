import type { Metadata } from "next";

import { contactInfo } from "@/lib/editorial-data";

export const metadata: Metadata = {
  title: "Privacy Policy - Jacopo Peca",
  description: "Informativa privacy per il sito Jacopo Peca.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16 text-white lg:px-10">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/35">Legal</p>
        <h1 className="mt-3 font-display text-5xl">Privacy Policy</h1>
      </div>
      <section className="space-y-6 text-sm leading-8 text-white/65">
        <p>
          Questa pagina descrive in forma sintetica il trattamento dei dati personali raccolti attraverso il sito Jacopo Peca,
          incluse richieste inviate tramite email, telefono, WhatsApp o moduli eventualmente presenti nelle pagine.
        </p>
        <p>
          I dati vengono usati esclusivamente per rispondere a richieste commerciali, gestire ordini, assistenza e comunicazioni relative ai servizi richiesti.
        </p>
        <p>
          Per richieste su dati personali, rettifica o cancellazione puoi scrivere a {contactInfo.email}.
        </p>
      </section>
    </main>
  );
}