"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

export interface GalleryImage {
  id?: string;
  url: string;
  alt: string;
  isThumbnail?: boolean;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  categoryName: string;
  inStock: boolean;
  badge?: string | null;
}

export default function ProductGallery({
  images,
  productName,
  categoryName,
  inStock,
  badge,
}: ProductGalleryProps) {
  const orderedImages = (() => {
    if (!images || images.length === 0) return [];
    const thumbIndex = images.findIndex((i) => i.isThumbnail);
    if (thumbIndex <= 0) return images;
    const thumb = images[thumbIndex];
    return [thumb, ...images.filter((_, idx) => idx !== thumbIndex)];
  })();

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const total = orderedImages.length;
  const activeImage = orderedImages[activeIndex] || orderedImages[0];

  function handlePrev() {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }

  function handleNext() {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + total) % total);
      }
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % total);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, total]);

  if (!activeImage) {
    return (
      <div className="flex aspect-4/5 items-center justify-center border border-white/12 bg-[#121212]">
        <span className="font-display text-6xl text-white/20">
          {productName[0]}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Main Interactive Stage */}
      <div className="group relative aspect-4/5 overflow-hidden border border-white/15 bg-[#121212]">
        <Image
          key={activeImage.url}
          src={activeImage.url}
          alt={activeImage.alt || `${productName} — ${categoryName} Jacopo Peca`}
          fill
          priority={activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 55vw"
          onClick={() => setLightboxOpen(true)}
          className="cursor-zoom-in object-cover transition duration-500 group-hover:scale-[1.02]"
        />

        {/* Top overlay badges */}
        <div className="pointer-events-none absolute left-3.5 right-3.5 top-3.5 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-white/15 bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
              {categoryName}
            </span>
            {badge && (
              <span className="border border-red-500/40 bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                {badge}
              </span>
            )}
          </div>

          <span className="border border-white/15 bg-black/80 px-2.5 py-1 text-[11px] font-semibold tracking-widest text-white/90 backdrop-blur-sm">
            {activeIndex + 1} / {total}
          </span>
        </div>

        {/* Prev / Next Controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Foto precedente"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-white/20 bg-black/75 text-white transition hover:border-white hover:bg-black"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Foto successiva"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-white/20 bg-black/75 text-white transition hover:border-white hover:bg-black"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Bottom bar with Zoom trigger & Handmade badge */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3.5 pt-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85">
            {inStock ? "✦ 100% Lavorato a Mano in Atelier" : "✦ Pezzo d'Archivio"}
          </span>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Ingrandisci immagine"
            className="pointer-events-auto inline-flex items-center gap-1.5 border border-white/20 bg-black/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white hover:text-black"
          >
            <Expand size={12} /> Ingrandisci
          </button>
        </div>
      </div>

      {/* Complete Thumbnails Grid (shows ALL photos, clickable) */}
      {total > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-5">
          {orderedImages.map((img, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={`${img.url}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Mostra foto ${idx + 1} di ${total}`}
                aria-current={isSelected ? "true" : undefined}
                className={`group relative aspect-square overflow-hidden border transition ${
                  isSelected
                    ? "border-2 border-red-600 ring-1 ring-red-600/50"
                    : "border-white/12 opacity-65 hover:border-white/45 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} vista ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 20vw, 11vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galleria ingrandita ${productName}`}
          className="fixed inset-0 z-[2000] flex flex-col bg-black/95 backdrop-blur-md"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between border-b border-white/12 px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-500">
                {categoryName} // Dettaglio Lavorazione
              </p>
              <p className="font-display text-2xl text-white">
                {productName}{" "}
                <span className="ml-2 font-sans text-xs font-normal text-white/60">
                  ({activeIndex + 1} di {total})
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Chiudi galleria"
              className="flex h-10 w-10 items-center justify-center border border-white/25 bg-white/5 text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lightbox Main Image */}
          <div
            className="relative flex flex-1 items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            <div
              className="relative h-full w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeImage.url}
                alt={activeImage.alt || productName}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  aria-label="Foto precedente"
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center border border-white/25 bg-black/80 text-white transition hover:border-white hover:bg-white hover:text-black"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  aria-label="Foto successiva"
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center border border-white/25 bg-black/80 text-white transition hover:border-white hover:bg-white hover:text-black"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnails */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto border-t border-white/12 px-5 py-3">
              {orderedImages.map((img, idx) => (
                <button
                  key={`lb-${img.url}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden border transition ${
                    idx === activeIndex
                      ? "border-2 border-red-600"
                      : "border-white/20 opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `${productName} ${idx + 1}`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

