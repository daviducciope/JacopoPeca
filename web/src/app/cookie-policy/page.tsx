import type { Metadata } from "next";
import Link from "next/link";

import CookiePreferencesTrigger from "@/components/CookiePreferencesTrigger";
import { contactInfo } from "@/lib/editorial-data";

export const metadata: Metadata = {
  title: "Cookie Policy – Informativa Cookie e Tecnologie di Archiviazione",
  description:
    "Informativa estesa sull'uso di cookie tecnici, localStorage e contenuti di terze parti (Google Maps, Stripe) sul sito ufficiale Jacopo Peca, ai sensi delle Linee Guida del Garante Privacy.",
  alternates: {
    canonical: "/cookie-policy",
  },
};

const storageItems = [
  {
    name: "jp-cart",
    type: "localStorage (Prima parte – Tecnico)",
    provider: "jacopopeca.com",
    purpose:
      "Conserva nel browser gli articoli e le taglie aggiunte al carrello dell'utente per permettere il completamento dell'ordine.",
    duration: "Persistente finché l'utente non svuota il carrello o completa l'acquisto",
    consent: "Esente (strettamente necessario ex art. 122 D.Lgs. 196/2003)",
  },
  {
    name: "jp-cookie-consent-v1",
    type: "localStorage (Prima parte – Tecnico)",
    provider: "jacopopeca.com",
    purpose:
      "Memorizza la scelta espressa dall'utente sul banner cookie (accettazione o rifiuto dei contenuti esterni di terze parti).",
    duration: "Persistente (fino a cancellazione dati browser o modifica scelta)",
    consent: "Esente (strettamente necessario)",
  },
  {
    name: "jp_admin_session",
    type: "Cookie HTTPOnly (Prima parte – Tecnico)",
    provider: "jacopopeca.com",
    purpose:
      "Cookie di autenticazione riservato esclusivamente all'accesso dell'amministratore nel pannello gestionale (/admin). Non viene mai installato per i visitatori e i clienti dello store.",
    duration: "Sessione / 12 ore",
    consent: "Esente (strettamente necessario)",
  },
  {
    name: "Stripe Checkout (__stripe_mid, __stripe_sid)",
    type: "Cookie Tecnici / Antrode (Terza parte su checkout)",
    provider: "Stripe Payments Europe, Ltd.",
    purpose:
      "Attivati esclusivamente quando il cliente avvia il pagamento sicuro per prevenire le frodi ed elaborare la transazione.",
    duration: "Da 30 minuti (sid) a 1 anno (mid)",
    consent: "Strettamente necessario all'esecuzione del pagamento richiesto",
  },
  {
    name: "Google Maps Embed (NID, CONSENT / parametri embed)",
    type: "Contenuto esterno di Terza Parte",
    provider: "Google Ireland Limited",
    purpose:
      "Visualizzazione della mappa interattiva del laboratorio nella pagina Contatti. Bloccato preventivamente finché l'utente non presta consenso esplicito.",
    duration: "Fino a 6 mesi (secondo policy di Google)",
    consent: "Richiede consenso preventivo (Contenuti Esterni)",
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16 text-white lg:px-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">
          Legal · Garante Privacy &amp; GDPR
        </p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">
          Cookie Policy
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/55">
          Ultimo aggiornamento: Novembre 2026
        </p>
      </div>

      <CookiePreferencesTrigger />

      <section className="space-y-6 text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
        <h2 className="font-display text-3xl text-white">
          1. Cosa sono i cookie e gli strumenti di archiviazione locale
        </h2>
        <p>
          I <strong className="font-semibold text-white">cookie</strong> sono piccoli file di testo che i siti visitati inviano al browser dell&apos;utente, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva. Agli stessi principi normativi (art. 122 del D.Lgs. 196/2003 – Codice Privacy, Direttiva 2002/58/CE e{" "}
          <strong className="font-semibold text-white">
            Linee Guida del Garante per la Protezione dei Dati Personali del 10 giugno 2021
          </strong>
          ) sono soggetti anche gli altri strumenti di archiviazione locale del browser, come il{" "}
          <code className="border border-white/15 bg-white/5 px-1.5 py-0.5 text-xs text-white">
            localStorage
          </code>
          .
        </p>

        <h2 className="font-display text-3xl text-white">
          2. Quali tecnologie utilizza jacopopeca.com
        </h2>
        <p>
          Il sito <strong className="font-semibold text-white">jacopopeca.com</strong> è stato progettato secondo il principio di{" "}
          <em className="italic text-white">privacy by design e data minimization</em>:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-white">Nessun cookie di profilazione o marketing proprietario:</strong> non utilizziamo pixel pubblicitari, tracker comportamentali o sistemi di remarketing.
          </li>
          <li>
            <strong className="font-semibold text-white">Font ospitati localmente:</strong> i caratteri tipografici del sito sono serviti direttamente dal nostro dominio senza effettuare chiamate a server esterni (come Google Fonts).
          </li>
          <li>
            <strong className="font-semibold text-white">Strumenti tecnici strettamente necessari:</strong> usiamo il <code className="border border-white/15 bg-white/5 px-1.5 py-0.5 text-xs text-white">localStorage</code> del browser unicamente per mantenere i capi inseriti nel carrello (<code className="text-xs text-white">jp-cart</code>) e per ricordare la tua scelta sul banner cookie (<code className="text-xs text-white">jp-cookie-consent-v1</code>).
          </li>
          <li>
            <strong className="font-semibold text-white">Blocco preventivo dei contenuti di terze parti (Google Maps):</strong> nella pagina{" "}
            <Link href="/contatti" className="text-white underline underline-offset-4 hover:text-red-400">
              Contatti
            </Link>{" "}
            è presente la mappa del laboratorio di Montesilvano (PE) fornita da Google Maps. In assenza di tuo consenso esplicito, la mappa non viene caricata e nessun dato viene trasmesso a Google.
          </li>
        </ul>

        <h2 className="font-display text-3xl text-white">
          3. Elenco dettagliato di cookie e localStorage
        </h2>
        <div className="overflow-x-auto border border-white/15">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/15 bg-white/[0.04] text-[11px] uppercase tracking-wider text-white">
                <th className="p-3">Nome</th>
                <th className="p-3">Tipologia</th>
                <th className="p-3">Fornitore</th>
                <th className="p-3">Finalità</th>
                <th className="p-3">Durata</th>
                <th className="p-3">Regime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {storageItems.map((item) => (
                <tr key={item.name} className="align-top">
                  <td className="p-3 font-semibold text-white">{item.name}</td>
                  <td className="p-3 text-white/80">{item.type}</td>
                  <td className="p-3 text-white/80">{item.provider}</td>
                  <td className="p-3 text-white/75">{item.purpose}</td>
                  <td className="p-3 text-white/75">{item.duration}</td>
                  <td className="p-3 text-white/80">{item.consent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="font-display text-3xl text-white">
          4. Come gestire o revocare il consenso
        </h2>
        <p>
          Puoi modificare o revocare in qualsiasi momento la tua scelta cliccando sul pulsante{" "}
          <strong className="font-semibold text-white">«Modifica preferenze cookie»</strong>{" "}
          presente in cima a questa pagina o sul collegamento{" "}
          <strong className="font-semibold text-white">«Preferenze Cookie»</strong>{" "}
          nel piè di pagina (footer) di ogni schermata del sito. Puoi inoltre cancellare i dati di navigazione e i cookie direttamente dalle impostazioni del tuo browser (Chrome, Safari, Firefox, Edge).
        </p>

        <h2 className="font-display text-3xl text-white">
          5. Titolare del trattamento e rinvio alla Privacy Policy
        </h2>
        <p>
          Il Titolare del trattamento è <strong className="font-semibold text-white">Jacopo Peca</strong>, con laboratorio in{" "}
          <strong className="font-semibold text-white">{contactInfo.address}</strong>{" "}
          – Email:{" "}
          <a
            href={`mailto:${contactInfo.email}`}
            className="text-white underline underline-offset-4 hover:text-red-400"
          >
            {contactInfo.email}
          </a>
          . Per tutte le informazioni sul trattamento dei dati personali e sull&apos;esercizio dei diritti previsti dagli artt. 15–22 del Regolamento UE 2016/679 (GDPR), consulta la{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-white underline underline-offset-4 hover:text-red-400"
          >
            Privacy Policy completa
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
