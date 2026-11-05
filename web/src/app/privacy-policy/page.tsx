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
          I dati vengono usati per rispondere alle richieste, gestire ordini, pagamenti, spedizioni e assistenza. I pagamenti sono elaborati da Stripe; le comunicazioni email sono inviate tramite Twilio SendGrid.
        </p>
        <h2 className="font-display text-2xl text-white">Newsletter e comunicazioni promozionali</h2>
        <p>L’iscrizione alla newsletter è facoltativa, separata dall’acquisto e mai preselezionata. Richiediamo la conferma tramite email prima di inviare contenuti promozionali. Registriamo indirizzo email, provenienza e data della richiesta, versione del consenso, conferma ed eventuale revoca.</p>
        <p>Gli iscritti ricevono selezioni di prodotti disponibili, novità dal laboratorio, suggerimenti sulla cura del denim e, se hanno lasciato un checkout incompleto, un promemoria. Le selezioni editoriali sono previste il primo e il quindicesimo giorno del mese; distanziamo le email promozionali di almeno sette giorni. Ogni email promozionale contiene il collegamento di disiscrizione. La revoca interrompe gli invii promozionali in coda e non impedisce le comunicazioni necessarie per gli ordini.</p>
        <p>Non iscriviamo automaticamente i clienti precedenti. Il carrello è salvato nel browser; i dati di checkout sono verificati sul server. Per richieste sul consenso e sulla conservazione dei dati puoi usare il contatto indicato qui sotto.</p>
        <p>
          Per richieste su dati personali, rettifica o cancellazione puoi scrivere a {contactInfo.email}.
        </p>
      </section>
    </main>
  );
}