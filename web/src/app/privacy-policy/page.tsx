import type { Metadata } from "next";
import Link from "next/link";

import { contactInfo } from "@/lib/editorial-data";

export const metadata: Metadata = {
  title: "Privacy Policy – Informativa Trattamento Dati Personali (GDPR)",
  description:
    "Informativa sul trattamento dei dati personali ai sensi degli artt. 13-14 del Regolamento UE 2016/679 (GDPR) per lo store ufficiale e il laboratorio Jacopo Peca.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

const vatNumber = process.env.NEXT_PUBLIC_VAT_NUMBER;

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16 text-white lg:px-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">
          Legal · Regolamento UE 2016/679 (GDPR)
        </p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/55">
          Informativa ai sensi degli artt. 13 e 14 del GDPR · Ultimo aggiornamento: Novembre 2026
        </p>
      </div>

      <section className="space-y-6 text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
        <p>
          La presente informativa descrive le modalità di raccolta e trattamento dei{" "}
          <strong className="font-semibold text-white">dati personali</strong> degli utenti che visitano il sito{" "}
          <strong className="font-semibold text-white">jacopopeca.com</strong>, acquistano capi nello store online, richiedono lavorazioni su misura (<em className="italic text-white">Denim Customize</em>) o interagiscono con il laboratorio tramite email, telefono o WhatsApp.
        </p>

        <h2 className="font-display text-3xl text-white">
          1. Titolare del Trattamento
        </h2>
        <div className="border border-white/15 bg-[#111] p-5 text-sm leading-7">
          <p>
            <strong className="font-semibold text-white">Titolare del trattamento:</strong> Jacopo Peca
          </p>
          <p>
            <strong className="font-semibold text-white">Sede del laboratorio:</strong> {contactInfo.address}
          </p>
          {vatNumber && (
            <p>
              <strong className="font-semibold text-white">Partita IVA:</strong> {vatNumber}
            </p>
          )}
          <p>
            <strong className="font-semibold text-white">Email di contatto:</strong>{" "}
            <a
              href={`mailto:${contactInfo.email}`}
              className="text-white underline underline-offset-4 hover:text-red-400"
            >
              {contactInfo.email}
            </a>{" "}
            / {contactInfo.emailSecondary}
          </p>
          <p>
            <strong className="font-semibold text-white">Telefono / WhatsApp:</strong>{" "}
            <a
              href={contactInfo.phoneHref}
              className="text-white underline underline-offset-4 hover:text-red-400"
            >
              {contactInfo.phoneDisplay}
            </a>
          </p>
        </div>

        <h2 className="font-display text-3xl text-white">
          2. Tipologie di Dati Trattati
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-white">Dati di acquisto e spedizione:</strong> nome, cognome, indirizzo di spedizione e fatturazione, indirizzo email, recapito telefonico, articoli e taglie ordinate, importo e stato del pagamento.
          </li>
          <li>
            <strong className="font-semibold text-white">Dati di pagamento:</strong> i pagamenti con carta di credito/debito, Apple Pay e Google Pay sono gestiti interamente sulla piattaforma certificata PCI-DSS di <strong className="font-semibold text-white">Stripe</strong>. Il Titolare non acquisisce né memorizza mai i numeri completi delle carte di pagamento.
          </li>
          <li>
            <strong className="font-semibold text-white">Dati forniti per richieste e customizzazioni:</strong> messaggi, misure corporee o del capo, fotografie inviate volontariamente dall&apos;utente via email, modulo di contatto o WhatsApp per la valutazione di capi su misura.
          </li>
          <li>
            <strong className="font-semibold text-white">Dati per la Newsletter (Double Opt-In):</strong> indirizzo email, data/ora e pagina di iscrizione, versione del consenso, conferma del link ricevuto via email ed eventuale revoca.
          </li>
          <li>
            <strong className="font-semibold text-white">Dati tecnici di navigazione:</strong> indirizzo IP, log tecnici di sicurezza del server, e dati salvati nel browser tramite strumenti tecnici (vedi la{" "}
            <Link href="/cookie-policy" className="text-white underline underline-offset-4 hover:text-red-400">
              Cookie Policy
            </Link>
            ).
          </li>
        </ul>

        <h2 className="font-display text-3xl text-white">
          3. Finalità del Trattamento e Base Giuridica (art. 6 GDPR)
        </h2>
        <ul className="list-disc space-y-2.5 pl-5">
          <li>
            <strong className="font-semibold text-white">Gestione degli ordini, spedizioni, resi e assistenza clienti:</strong> esecuzione di un contratto di vendita o di misure precontrattuali richieste dall&apos;interessato (<strong className="font-semibold text-white">art. 6, par. 1, lett. b GDPR</strong>).
          </li>
          <li>
            <strong className="font-semibold text-white">Preventivi e consulenza per capi su misura (Denim Customize):</strong> esecuzione di misure precontrattuali su richiesta dell&apos;interessato (<strong className="font-semibold text-white">art. 6, par. 1, lett. b GDPR</strong>).
          </li>
          <li>
            <strong className="font-semibold text-white">Adempimenti contabili, fiscali e amministrativi:</strong> obbligo di legge a cui è soggetto il Titolare (<strong className="font-semibold text-white">art. 6, par. 1, lett. c GDPR</strong>).
          </li>
          <li>
            <strong className="font-semibold text-white">Sicurezza del sito e prevenzione frodi:</strong> legittimo interesse del Titolare alla tutela dell&apos;infrastruttura informatica e delle transazioni (<strong className="font-semibold text-white">art. 6, par. 1, lett. f GDPR</strong>).
          </li>
          <li>
            <strong className="font-semibold text-white">Invio della Newsletter e comunicazioni promozionali:</strong> consenso libero, specifico e revocabile dell&apos;interessato (<strong className="font-semibold text-white">art. 6, par. 1, lett. a GDPR</strong>), verificato tramite procedura di conferma via email (<em>double opt-in</em>).
          </li>
        </ul>

        <h2 className="font-display text-3xl text-white">
          4. Newsletter e Comunicazioni Promozionali
        </h2>
        <p>
          L&apos;iscrizione alla newsletter è sempre facoltativa, separata dall&apos;acquisto e mai preselezionata. Richiediamo la conferma tramite email prima di inviare contenuti promozionali. Gli iscritti ricevono selezioni di capi disponibili, novità dal laboratorio, consigli sulla cura del denim e, se hanno lasciato un checkout incompleto avendo prestato consenso marketing, un promemoria.
        </p>
        <p>
          Ogni email promozionale contiene il collegamento diretto di disiscrizione (<em className="italic text-white">unsubscribe</em>) con un solo clic: la revoca interrompe immediatamente gli invii promozionali senza pregiudicare le comunicazioni di servizio relative agli ordini effettuati.
        </p>

        <h2 className="font-display text-3xl text-white">
          5. Destinatari dei Dati e Fornitori Tecnici
        </h2>
        <p>
          I dati personali non vengono mai venduti né ceduti a terzi per finalità di marketing. Possono essere trattati da fornitori qualificati che operano come Responsabili del trattamento (art. 28 GDPR) o Titolari autonomi per l&apos;erogazione dei servizi:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-white">Stripe Payments Europe, Ltd.</strong> per l&apos;elaborazione sicura dei pagamenti elettronici e la prevenzione delle frodi.
          </li>
          <li>
            <strong className="font-semibold text-white">Twilio Inc. / SendGrid</strong> per l&apos;invio delle email transazionali d&apos;ordine e della newsletter confermata.
          </li>
          <li>
            <strong className="font-semibold text-white">Amazon Web Services (AWS EMEA SARL – Regione UE Francoforte)</strong> per l&apos;infrastruttura cloud e l&apos;archiviazione delle immagini di catalogo.
          </li>
          <li>
            <strong className="font-semibold text-white">Corrieri espressi e spedizionieri</strong> per la consegna tracciata dei capi ordinati in Italia e in Europa.
          </li>
          <li>
            <strong className="font-semibold text-white">Consulenti contabili e fiscali</strong> per gli adempimenti di legge.
          </li>
        </ul>
        <p>
          Qualora alcuni fornitori tecnologici comportino un trasferimento di dati verso Paesi extra-SEE (es. Stati Uniti), tale trasferimento avviene nel rispetto del Capo V del GDPR sulla base dell&apos;adesione al <strong className="font-semibold text-white">EU-U.S. Data Privacy Framework</strong> e/o della sottoscrizione delle <strong className="font-semibold text-white">Clausole Contrattuali Standard (SCC)</strong> approvate dalla Commissione Europea.
        </p>

        <h2 className="font-display text-3xl text-white">
          6. Periodo di Conservazione dei Dati
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-white">Dati relativi agli ordini e alla fatturazione:</strong> conservati per <strong className="font-semibold text-white">10 anni</strong> dalla data dell&apos;ordine ai sensi dell&apos;art. 2220 del Codice Civile e della normativa fiscale.
          </li>
          <li>
            <strong className="font-semibold text-white">Richieste di informazioni o preventivi custom non seguiti da ordine:</strong> fino a <strong className="font-semibold text-white">24 mesi</strong> dall&apos;ultimo contatto.
          </li>
          <li>
            <strong className="font-semibold text-white">Dati di iscrizione alla Newsletter:</strong> fino alla revoca del consenso (disiscrizione) da parte dell&apos;utente.
          </li>
        </ul>

        <h2 className="font-display text-3xl text-white">
          7. Diritti dell&apos;Interessato (artt. 15–22 GDPR)
        </h2>
        <p>
          In qualunque momento puoi esercitare i diritti riconosciuti dal GDPR: ottenere la conferma dell&apos;esistenza dei tuoi dati e accedervi (<strong className="font-semibold text-white">art. 15</strong>), chiederne la rettifica (<strong className="font-semibold text-white">art. 16</strong>), la cancellazione / oblio (<strong className="font-semibold text-white">art. 17</strong>), la limitazione del trattamento (<strong className="font-semibold text-white">art. 18</strong>), la portabilità dei dati (<strong className="font-semibold text-white">art. 20</strong>), opporti al trattamento (<strong className="font-semibold text-white">art. 21</strong>) o revocare il consenso prestato (<strong className="font-semibold text-white">art. 7, par. 3</strong>).
        </p>
        <p>
          Per esercitare i tuoi diritti ti basta inviare una comunicazione a{" "}
          <a
            href={`mailto:${contactInfo.email}`}
            className="font-semibold text-white underline underline-offset-4 hover:text-red-400"
          >
            {contactInfo.email}
          </a>
          . Hai inoltre sempre il diritto di proporre reclamo all&apos;Autorità di controllo competente (<strong className="font-semibold text-white">Garante per la Protezione dei Dati Personali</strong> –{" "}
          <a
            href="https://www.garanteprivacy.it"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-4 hover:text-red-400"
          >
            www.garanteprivacy.it
          </a>
          ) ai sensi dell&apos;art. 77 del GDPR.
        </p>
      </section>
    </main>
  );
}
