"use client";

import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";

import { useCookieConsent } from "@/lib/cookie-consent";

type ConsentGoogleMapProps = {
  embedUrl: string;
  externalMapsUrl: string;
  title: string;
  address: string;
};

/**
 * Blocks the third-party Google Maps iframe until the user consents to
 * external media (Garante Privacy Cookie Guidelines – preventive blocking).
 */
export default function ConsentGoogleMap({
  embedUrl,
  externalMapsUrl,
  title,
  address,
}: ConsentGoogleMapProps) {
  const { preferences, hydrated, savePreferences } = useCookieConsent();
  const allowed = hydrated && Boolean(preferences?.externalMedia);

  if (allowed) {
    return (
      <div className="relative aspect-16/10 w-full overflow-hidden border border-white/15 bg-[#141414]">
        <iframe
          title={title}
          src={embedUrl}
          className="h-full w-full border-0 grayscale contrast-125 invert-[0.9] hue-rotate-180"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return (
    <div className="relative flex aspect-16/10 w-full flex-col items-center justify-center border border-white/15 bg-[#111] p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center border border-red-600/40 bg-red-600/10 text-red-500">
        <MapPin size={22} aria-hidden="true" />
      </div>
      <p className="mt-4 font-display text-3xl text-white sm:text-4xl">
        Mappa Laboratorio · Montesilvano
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
        {address}
      </p>
      <p className="mt-3 max-w-md text-xs leading-relaxed text-white/70">
        Per tutelare la tua privacy, la mappa interattiva di{" "}
        <strong className="font-semibold text-white">Google Maps</strong> è
        bloccata preventivamente finché non autorizzi i contenuti esterni di
        terze parti.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => savePreferences({ externalMedia: true })}
          className="inline-flex items-center gap-2 border-2 border-white bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white"
        >
          <ShieldCheck size={14} aria-hidden="true" />
          Abilita mappa interattiva
        </button>
        <a
          href={externalMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 border border-white/25 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-white"
        >
          Apri su Google Maps <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
