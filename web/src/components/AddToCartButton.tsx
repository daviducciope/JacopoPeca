"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  MessageCircle,
  Ruler,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { useCart } from "@/lib/cart";
import { contactInfo } from "@/lib/editorial-data";

interface Props {
  productId: string;
  slug: string;
  name: string;
  categoryName?: string;
  priceCents: number;
  image: string;
  inStock: boolean;
  sizes: { label: string; stock: number }[];
}

export default function AddToCartButton({
  productId,
  slug,
  name,
  categoryName,
  priceCents,
  image,
  inStock,
  sizes,
}: Props) {
  const { addItem } = useCart();

  const firstAvailableSize =
    sizes.find((s) => s.stock > 0)?.label ?? null;

  const [selectedSize, setSelectedSize] = useState<string | null>(
    firstAvailableSize
  );
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const needsSize = sizes.length > 0;
  const activeSizeObj = sizes.find((s) => s.label === selectedSize);
  const canAdd =
    inStock &&
    (!needsSize || (selectedSize !== null && (activeSizeObj?.stock ?? 0) > 0));

  const isWaistSizing = sizes.some(
    (s) => /^W\d+/i.test(s.label) || /^(40|42|44|46|48|50|52|54)$/.test(s.label)
  );

  function handleAdd() {
    if (!canAdd) return;
    addItem({
      productId,
      slug,
      name,
      priceCents,
      size: selectedSize,
      image,
    });
    setAdded(true);
  }

  const whatsappMessage = encodeURIComponent(
    inStock
      ? `Ciao Jacopo, vorrei informazioni sul capo "${name}"${
          selectedSize ? ` (Taglia ${selectedSize})` : ""
        } visto sullo store.`
      : `Ciao Jacopo, ho visto il capo "${name}" sullo store (esaurito) e vorrei sapere se è possibile realizzarne una versione custom su misura.`
  );
  const whatsappUrl = `${contactInfo.whatsappHref}?text=${whatsappMessage}`;

  return (
    <div className="space-y-5 border-y border-white/12 py-6">
      {needsSize && (
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white">
                Seleziona Taglia
              </p>
              {selectedSize && (
                <span className="border border-red-500/40 bg-red-600/15 px-2 py-0.5 text-[11px] font-bold uppercase text-red-400">
                  {selectedSize}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowSizeGuide((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/75 underline-offset-4 transition hover:text-white hover:underline"
            >
              <Ruler size={13} className="text-red-500" />
              {showSizeGuide ? "Chiudi guida taglie" : "Guida alle taglie"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const isSelected = selectedSize === s.label;
              const isAvailable = s.stock > 0;
              return (
                <button
                  key={s.label}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => {
                    setSelectedSize(s.label);
                    setAdded(false);
                  }}
                  className={`relative min-w-[3.4rem] border px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition ${
                    isSelected
                      ? "border-red-600 bg-red-600 text-white shadow-[0_0_20px_rgba(224,16,16,0.35)]"
                      : isAvailable
                        ? "border-white/25 bg-[#151515] text-white/85 hover:border-white hover:text-white"
                        : "cursor-not-allowed border-white/10 bg-black/40 text-white/25 line-through"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Scarcity note for selected size */}
          {activeSizeObj && activeSizeObj.stock > 0 && (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-400">
              <Sparkles size={13} />
              <span>
                <strong className="font-semibold">
                  {activeSizeObj.stock === 1
                    ? "Ultimo pezzo unico (1/1)"
                    : `${activeSizeObj.stock} pezzi disponibili`}
                </strong>{" "}
                in taglia{" "}
                <strong className="font-semibold">{activeSizeObj.label}</strong>{" "}
                — <em className="italic text-white/80">pronto per la spedizione</em>
              </span>
            </p>
          )}

          {/* Collapsible Size Guide */}
          {showSizeGuide && (
            <div className="mt-4 border border-white/15 bg-[#141414] p-4 text-xs leading-relaxed text-white/80">
              <p className="font-bold uppercase tracking-[0.2em] text-red-500">
                Riferimento Taglie &amp; Vestibilità{" "}
                {categoryName ? `// ${categoryName}` : ""}
              </p>
              {isWaistSizing ? (
                <div className="mt-2.5 space-y-2">
                  <p>
                    I <strong className="font-semibold text-white">jeans Jacopo Peca</strong>{" "}
                    seguono la taglia americana in pollici (<em className="italic text-white">Waist</em>).
                    Corrispondenza indicativa con la taglia italiana:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-center sm:grid-cols-6">
                    {[
                      { us: "W30", it: "IT 44", cm: "38-39 cm" },
                      { us: "W31", it: "IT 45", cm: "39-40 cm" },
                      { us: "W32", it: "IT 46", cm: "41-42 cm" },
                      { us: "W34", it: "IT 48", cm: "43-44 cm" },
                      { us: "W36", it: "IT 50", cm: "45-46 cm" },
                      { us: "W38 / 40", it: "IT 52-54", cm: "48-50 cm" },
                    ].map((row) => (
                      <div
                        key={row.us}
                        className="border border-white/10 bg-black/50 p-2"
                      >
                        <p className="font-bold text-white">{row.us}</p>
                        <p className="text-[11px] text-red-400">{row.it}</p>
                        <p className="text-[10px] text-white/60">Vita {row.cm}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-2">
                  I capi streetwear <strong className="font-semibold text-white">Jacopo Peca</strong>{" "}
                  hanno una <em className="italic text-white">vestibilità regular / leggermente rilassata</em>.
                  Se desideri le misure esatte in centimetri (spalle, torace, lunghezza) del singolo pezzo,
                  scrivici su WhatsApp prima dell&apos;ordine.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-col gap-3">
        {inStock ? (
          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className="flex w-full items-center justify-center gap-3 border-2 border-white bg-white px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.22em] text-black transition hover:border-red-600 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {added ? (
              <>
                <Check size={18} strokeWidth={3} /> Aggiunto al Carrello
              </>
            ) : needsSize && !selectedSize ? (
              "Seleziona una taglia"
            ) : (
              <>
                <ShoppingBag size={18} /> Aggiungi al Carrello
              </>
            )}
          </button>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 border-2 border-red-600 bg-red-600 px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-transparent"
          >
            <MessageCircle size={18} /> Richiedi replica su misura su WhatsApp
          </a>
        )}

        {/* Instant Cart / Checkout bar after adding */}
        {added && (
          <div className="flex flex-col items-center justify-between gap-3 border border-emerald-500/40 bg-emerald-500/10 p-3.5 sm:flex-row">
            <p className="text-xs text-emerald-300">
              <strong className="font-semibold text-white">{name}</strong>
              {selectedSize ? ` (Taglia ${selectedSize})` : ""} è nel tuo carrello.
            </p>
            <Link
              href="/cart"
              className="inline-flex shrink-0 items-center gap-2 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-red-600 hover:text-white"
            >
              Vai al Carrello <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Direct WhatsApp Atelier Concierge */}
        {inStock && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2.5 border border-white/20 bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 transition hover:border-white/50 hover:bg-white/[0.07] hover:text-white"
          >
            <MessageCircle size={15} className="text-emerald-400" />
            Dubbi su taglia o fit? Chiedi a Jacopo su WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
