"use client";

import { SlidersHorizontal } from "lucide-react";

import { useCookieConsent } from "@/lib/cookie-consent";

export default function CookiePreferencesTrigger() {
  const { preferences, hydrated, openPreferences } = useCookieConsent();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-white/15 bg-[#111] p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
          Stato attuale del tuo consenso
        </p>
        <p className="mt-1 text-sm text-white/85">
          {!hydrated
            ? "Verifica delle preferenze salvate sul tuo browser…"
            : preferences === null
              ? "Nessuna preferenza ancora salvata (attivi solo gli strumenti tecnici necessari)."
              : preferences.externalMedia || preferences.analytics
                ? `Strumenti tecnici necessari${preferences.externalMedia ? " + Google Maps" : ""}${preferences.analytics ? " + Google Analytics" : ""} attivi.`
                : "Solo strumenti tecnici necessari attivi (contenuti di terze parti disattivati)."}
        </p>
      </div>
      <button
        type="button"
        onClick={openPreferences}
        className="inline-flex items-center gap-2 border-2 border-white bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white"
      >
        <SlidersHorizontal size={14} aria-hidden="true" />
        Modifica preferenze cookie
      </button>
    </div>
  );
}
