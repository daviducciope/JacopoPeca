"use client";

import Script from "next/script";
import { useEffect } from "react";

import { useCookieConsent } from "@/lib/cookie-consent";

// L'ID misurazione GA4 non è un segreto: default incorporato, sovrascrivibile da env.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5WD119X4KZ";

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

// Consent Mode v2: lo script viene caricato solo con consenso "Statistiche".
const initScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`;

export default function GoogleAnalytics() {
  const { hydrated, preferences } = useCookieConsent();
  const allowed = hydrated && preferences?.analytics === true;

  // Revoca del consenso dopo il caricamento: ferma la raccolta.
  useEffect(() => {
    if (!hydrated || allowed) return;
    (window as GtagWindow).gtag?.("consent", "update", { analytics_storage: "denied" });
  }, [hydrated, allowed]);

  if (!allowed || !/^G-[A-Z0-9]+$/.test(GA_ID)) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {initScript}
      </Script>
    </>
  );
}
