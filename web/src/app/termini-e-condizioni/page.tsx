import type { Metadata } from "next";
import Link from "next/link";

import { contactInfo, returnPolicy, shippingPolicy } from "@/lib/editorial-data";

export const metadata: Metadata = {
  title: "Termini e Condizioni di Vendita, Spedizioni, Resi e Diritto di Recesso",
  description:
    "Condizioni generali di vendita online, spedizioni tracciate in Italia ed Europa, diritto di recesso di 14 giorni, esclusione per capi su misura (art. 59 Codice del Consumo) e garanzia legale per Jacopo Peca.",
  alternates: {
    canonical: "/termini-e-condizioni",
  },
};

const vatNumber = process.env.NEXT_PUBLIC_VAT_NUMBER;

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16 text-white lg:px-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">
          Legal · D.Lgs. 206/2005 (Codice del Consumo) &amp; D.Lgs. 70/2003
        </p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">
          Termini e Condizioni di Vendita
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/55">
          Condizioni generali di contratto per gli acquisti su jacopopeca.com · Ultimo aggiornamento: Novembre 2026
        </p>
      </div>

      <section className="space-y-6 text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
        <h2 className="font-display text-3xl text-white">
          1. Identificazione del Venditore e Ambito di Applicazione
        </h2>
        <p>
          Le presenti Condizioni Generali di Vendita disciplinano l&apos;offerta e la vendita a distanza dei capi di abbigliamento e degli accessori artigianali promossi sul sito{" "}
          <strong className="font-semibold text-white">jacopopeca.com</strong> ai sensi del D.Lgs. 6 settembre 2005, n. 206 (<strong className="font-semibold text-white">Codice del Consumo</strong>) e del D.Lgs. 9 aprile 2003, n. 70 sul commercio elettronico.
        </p>
        <div className="border border-white/15 bg-[#111] p-5 text-sm leading-7">
          <p>
            <strong className="font-semibold text-white">Venditore / Laboratorio Artigianale:</strong> Jacopo Peca
          </p>
          <p>
            <strong className="font-semibold text-white">Sede operativa:</strong> {contactInfo.address}
          </p>
          {vatNumber && (
            <p>
              <strong className="font-semibold text-white">Partita IVA:</strong> {vatNumber}
            </p>
          )}
          <p>
            <strong className="font-semibold text-white">Email:</strong>{" "}
            <a
              href={`mailto:${contactInfo.email}`}
              className="text-white underline underline-offset-4 hover:text-red-400"
            >
              {contactInfo.email}
            </a>
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
          2. Natura Artigianale dei Prodotti (Pezzi Unici 1/1 e Serie Limitate)
        </h2>
        <p>
          Tutti i capi presenti nello store sono{" "}
          <strong className="font-semibold text-white">lavorati a mano nel laboratorio di Montesilvano (PE)</strong>{" "}
          attraverso tecniche di cucitura sartoriale, ricamo su macchine d&apos;epoca (Cornely / Singer), pittura a mano, aerografo, strappi e patchwork. Eventuali irregolarità del tessuto, sfumature di colore, asimmetrie o segni di usura sulle basi vintage rilavorate costituiscono la firma autentica di un{" "}
          <strong className="font-semibold text-white">pezzo unico (1/1)</strong> e non rappresentano difetti di produzione.
        </p>

        <h2 className="font-display text-3xl text-white">
          3. Prezzi, Conclusione del Contratto e Pagamenti Sicuri
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Tutti i prezzi di vendita pubblicati sul sito sono espressi in <strong className="font-semibold text-white">Euro (€)</strong> e si intendono comprensivi di imposte applicabili.
          </li>
          <li>
            Il costo di spedizione viene mostrato chiaramente nel{" "}
            <Link href="/cart" className="text-white underline underline-offset-4 hover:text-red-400">
              Carrello
            </Link>{" "}
            prima dell&apos;avvio del pagamento. In Italia la spedizione è gratuita per gli ordini pari o superiori a <strong className="font-semibold text-white">€ 100,00</strong>.
          </li>
          <li>
            Il pagamento avviene tramite la piattaforma certificata <strong className="font-semibold text-white">Stripe Checkout</strong> (carte di credito/debito Visa, Mastercard, American Express, Apple Pay e Google Pay). Al completamento del pagamento l&apos;ordine viene registrato e il cliente riceve conferma via email.
          </li>
        </ul>

        <h2 className="font-display text-3xl text-white">
          4. Spedizioni e Consegna
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          {shippingPolicy.map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>
            Per i capi disponibili in pronta consegna nello store la preparazione e l&apos;affidamento al corriere avvengono di norma entro <strong className="font-semibold text-white">1–3 giorni lavorativi</strong> dalla conferma del pagamento.
          </li>
        </ul>

        <h2 className="font-display text-3xl text-white">
          5. Diritto di Recesso per i Capi a Catalogo (14 Giorni – art. 52 Codice del Consumo)
        </h2>
        <p>
          Se acquisti in qualità di <strong className="font-semibold text-white">Consumatore</strong> un capo standard pronto a catalogo (non realizzato o modificato su tua specifica richiesta), hai il diritto di recedere dal contratto, senza dover fornire alcuna motivazione, entro{" "}
          <strong className="font-semibold text-white">14 (quattordici) giorni</strong> dal giorno in cui tu o un terzo da te designato acquisite il possesso fisico del bene.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-white">Come esercitare il recesso:</strong> prima della scadenza dei 14 giorni, invia una comunicazione esplicita via email a{" "}
            <a
              href={`mailto:${contactInfo.email}`}
              className="text-white underline underline-offset-4 hover:text-red-400"
            >
              {contactInfo.email}
            </a>{" "}
            indicando numero d&apos;ordine, capo da restituire e nominativo.
          </li>
          <li>
            <strong className="font-semibold text-white">Condizioni di restituzione:</strong> il capo deve essere restituito integro, non indossato (salvo la normale prova di vestibilità), non lavato e completo di etichette/cartellini originali, spedendolo al laboratorio in <strong className="font-semibold text-white">{contactInfo.address}</strong> entro 14 giorni dalla comunicazione di recesso. I costi diretti della spedizione di rientro sono a carico del cliente (art. 57 Codice del Consumo), salvo il caso di prodotto difettoso o errato.
          </li>
          <li>
            <strong className="font-semibold text-white">Rimborso:</strong> ricevuto e verificato il capo, il rimborso viene effettuato entro 14 giorni sullo stesso metodo di pagamento utilizzato per l&apos;acquisto tramite Stripe.
          </li>
          {returnPolicy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="font-display text-3xl text-white">
          6. Esclusione del Recesso per Capi Su Misura o Personalizzati (art. 59, lett. c, Codice del Consumo)
        </h2>
        <p>
          Ai sensi dell&apos;articolo 59, comma 1, lettera c) del D.Lgs. 206/2005 (Codice del Consumo),{" "}
          <strong className="font-semibold text-white">
            il diritto di recesso è escluso per la fornitura di beni confezionati su misura o chiaramente personalizzati
          </strong>
          . Rientrano in questa categoria tutti i capi commissionati tramite il servizio{" "}
          <Link href="/denim-customize" className="text-white underline underline-offset-4 hover:text-red-400">
            Denim Customize
          </Link>
          , le lavorazioni eseguite su capi spediti dal cliente e i prodotti di catalogo sui quali il cliente abbia richiesto modifiche sartoriali di vestibilità, ricami, scritte o interventi pittorici personalizzati prima della spedizione. Resta sempre ferma la tutela per eventuali difetti di lavorazione.
        </p>

        <h2 className="font-display text-3xl text-white">
          7. Garanzia Legale di Conformità (24 Mesi)
        </h2>
        <p>
          Tutti i prodotti venduti ai Consumatori sono coperti dalla{" "}
          <strong className="font-semibold text-white">Garanzia Legale di Conformità di 24 mesi</strong>{" "}
          dalla consegna del bene, ai sensi degli artt. 128–135-septies del Codice del Consumo. In caso di difetto di conformità originario, il Consumatore ha diritto al ripristino della conformità mediante riparazione artigianale o sostituzione, ovvero, nei casi previsti dalla legge, alla riduzione del prezzo o alla risoluzione del contratto, contattando direttamente il laboratorio.
        </p>

        <h2 className="font-display text-3xl text-white">
          8. Legge Applicabile e Foro Competente
        </h2>
        <p>
          Il contratto di vendita è regolato dalla <strong className="font-semibold text-white">Legge Italiana</strong>. Per ogni controversia relativa all&apos;applicazione, esecuzione e interpretazione delle presenti condizioni in cui sia parte un Consumatore, è competente in via inderogabile il <strong className="font-semibold text-white">Foro del luogo di residenza o di domicilio del Consumatore</strong>, se ubicato nel territorio dello Stato italiano (art. 66-bis Codice del Consumo).
        </p>
      </section>
    </main>
  );
}
