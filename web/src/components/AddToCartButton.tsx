"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

interface Props {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  inStock: boolean;
  sizes: { label: string; stock: number }[];
}

export default function AddToCartButton({
  productId,
  slug,
  name,
  priceCents,
  image,
  inStock,
  sizes,
}: Props) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const needsSize = sizes.length > 0;
  const canAdd = inStock && (!needsSize || selectedSize !== null);

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
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-4">
      {needsSize && (
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Taglia
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s.label}
                disabled={s.stock === 0}
                onClick={() => setSelectedSize(s.label)}
                className={`border px-4 py-2.5 text-sm font-medium transition ${
                  selectedSize === s.label
                    ? "border-white bg-white text-black"
                    : "border-white/20 bg-transparent text-white/70 hover:border-white/50 hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white/70`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          disabled={!canAdd}
          onClick={handleAdd}
          className="flex-1 border-2 border-white bg-white py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black"
        >
          {!inStock
            ? "Non disponibile"
            : added
              ? "✓ Aggiunto!"
              : needsSize && !selectedSize
                ? "Seleziona una taglia"
                : "Aggiungi al carrello"}
        </button>
      </div>
    </div>
  );
}
