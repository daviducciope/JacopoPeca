"use client";

import { useEffect, useState } from "react";

export default function HeroVideo() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    const start = () => { timer = setTimeout(() => setEnabled(true), 1000); };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      clearTimeout(timer);
    };
  }, []);

  return (
    <video
      poster="/images/atelier/atelier-embroidery-hero.webp"
      preload="none"
      aria-hidden="true"
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 h-full w-full object-cover opacity-60"
      src={enabled ? "https://jacopopeca-assets-089081311517-prod.s3.eu-central-1.amazonaws.com/wp-content/uploads/2023/09/NQIW5815.mp4" : undefined}
    />
  );
}
