"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    const start = () => {
      timer = setTimeout(() => setEnabled(true), 250);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      clearTimeout(timer);
    };
  }, []);

  const toggleAudio = () => {
    const video = videoRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (!enabled) {
      setEnabled(true);
    }

    if (video) {
      video.muted = nextMuted;
      if (!nextMuted) {
        video.volume = 0.9;
        video.play().catch(() => {
          // Fallback if browser blocks unmuted playback
        });
      }
    }
  };

  return (
    <>
      <video
        ref={videoRef}
        poster="/images/atelier/atelier-embroidery-hero.webp"
        preload="metadata"
        aria-hidden="true"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        src={enabled ? "/videos/hero-atelier.mp4" : undefined}
      />

      <button
        type="button"
        onClick={toggleAudio}
        aria-pressed={!isMuted}
        aria-label={isMuted ? "Attiva audio del video" : "Disattiva audio del video"}
        className={`jp-audio-btn group absolute bottom-5 right-5 z-20 inline-flex cursor-pointer items-center gap-3 border-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.26em] backdrop-blur-md transition-all duration-200 sm:bottom-8 sm:right-8 sm:px-5 sm:py-3 sm:text-xs lg:bottom-10 lg:right-10 ${
          isMuted
            ? "border-white/40 bg-black/75 text-white hover:border-[#e01010] hover:bg-black/90"
            : "border-[#e01010] bg-[#e01010] text-white shadow-[0_0_28px_rgba(224,16,16,0.55)] hover:bg-[#b80d0d] hover:border-[#b80d0d]"
        }`}
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          {isMuted ? (
            <VolumeX
              size={16}
              className="text-white/85 transition-transform duration-200 group-hover:scale-110 group-hover:text-[#e01010]"
              aria-hidden="true"
            />
          ) : (
            <Volume2
              size={16}
              className="text-white transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
          )}
        </span>

        {/* Equalizer bars JP style */}
        <span
          aria-hidden="true"
          className={`jp-eq flex h-3.5 items-end gap-[3px] ${isMuted ? "is-muted" : "is-playing"}`}
        >
          <span className="jp-eq-bar" />
          <span className="jp-eq-bar" />
          <span className="jp-eq-bar" />
          <span className="jp-eq-bar" />
        </span>

        <span className="select-none">
          {isMuted ? (
            <>
              SOUND <span className="text-[#e01010] transition-colors group-hover:text-white">OFF</span>
            </>
          ) : (
            <>SOUND ON</>
          )}
        </span>
      </button>
    </>
  );
}
