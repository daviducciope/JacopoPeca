"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, SlidersHorizontal, X } from "lucide-react";

import { useCookieConsent } from "@/lib/cookie-consent";

/**
 * Cookie banner & preferences dialog compliant with the Italian Garante Privacy
 * Guidelines (10 June 2021):
 * - Top-right X button closes the banner keeping only technical cookies active;
 * - "Rifiuta / Solo tecnici" and "Accetta tutti" buttons have equal visual prominence;
 * - Granular opt-in for third-party embeds (Google Maps on /contatti);
 * - Can be reopened at any time from the footer or the Cookie Policy page.
 */
export default function CookieBanner() {
  const {
    preferences,
    hydrated,
    preferencesOpen,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    closePreferences,
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);
  const [draftExternalMedia, setDraftExternalMedia] = useState<boolean | null>(
    null,
  );

  if (!hydrated) return null;

  const isBannerVisible = preferences === null || preferencesOpen;
  if (!isBannerVisible) return null;

  const externalMediaChecked =
    draftExternalMedia ?? preferences?.externalMedia ?? false;
  const detailsExpanded = showDetails || preferencesOpen;

  function handleCloseOrReject() {
    setShowDetails(false);
    setDraftExternalMedia(null);
    if (preferences !== null && preferencesOpen) {
      closePreferences();
      return;
    }
    rejectNonEssential();
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="jp-cookie-banner-title"
      aria-describedby="jp-cookie-banner-desc"
      className="fixed inset-x-0 bottom-0 z-[1500] p-3 sm:p-5"
    >
      <div className="mx-auto max-w-5xl border border-white/20 bg-[#0d0d0d]/98 p-5 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-6">
        {/* Header with mandatory X button (keeps only technical storage) */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="shrink-0 text-red-500" aria-hidden="true" />
            <p
              id="jp-cookie-banner-title"
              className="text-xs font-bold uppercase tracking-[0.25em] text-white"
            >
              Informativa Cookie &amp; Tecnologie di Archiviazione
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseOrReject}
            aria-label="Chiudi e continua solo con i cookie tecnici necessari"
            title="Continua senza accettare i cookie non tecnici"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-white/20 text-white/75 transition hover:border-white hover:text-white"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <p
          id="jp-cookie-banner-desc"
          className="mt-2.5 text-xs leading-relaxed text-white/80 sm:text-[13px]"
        >
          Questo sito utilizza esclusivamente{" "}
          <strong className="font-semibold text-white">
            strumenti tecnici di prima parte
          </strong>{" "}
          (necessari per salvare il carrello e ricordare questa scelta) e non
          utilizza cookie di profilazione pubblicitaria. Previo tuo consenso,
          abilitiamo contenuti esterni di terze parti come la{" "}
          <strong className="font-semibold text-white">
            mappa interattiva Google Maps
          </strong>{" "}
          nella pagina Contatti. Chiudendo il banner con la{" "}
          <strong className="font-semibold text-white">X</strong> o cliccando su{" "}
          <strong className="font-semibold text-white">Solo tecnici</strong>,
          continui la navigazione senza cookie di terze parti. Leggi la{" "}
          <Link
            href="/cookie-policy"
            className="font-semibold text-white underline underline-offset-4 hover:text-red-400"
          >
            Cookie Policy
          </Link>{" "}
          e la{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-white underline underline-offset-4 hover:text-red-400"
          >
            Privacy Policy
          </Link>
          .
        </p>

        {detailsExpanded && (
          <div className="mt-4 grid gap-3 border-y border-white/12 py-4 sm:grid-cols-2">
            <div className="border border-white/12 bg-white/[0.03] p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  1. Tecnici e Strettamente Necessari
                </span>
                <span className="border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Sempre attivi
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                Archiviazione locale del carrello (`jp-cart`), salvataggio della
                preferenza cookie e gestione sicura del checkout Stripe. Non
                richiedono consenso ai sensi dell&apos;art. 122 del Codice Privacy.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col justify-between border border-white/12 bg-white/[0.03] p-3.5 transition hover:border-white/30">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  2. Contenuti Esterni (Google Maps)
                </span>
                <input
                  type="checkbox"
                  checked={externalMediaChecked}
                  onChange={(e) => setDraftExternalMedia(e.target.checked)}
                  className="h-4 w-4 accent-red-600"
                />
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                Permette di visualizzare la mappa interattiva di Google Maps
                nella pagina Contatti. L&apos;attivazione comporta l&apos;invio di
                dati di navigazione e cookie tecnici/preferenziali a Google
                Ireland Ltd.
              </p>
            </label>
          </div>
        )}

        {/* Action buttons with equal visual prominence for Accept / Reject */}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
          {!detailsExpanded ? (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="inline-flex items-center gap-1.5 border border-white/25 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 transition hover:border-white hover:text-white"
            >
              <SlidersHorizontal size={13} aria-hidden="true" />
              Personalizza
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                savePreferences({ externalMedia: externalMediaChecked });
                setShowDetails(false);
                setDraftExternalMedia(null);
              }}
              className="border border-white/40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Salva scelte selezionate
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShowDetails(false);
              setDraftExternalMedia(null);
              rejectNonEssential();
            }}
            className="border-2 border-white bg-transparent px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
          >
            Solo tecnici (Rifiuta)
          </button>

          <button
            type="button"
            onClick={() => {
              setShowDetails(false);
              setDraftExternalMedia(null);
              acceptAll();
            }}
            className="border-2 border-white bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white"
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  );
}
