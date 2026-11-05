"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

export type PhotoPresetId =
  | "auto_studio"
  | "denim_detail"
  | "dark_garment"
  | "anti_yellow"
  | "streetwear_contrast"
  | "original";

export type PhotoFrameMode =
  | "smart_4_5"
  | "crop_4_5"
  | "crop_3_4"
  | "fit_4_5"
  | "square_1_1"
  | "original";

export type PhotoStudioSettings = {
  preset: PhotoPresetId;
  frameMode: PhotoFrameMode;
  rotation: 0 | 90 | 180 | 270;
  zoom: number; // 1.0 to 2.5
  panX: number; // -1.0 to 1.0
  panY: number; // -1.0 to 1.0
  exposure: number; // -40 to +40
  shadows: number; // 0 to +60 (apre le ombre sui capi scuri)
  contrast: number; // -30 to +45
  temperature: number; // -40 (più fredda / togli giallo) to +40 (più calda)
  saturation: number; // -30 to +35
  sharpness: number; // 0 to 70 (nitidezza trama e cuciture)
  vignette: number; // 0 to 45 (vignettatura studio)
};

export type ProcessedPhotoResult = {
  file: File;
  width: number;
  height: number;
  originalSizeBytes: number;
  outputSizeBytes: number;
  formatLabel: "WEBP" | "JPG";
  appliedSettings: PhotoStudioSettings;
};

export const PHOTO_PRESETS: Array<{
  id: PhotoPresetId;
  label: string;
  shortLabel: string;
  badge?: string;
  description: string;
  defaults: Pick<
    PhotoStudioSettings,
    "exposure" | "shadows" | "contrast" | "temperature" | "saturation" | "sharpness" | "vignette"
  >;
}> = [
  {
    id: "auto_studio",
    label: "✨ Auto Studio Atelier",
    shortLabel: "✨ Auto Studio",
    badge: "Consigliato",
    description:
      "Bilancia in automatico la luce del telefono, elimina il giallo delle lampadine interne ed esalta cuciture e trama del tessuto.",
    defaults: {
      exposure: 6,
      shadows: 18,
      contrast: 14,
      temperature: -8,
      saturation: 8,
      sharpness: 32,
      vignette: 14,
    },
  },
  {
    id: "denim_detail",
    label: "👖 Denim & Cuciture HD",
    shortLabel: "👖 Denim HD",
    description:
      "Massima nitidezza su trama del jeans, strappi, ricami Cornely e pittura a mano, con blu indaco più puro e profondo.",
    defaults: {
      exposure: 4,
      shadows: 15,
      contrast: 20,
      temperature: -14,
      saturation: 14,
      sharpness: 48,
      vignette: 16,
    },
  },
  {
    id: "dark_garment",
    label: "☀️ Schiarisci Capi Scuri / Neri",
    shortLabel: "☀️ Capi Scuri",
    description:
      "Apre le ombre chiuse su felpe nere, t-shirt scure o foto scattate in laboratorio con poca luce, rendendo visibili i dettagli.",
    defaults: {
      exposure: 16,
      shadows: 42,
      contrast: 12,
      temperature: -6,
      saturation: 4,
      sharpness: 30,
      vignette: 8,
    },
  },
  {
    id: "anti_yellow",
    label: "❄️ Luce Naturale (Togli Giallo)",
    shortLabel: "❄️ Togli Giallo",
    description:
      "Corregge la dominante gialla/arancione tipica delle foto fatte col telefono sotto luci calde da interno. Bianchi puliti e colori reali.",
    defaults: {
      exposure: 8,
      shadows: 14,
      contrast: 12,
      temperature: -28,
      saturation: 6,
      sharpness: 26,
      vignette: 10,
    },
  },
  {
    id: "streetwear_contrast",
    label: "🔥 Lookbook Streetwear",
    shortLabel: "🔥 Lookbook",
    description:
      "Contrasto deciso da catalogo editoriale dark con vignettatura da studio più avvolgente per pezzi unici 1/1.",
    defaults: {
      exposure: 4,
      shadows: 10,
      contrast: 28,
      temperature: -6,
      saturation: 10,
      sharpness: 38,
      vignette: 28,
    },
  },
  {
    id: "original",
    label: "📷 Luce Originale (Solo Conversione Web)",
    shortLabel: "📷 Originale",
    description:
      "Non modifica i colori o la luce della foto, ma la converte nel formato WebP ultra-leggero e veloce per il sito.",
    defaults: {
      exposure: 0,
      shadows: 0,
      contrast: 0,
      temperature: 0,
      saturation: 0,
      sharpness: 0,
      vignette: 0,
    },
  },
];

export const PHOTO_FRAME_MODES: Array<{
  id: PhotoFrameMode;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: "smart_4_5",
    label: "📐 4:5 Verticale Intelligente (Consigliato Shop)",
    shortLabel: "4:5 Smart Shop",
    description:
      "Inquadra in 4:5 verticale per lo Shop. Se la foto è orizzontale, non taglia il capo ma crea uno sfondo studio dark.",
  },
  {
    id: "crop_4_5",
    label: "🖼️ 4:5 Verticale Pieno (Ritaglia sempre)",
    shortLabel: "4:5 Pieno",
    description: "Riempie sempre l'intero riquadro verticale 4:5 (ideale per Scheda Prodotto e Shop).",
  },
  {
    id: "crop_3_4",
    label: "🖼️ 3:4 Verticale Catalogo",
    shortLabel: "3:4 Catalogo",
    description: "Proporzione 3:4 identica alle card della griglia Store e Homepage.",
  },
  {
    id: "fit_4_5",
    label: "⬛ Mostra Capo Intero (Con Cornice Studio Dark)",
    shortLabel: "Intero (No Taglio)",
    description:
      "Non taglia nemmeno 1 millimetro della foto: adatta l'immagine intera dentro un telaio 4:5 con sfondo studio scuro.",
  },
  {
    id: "square_1_1",
    label: "🔲 Quadrato 1:1",
    shortLabel: "1:1 Quadrato",
    description: "Formato quadrato 1:1 centrato sul capo.",
  },
  {
    id: "original",
    label: "📏 Proporzioni Originali del Telefono",
    shortLabel: "Originale",
    description: "Mantiene il rapporto larghezza/altezza originale della fotocamera.",
  },
];

export function buildDefaultStudioSettings(
  preset: PhotoPresetId = "auto_studio",
  frameMode: PhotoFrameMode = "smart_4_5",
): PhotoStudioSettings {
  const found = PHOTO_PRESETS.find((p) => p.id === preset) ?? PHOTO_PRESETS[0];
  return {
    preset,
    frameMode,
    rotation: 0,
    zoom: 1,
    panX: 0,
    panY: 0,
    ...found.defaults,
  };
}

type ImageAutoStats = {
  p5: number;
  p50: number;
  p95: number;
  warmCast: number; // > 0 means yellowish/warm indoor cast
};

function clamp(val: number, min: number, max: number): number {
  return val < min ? min : val > max ? max : val;
}

function clampByte(val: number): number {
  return val <= 0 ? 0 : val >= 255 ? 255 : val | 0;
}

/**
 * Analizza rapidamente l'istogramma della zona centrale della foto (dove si trova il capo)
 * per capire se la foto del telefono è buia, piatta o ingiallita dalle luci del laboratorio.
 */
function analyzeImageHistogram(img: HTMLImageElement): ImageAutoStats {
  const sampleSize = 120;
  const canvas = document.createElement("canvas");
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { p5: 15, p50: 128, p95: 242, warmCast: 0 };
  }

  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

  const hist = new Uint32Array(256);
  let totalPixels = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let neutralCount = 0;

  // Concentriamoci soprattutto sul 75% centrale dell'inquadratura (il capo d'abbigliamento)
  const margin = Math.floor(sampleSize * 0.12);
  for (let y = margin; y < sampleSize - margin; y++) {
    for (let x = margin; x < sampleSize - margin; x++) {
      const idx = (y * sampleSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = (r * 77 + g * 150 + b * 29) >> 8;
      hist[lum]++;
      totalPixels++;

      // Rileva dominante calda su toni medi/chiari non troppo saturi
      if (lum > 70 && lum < 235) {
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        if (maxC - minC < 75) {
          sumR += r;
          sumG += g;
          sumB += b;
          neutralCount++;
        }
      }
    }
  }

  if (totalPixels === 0) {
    return { p5: 15, p50: 128, p95: 242, warmCast: 0 };
  }

  const target5 = totalPixels * 0.05;
  const target50 = totalPixels * 0.5;
  const target95 = totalPixels * 0.95;

  let acc = 0;
  let p5 = 10;
  let p50 = 128;
  let p95 = 245;
  let got5 = false;
  let got50 = false;
  let got95 = false;

  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (!got5 && acc >= target5) {
      p5 = i;
      got5 = true;
    }
    if (!got50 && acc >= target50) {
      p50 = i;
      got50 = true;
    }
    if (!got95 && acc >= target95) {
      p95 = i;
      got95 = true;
      break;
    }
  }

  let warmCast = 0;
  if (neutralCount > 50) {
    const avgR = sumR / neutralCount;
    const avgG = sumG / neutralCount;
    const avgB = sumB / neutralCount;
    // Se il rosso supera nettamente il blu nei toni quasi-neutri, c'è luce gialla artificiale
    warmCast = clamp((avgR - avgB) / Math.max(avgG, 60), -0.25, 0.35);
  }

  return { p5, p50, p95, warmCast };
}

function computeTargetDimensions(
  srcW: number,
  srcH: number,
  frameMode: PhotoFrameMode,
  maxLongSide: number,
): { outW: number; outH: number; useBackdropFit: boolean } {
  const isLandscape = srcW > srcH * 1.06;

  if (frameMode === "smart_4_5") {
    const outH = maxLongSide;
    const outW = Math.round(outH * 0.8); // 4:5 (es. 1440x1800)
    return { outW, outH, useBackdropFit: isLandscape };
  }

  if (frameMode === "crop_4_5") {
    const outH = maxLongSide;
    const outW = Math.round(outH * 0.8);
    return { outW, outH, useBackdropFit: false };
  }

  if (frameMode === "fit_4_5") {
    const outH = maxLongSide;
    const outW = Math.round(outH * 0.8);
    return { outW, outH, useBackdropFit: true };
  }

  if (frameMode === "crop_3_4") {
    const outH = maxLongSide;
    const outW = Math.round(outH * 0.75); // 3:4 (es. 1350x1800)
    return { outW, outH, useBackdropFit: false };
  }

  if (frameMode === "square_1_1") {
    const side = Math.min(maxLongSide, 1600);
    return { outW: side, outH: side, useBackdropFit: false };
  }

  // "original"
  let outW = srcW;
  let outH = srcH;
  if (outW > maxLongSide || outH > maxLongSide) {
    if (outW >= outH) {
      outH = Math.round((outH * maxLongSide) / outW);
      outW = maxLongSide;
    } else {
      outW = Math.round((outW * maxLongSide) / outH);
      outH = maxLongSide;
    }
  }
  return { outW: Math.max(1, outW), outH: Math.max(1, outH), useBackdropFit: false };
}

/**
 * Renderizza la foto applicando rotazione, ritaglio/inquadratura e miglioramento grafico da studio
 * direttamente sul Canvas fornito.
 */
export function renderStudioCanvas(
  sourceImg: HTMLImageElement,
  targetCanvas: HTMLCanvasElement,
  settings: PhotoStudioSettings,
  maxLongSide = 1800,
  cachedStats?: ImageAutoStats,
): { width: number; height: number } {
  const stats = cachedStats ?? analyzeImageHistogram(sourceImg);

  // 1. Calcola dimensioni sorgente post-rotazione
  const isRotated90 = settings.rotation === 90 || settings.rotation === 270;
  const rotatedSrcW = isRotated90 ? sourceImg.naturalHeight || sourceImg.height : sourceImg.naturalWidth || sourceImg.width;
  const rotatedSrcH = isRotated90 ? sourceImg.naturalWidth || sourceImg.width : sourceImg.naturalHeight || sourceImg.height;

  const { outW, outH, useBackdropFit } = computeTargetDimensions(
    rotatedSrcW,
    rotatedSrcH,
    settings.frameMode,
    maxLongSide,
  );

  targetCanvas.width = outW;
  targetCanvas.height = outH;

  const ctx = targetCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { width: outW, height: outH };

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Prepara un canvas intermedio se l'immagine è ruotata
  let drawable: CanvasImageSource = sourceImg;
  if (settings.rotation !== 0) {
    const rotCanvas = document.createElement("canvas");
    rotCanvas.width = rotatedSrcW;
    rotCanvas.height = rotatedSrcH;
    const rotCtx = rotCanvas.getContext("2d");
    if (rotCtx) {
      rotCtx.translate(rotatedSrcW / 2, rotatedSrcH / 2);
      rotCtx.rotate((settings.rotation * Math.PI) / 180);
      const rawW = sourceImg.naturalWidth || sourceImg.width;
      const rawH = sourceImg.naturalHeight || sourceImg.height;
      rotCtx.drawImage(sourceImg, -rawW / 2, -rawH / 2, rawW, rawH);
      drawable = rotCanvas;
    }
  }

  // Sfondo studio base dark (#101010)
  ctx.fillStyle = "#101010";
  ctx.fillRect(0, 0, outW, outH);

  const zoom = clamp(settings.zoom || 1, 1, 2.6);

  if (useBackdropFit) {
    // Disegna uno sfondo studio ambient molto scuro e sfumato
    const bgScale = Math.max(outW / rotatedSrcW, outH / rotatedSrcH) * 1.15;
    const bgW = rotatedSrcW * bgScale;
    const bgH = rotatedSrcH * bgScale;
    ctx.save();
    ctx.filter = "blur(28px) brightness(0.26) saturate(0.7)";
    ctx.drawImage(drawable, (outW - bgW) / 2, (outH - bgH) / 2, bgW, bgH);
    ctx.restore();

    // Disegna l'immagine intera centrata (con eventuale zoom/pan dell'utente)
    const fitScale = Math.min(outW / rotatedSrcW, outH / rotatedSrcH) * zoom;
    const drawW = rotatedSrcW * fitScale;
    const drawH = rotatedSrcH * fitScale;
    const maxShiftX = Math.max(outW * 0.25, Math.abs(outW - drawW) / 2);
    const maxShiftY = Math.max(outH * 0.25, Math.abs(outH - drawH) / 2);
    const offsetX = (outW - drawW) / 2 + settings.panX * maxShiftX;
    const offsetY = (outH - drawH) / 2 + settings.panY * maxShiftY;

    ctx.drawImage(drawable, offsetX, offsetY, drawW, drawH);
  } else {
    // Modalità Cover / Ritaglio E-Commerce con supporto Zoom e Pan
    const baseCoverScale = Math.max(outW / rotatedSrcW, outH / rotatedSrcH);
    const coverScale = baseCoverScale * zoom;
    const drawW = rotatedSrcW * coverScale;
    const drawH = rotatedSrcH * coverScale;

    const maxPanX = Math.max(0, (drawW - outW) / 2);
    const maxPanY = Math.max(0, (drawH - outH) / 2);

    const offsetX = (outW - drawW) / 2 + clamp(settings.panX, -1, 1) * maxPanX;
    const offsetY = (outH - drawH) / 2 + clamp(settings.panY, -1, 1) * maxPanY;

    ctx.drawImage(drawable, offsetX, offsetY, drawW, drawH);
  }

  // Se l'utente ha scelto "original" e tutte le regolazioni sono a zero, non alterare i pixel
  const isNoOpColor =
    settings.preset === "original" &&
    settings.exposure === 0 &&
    settings.shadows === 0 &&
    settings.contrast === 0 &&
    settings.temperature === 0 &&
    settings.saturation === 0 &&
    settings.sharpness === 0 &&
    settings.vignette === 0;

  if (isNoOpColor) {
    return { width: outW, height: outH };
  }

  // 2. Calcola parametri effettivi (sommando l'auto-adattamento intelligente in modalità auto_studio)
  let effExposure = settings.exposure;
  let effShadows = settings.shadows;
  const effContrast = settings.contrast;
  let effTemp = settings.temperature;
  let blackPoint = 0;
  let whitePoint = 255;

  if (settings.preset === "auto_studio") {
    // Se la foto del telefono è sottoesposta (mediana bassa), schiarisci automaticamente in modo deciso ma naturale
    if (stats.p50 < 120) {
      effExposure += clamp((120 - stats.p50) * 0.38, 0, 22);
      effShadows += clamp((125 - stats.p50) * 0.55, 0, 32);
    } else if (stats.p50 > 180) {
      // Se troppo sovraesposta, recupera un filo le alte luci
      effExposure -= clamp((stats.p50 - 180) * 0.22, 0, 10);
    }

    // Auto-levels delicato: non schiacciare i neri se la foto è già scura
    blackPoint = stats.p50 < 105 ? 0 : clamp(stats.p5 * 0.4, 0, 12);
    whitePoint = clamp(255 - (255 - stats.p95) * 0.45, 232, 255);

    // Se rileva luce gialla da lampadina interna, raffredda automaticamente per pulire i bianchi
    if (stats.warmCast > 0.04) {
      effTemp -= clamp(stats.warmCast * 65, 0, 24);
    }
  } else if (settings.preset === "denim_detail" || settings.preset === "streetwear_contrast") {
    blackPoint = stats.p50 < 100 ? 0 : clamp(stats.p5 * 0.45, 0, 14);
    whitePoint = clamp(255 - (255 - stats.p95) * 0.45, 235, 255);
  }

  // 3. Pre-calcola la curva tonale su Luminanza (toneLut 0..255) così il contrasto non altera le tinte nelle ombre
  const toneLut = new Uint8Array(256);

  const expFactor = Math.pow(2, effExposure / 45);
  const shadowStrength = effShadows / 100; // 0 .. 0.9
  const contrastNormalized = effContrast / 100; // -0.3 .. +0.45
  const contrastSlope = Math.tan(((contrastNormalized + 1) * Math.PI) / 4);

  // Bilanciamento bianco (temperatura: valori negativi = togli giallo / più blu, positivi = più caldo)
  const rTempMult = 1 + (effTemp / 100) * 0.28;
  const gTempMult = 1 - Math.abs(effTemp / 100) * 0.02;
  const bTempMult = 1 - (effTemp / 100) * 0.34;

  const range = Math.max(1, whitePoint - blackPoint);

  for (let i = 0; i < 256; i++) {
    // Auto-levels normalization
    let v = clamp((i - blackPoint) / range, 0, 1);

    // Esposizione
    v = clamp(v * expFactor, 0, 1);

    // Shadow lift (apre le ombre sui capi scuri senza bruciare le alte luci)
    if (shadowStrength > 0.001) {
      const shadowMask = (1 - v) * (1 - v);
      v = clamp(v + shadowStrength * 0.52 * shadowMask * Math.sqrt(v + 0.06), 0, 1);
    }

    // Curva di contrasto morbida centrata a 0.45
    if (Math.abs(contrastNormalized) > 0.001) {
      v = clamp((v - 0.45) * contrastSlope + 0.45, 0, 1);
    }

    toneLut[i] = clampByte(v * 255);
  }

  const imgData = ctx.getImageData(0, 0, outW, outH);
  const data = imgData.data;
  const pixelCount = outW * outH;

  const satMult = 1 + settings.saturation / 100;
  const applySat = Math.abs(settings.saturation) > 0.5;

  // Se la nitidezza (sharpness) è attiva, memorizziamo la luminanza per la maschera di contrasto (Unsharp Mask)
  const sharpAmount = (settings.sharpness / 100) * 1.25;
  const lumBuffer = sharpAmount > 0.02 ? new Uint8Array(pixelCount) : null;

  // Vignettatura studio radiale
  const vigStrength = (settings.vignette / 100) * 0.65;
  const halfW = outW / 2;
  const halfH = outH / 2;
  const invHalfW = 1 / Math.max(1, halfW);
  const invHalfH = 1 / Math.max(1, halfH);

  let pIdx = 0;
  for (let y = 0; y < outH; y++) {
    const dy = (y - halfH) * invHalfH;
    const dy2 = dy * dy;

    for (let x = 0; x < outW; x++) {
      const idx = pIdx * 4;

      // A) Applica prima il bilanciamento del bianco (correzione luce gialla interna)
      let r = clampByte(data[idx] * rTempMult);
      let g = clampByte(data[idx + 1] * gTempMult);
      let b = clampByte(data[idx + 2] * bTempMult);

      // B) Applica la curva tonale preservando il rapporto cromatico (Luminance-Preserving Tone Mapping)
      const inLum = (r * 77 + g * 150 + b * 29) >> 8;
      const targetLum = toneLut[inLum];
      if (inLum > 0) {
        const lumRatio = targetLum / inLum;
        r = clampByte(r * lumRatio);
        g = clampByte(g * lumRatio);
        b = clampByte(b * lumRatio);
      } else if (targetLum > 0) {
        r = targetLum;
        g = targetLum;
        b = targetLum;
      }

      // C) Saturazione / vividezza
      const lum = (r * 77 + g * 150 + b * 29) >> 8;
      if (applySat) {
        r = clampByte(lum + (r - lum) * satMult);
        g = clampByte(lum + (g - lum) * satMult);
        b = clampByte(lum + (b - lum) * satMult);
      }

      // D) Vignettatura studio morbida sui bordi
      if (vigStrength > 0.005) {
        const dx = (x - halfW) * invHalfW;
        const dist2 = dx * dx + dy2; // 0 al centro, ~2 agli angoli
        if (dist2 > 0.35) {
          const factor = Math.max(0.35, 1 - (dist2 - 0.35) * 0.55 * vigStrength);
          r = (r * factor) | 0;
          g = (g * factor) | 0;
          b = (b * factor) | 0;
        }
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;

      if (lumBuffer) {
        lumBuffer[pIdx] = (r * 77 + g * 150 + b * 29) >> 8;
      }
      pIdx++;
    }
  }

  // 4. Maschera di Contrasto (Unsharp Mask) per esaltare trama denim, cuciture e aerografo
  if (lumBuffer && sharpAmount > 0.02) {
    const w = outW;
    const h = outH;
    for (let y = 1; y < h - 1; y++) {
      const rowOffset = y * w;
      for (let x = 1; x < w - 1; x++) {
        const centerIdx = rowOffset + x;
        const centerLum = lumBuffer[centerIdx];

        // Media locale 3x3 (croce + angoli)
        const blurLum =
          (lumBuffer[centerIdx - w] +
            lumBuffer[centerIdx + w] +
            lumBuffer[centerIdx - 1] +
            lumBuffer[centerIdx + 1] +
            (centerLum << 1)) /
          6;

        const diff = centerLum - blurLum;
        // Soglia anti-rumore (> 2): esalta solo cuciture, bordi e trama reale del tessuto
        if (diff > 2 || diff < -2) {
          const delta = (diff * sharpAmount) | 0;
          const rgbaIdx = centerIdx * 4;
          data[rgbaIdx] = clampByte(data[rgbaIdx] + delta);
          data[rgbaIdx + 1] = clampByte(data[rgbaIdx + 1] + delta);
          data[rgbaIdx + 2] = clampByte(data[rgbaIdx + 2] + delta);
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return { width: outW, height: outH };
}

/**
 * Esporta un canvas nel formato WebP ottimizzato per e-commerce (con fallback automatico a JPEG).
 */
async function canvasToOptimizedFile(
  canvas: HTMLCanvasElement,
  originalFilename: string,
  quality = 0.87,
): Promise<{ file: File; formatLabel: "WEBP" | "JPG" }> {
  const baseName =
    originalFilename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "foto-prodotto";

  const tryEncode = (mimeType: string, q: number): Promise<Blob | null> =>
    new Promise((resolve) => {
      try {
        canvas.toBlob((blob) => resolve(blob), mimeType, q);
      } catch {
        resolve(null);
      }
    });

  // 1. Prova WebP (formato moderno raccomandato da Google per e-commerce: 70% più leggero e super nitido)
  const webpBlob = await tryEncode("image/webp", quality);
  if (webpBlob && webpBlob.type === "image/webp" && webpBlob.size > 0) {
    return {
      file: new File([webpBlob], `${baseName}.webp`, { type: "image/webp" }),
      formatLabel: "WEBP",
    };
  }

  // 2. Fallback a JPEG ad alta qualità (es. su vecchi browser iOS)
  const jpegBlob = await tryEncode("image/jpeg", 0.89);
  if (jpegBlob && jpegBlob.size > 0) {
    return {
      file: new File([jpegBlob], `${baseName}.jpg`, { type: "image/jpeg" }),
      formatLabel: "JPG",
    };
  }

  throw new Error("Impossibile convertire l'immagine per il web.");
}

/**
 * Carica un File o un URL remoto (usando il proxy admin se necessario per evitare blocchi CORS S3)
 * in un elemento HTMLImageElement pronto per il Canvas.
 */
export async function loadImageElement(source: File | string): Promise<HTMLImageElement> {
  if (source instanceof File) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(source);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Impossibile leggere il file immagine."));
      };
      img.src = objectUrl;
    });
  }

  const loadFromUrl = (url: string, useCors: boolean): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      if (useCors) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Caricamento immagine non riuscito."));
      img.src = url;
    });

  // Se è un URL locale (/uploads/... o /images/...), caricalo diretto
  if (source.startsWith("/") && !source.startsWith("/wp-content/")) {
    return loadFromUrl(source, false);
  }

  // Se è su S3 o dominio esterno, usa prima il nostro proxy admin per garantire zero errori CORS sul Canvas
  const proxiedUrl = `/api/admin/uploads/proxy/?url=${encodeURIComponent(
    source.startsWith("/wp-content/") ? `https://jacopopeca.com${source}` : source,
  )}`;

  try {
    return await loadFromUrl(proxiedUrl, false);
  } catch {
    return await loadFromUrl(source, true);
  }
}

/**
 * Funzione principale di conversione e miglioramento automatico istantaneo durante l'upload.
 */
export async function processPhonePhotoForWeb(
  rawFile: File,
  settings: PhotoStudioSettings,
): Promise<ProcessedPhotoResult> {
  if (typeof window === "undefined" || rawFile.type === "image/gif") {
    return {
      file: rawFile,
      width: 1200,
      height: 1500,
      originalSizeBytes: rawFile.size,
      outputSizeBytes: rawFile.size,
      formatLabel: "JPG",
      appliedSettings: settings,
    };
  }

  const img = await loadImageElement(rawFile);
  const canvas = document.createElement("canvas");
  const { width, height } = renderStudioCanvas(img, canvas, settings, 1800);
  const { file, formatLabel } = await canvasToOptimizedFile(canvas, rawFile.name, 0.87);

  return {
    file,
    width,
    height,
    originalSizeBytes: rawFile.size,
    outputSizeBytes: file.size,
    formatLabel,
    appliedSettings: settings,
  };
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1000) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

// ── COMPONENTE MODALE STUDIO FOTOGRAFICO INTERATTIVO ────────────────────────

export function PhotoStudioModal({
  isOpen,
  sourceFile,
  sourceUrl,
  fileName,
  initialSettings,
  onClose,
  onApply,
}: {
  isOpen: boolean;
  sourceFile?: File | null;
  sourceUrl?: string;
  fileName?: string;
  initialSettings?: PhotoStudioSettings;
  onClose: () => void;
  onApply: (result: ProcessedPhotoResult) => Promise<void> | void;
}) {
  const [settings, setSettings] = useState<PhotoStudioSettings>(
    () => initialSettings ?? buildDefaultStudioSettings("auto_studio", "smart_4_5"),
  );
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [imageStats, setImageStats] = useState<ImageAutoStats | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingImg, setIsLoadingImg] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showOriginalCompare, setShowOriginalCompare] = useState(false);
  const [previewDims, setPreviewDims] = useState<{ width: number; height: number }>({
    width: 1440,
    height: 1800,
  });

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  useEffect(() => {
    if (!isOpen) return;
    setSettings(initialSettings ?? buildDefaultStudioSettings("auto_studio", "smart_4_5"));
    setShowOriginalCompare(false);
    setLoadError(null);

    const src = sourceFile || sourceUrl;
    if (!src) return;

    let cancelled = false;
    setIsLoadingImg(true);

    loadImageElement(src)
      .then((img) => {
        if (cancelled) return;
        const stats = analyzeImageHistogram(img);
        setLoadedImg(img);
        setImageStats(stats);
        setIsLoadingImg(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Impossibile aprire la foto nello Studio.",
        );
        setIsLoadingImg(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, sourceFile, sourceUrl, initialSettings]);

  // Aggiorna l'anteprima in tempo reale sul canvas
  useEffect(() => {
    if (!isOpen || !loadedImg || !previewCanvasRef.current) return;

    const effectiveSettings: PhotoStudioSettings = showOriginalCompare
      ? {
          ...settings,
          preset: "original",
          exposure: 0,
          shadows: 0,
          contrast: 0,
          temperature: 0,
          saturation: 0,
          sharpness: 0,
          vignette: 0,
        }
      : settings;

    renderStudioCanvas(loadedImg, previewCanvasRef.current, effectiveSettings, 760, imageStats);

    // Calcola le dimensioni reali di esportazione HD (max 1800px)
    const isRotated90 = settings.rotation === 90 || settings.rotation === 270;
    const rW = isRotated90 ? loadedImg.naturalHeight : loadedImg.naturalWidth;
    const rH = isRotated90 ? loadedImg.naturalWidth : loadedImg.naturalHeight;
    const fullDims = computeTargetDimensions(rW, rH, settings.frameMode, 1800);
    setPreviewDims({ width: fullDims.outW, height: fullDims.outH });
  }, [isOpen, loadedImg, settings, showOriginalCompare, imageStats]);

  if (!isOpen) return null;

  function selectPreset(presetId: PhotoPresetId) {
    const presetObj = PHOTO_PRESETS.find((p) => p.id === presetId) ?? PHOTO_PRESETS[0];
    setSettings((cur) => ({
      ...cur,
      preset: presetId,
      ...presetObj.defaults,
    }));
  }

  function rotate90() {
    setSettings((cur) => ({
      ...cur,
      rotation: (((cur.rotation + 90) % 360) as 0 | 90 | 180 | 270),
    }));
  }

  function resetFraming() {
    setSettings((cur) => ({
      ...cur,
      rotation: 0,
      zoom: 1,
      panX: 0,
      panY: 0,
    }));
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: settings.panX,
      initialPanY: settings.panY,
    };
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!dragStateRef.current.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - dragStateRef.current.startX) / Math.max(120, rect.width * 0.45);
    const dy = (e.clientY - dragStateRef.current.startY) / Math.max(120, rect.height * 0.45);

    setSettings((cur) => ({
      ...cur,
      panX: clamp(dragStateRef.current.initialPanX + dx, -1, 1),
      panY: clamp(dragStateRef.current.initialPanY + dy, -1, 1),
    }));
  }

  function handlePointerUp() {
    dragStateRef.current.active = false;
  }

  async function handleConfirmApply() {
    if (!loadedImg) return;
    setIsApplying(true);
    setLoadError(null);

    try {
      const exportCanvas = document.createElement("canvas");
      const { width, height } = renderStudioCanvas(
        loadedImg,
        exportCanvas,
        settings,
        1800,
        imageStats,
      );
      const { file, formatLabel } = await canvasToOptimizedFile(
        exportCanvas,
        fileName || sourceFile?.name || "foto-studio-jp.webp",
        0.88,
      );

      await onApply({
        file,
        width,
        height,
        originalSizeBytes: sourceFile?.size || file.size,
        outputSizeBytes: file.size,
        formatLabel,
        appliedSettings: settings,
      });
      onClose();
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Errore durante l'esportazione della foto.",
      );
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Studio Ottimizzazione Foto Prodotto"
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden border-2 border-white/25 bg-[#121212] shadow-2xl">
        {/* Intestazione Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/12 bg-[#181818] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#e01010] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                ✨ Studio Foto Artigianali
              </span>
              <span className="border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Output WebP HD · {previewDims.width}×{previewDims.height} px
              </span>
            </div>
            <h3 className="mt-1 text-lg font-bold text-white sm:text-xl">
              Ottimizza Resa Grafica e Formato per lo Shop
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            ✕ Chiudi
          </button>
        </div>

        {/* Corpo principale: Anteprima a sinistra, Controlli a destra */}
        <div className="grid flex-1 gap-6 overflow-y-auto p-5 lg:grid-cols-12">
          {/* Colonna Anteprima Interattiva */}
          <div className="flex flex-col items-center justify-between border border-white/12 bg-black/70 p-4 lg:col-span-6">
            <div className="mb-2 flex w-full items-center justify-between text-xs text-white/60">
              <span>
                {showOriginalCompare ? "📷 Vista: Foto Originale" : "✨ Vista: Foto Ottimizzata per lo Shop"}
              </span>
              <button
                type="button"
                onPointerDown={() => setShowOriginalCompare(true)}
                onPointerUp={() => setShowOriginalCompare(false)}
                onPointerLeave={() => setShowOriginalCompare(false)}
                onClick={() => setShowOriginalCompare((v) => !v)}
                className={`cursor-pointer border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                  showOriginalCompare
                    ? "border-amber-400 bg-amber-400 text-black"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {showOriginalCompare ? "Rilascia per Studio" : "👁️ Confronta Prima / Dopo"}
              </button>
            </div>

            {/* Area Canvas */}
            <div className="relative flex min-h-[340px] w-full flex-1 items-center justify-center overflow-hidden bg-[#080808] p-2 sm:min-h-[430px]">
              {isLoadingImg && (
                <div className="flex flex-col items-center gap-3 text-xs text-white/60">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Analisi luce e dettagli della foto in corso…</span>
                </div>
              )}

              {loadError && (
                <div className="max-w-xs border border-red-400/40 bg-red-500/15 p-4 text-center text-xs text-red-200">
                  ⚠️ {loadError}
                </div>
              )}

              <canvas
                ref={previewCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`max-h-[440px] max-w-full cursor-grab touch-none border border-white/15 shadow-2xl active:cursor-grabbing ${
                  isLoadingImg || loadError ? "hidden" : "block"
                }`}
              />
            </div>

            {/* Barra strumenti rapidi sotto la foto: Ruota, Zoom, Centra */}
            <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={rotate90}
                  className="cursor-pointer border border-white/20 bg-white/8 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white hover:text-black"
                >
                  🔄 Ruota 90°
                </button>
                <button
                  type="button"
                  onClick={resetFraming}
                  className="cursor-pointer border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white/70 transition hover:text-white"
                >
                  🎯 Ricentra
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/75">
                <span>🔍 Zoom:</span>
                <input
                  type="range"
                  min="1"
                  max="2.2"
                  step="0.05"
                  value={settings.zoom}
                  onChange={(e) =>
                    setSettings((cur) => ({ ...cur, zoom: Number.parseFloat(e.target.value) }))
                  }
                  className="w-24 accent-[#e01010]"
                />
                <span className="w-10 text-right font-mono text-[11px]">
                  {settings.zoom.toFixed(1)}×
                </span>
              </div>
            </div>
            <p className="mt-1.5 text-center text-[11px] text-white/40">
              💡 Suggerimento: puoi trascinare la foto con il dito o con il mouse per centrare perfettamente il capo.
            </p>
          </div>

          {/* Colonna Controlli Studio (1-Click Presets + Formato + Regolazioni) */}
          <div className="flex flex-col gap-5 lg:col-span-6">
            {/* 1. Preset 1-Click Resa Grafica */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                1. Scegli la Resa Grafica (1 Click)
              </span>
              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PHOTO_PRESETS.map((preset) => {
                  const active = settings.preset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => selectPreset(preset.id)}
                      className={`cursor-pointer border p-2.5 text-left transition ${
                        active
                          ? "border-emerald-400 bg-emerald-500/20 text-white shadow"
                          : "border-white/12 bg-black/40 text-white/75 hover:border-white/35 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold">{preset.shortLabel}</span>
                        {preset.badge && (
                          <span className="bg-emerald-400 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-black">
                            Top
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-white/55">
                {PHOTO_PRESETS.find((p) => p.id === settings.preset)?.description}
              </p>
            </div>

            {/* 2. Formato & Inquadratura per lo Shop */}
            <div className="border-t border-white/10 pt-4">
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                2. Formato & Inquadratura E-Commerce
              </span>
              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PHOTO_FRAME_MODES.map((mode) => {
                  const active = settings.frameMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setSettings((cur) => ({ ...cur, frameMode: mode.id, panX: 0, panY: 0 }))
                      }
                      className={`cursor-pointer border px-2.5 py-2 text-left text-xs font-bold transition ${
                        active
                          ? "border-white bg-white text-black"
                          : "border-white/12 bg-black/40 text-white/75 hover:border-white/35 hover:text-white"
                      }`}
                    >
                      {mode.shortLabel}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-white/50">
                {PHOTO_FRAME_MODES.find((m) => m.id === settings.frameMode)?.description}
              </p>
            </div>

            {/* 3. Rifinitura Manuale Luce, Dettaglio e Colore */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                  3. Ritocco Fine Luce & Tessuto (Opzionale)
                </span>
                <button
                  type="button"
                  onClick={() => selectPreset(settings.preset)}
                  className="cursor-pointer text-[11px] text-white/50 underline hover:text-white"
                >
                  Ripristina valori preset
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <SliderControl
                  label="☀️ Luminosità"
                  value={settings.exposure}
                  min={-35}
                  max={35}
                  onChange={(v) => setSettings((cur) => ({ ...cur, exposure: v }))}
                />
                <SliderControl
                  label="🌗 Schiarisci Ombre (Capi Scuri)"
                  value={settings.shadows}
                  min={0}
                  max={60}
                  onChange={(v) => setSettings((cur) => ({ ...cur, shadows: v }))}
                />
                <SliderControl
                  label="⚡ Nitidezza Cuciture & Denim"
                  value={settings.sharpness}
                  min={0}
                  max={70}
                  onChange={(v) => setSettings((cur) => ({ ...cur, sharpness: v }))}
                />
                <SliderControl
                  label="🌡️ Luce (Fredda Anti-Giallo ↔ Calda)"
                  value={settings.temperature}
                  min={-40}
                  max={40}
                  onChange={(v) => setSettings((cur) => ({ ...cur, temperature: v }))}
                />
                <SliderControl
                  label="🎚️ Contrasto Studio"
                  value={settings.contrast}
                  min={-25}
                  max={40}
                  onChange={(v) => setSettings((cur) => ({ ...cur, contrast: v }))}
                />
                <SliderControl
                  label="🌑 Vignettatura Bordi"
                  value={settings.vignette}
                  min={0}
                  max={45}
                  onChange={(v) => setSettings((cur) => ({ ...cur, vignette: v }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Azioni */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/12 bg-[#181818] px-5 py-4">
          <p className="text-xs text-white/55">
            ⚡ Conversione automatica in <strong className="text-white">WebP ad alta definizione</strong> per un caricamento istantaneo su smartphone e desktop.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isApplying}
              onClick={onClose}
              className="cursor-pointer border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/75 hover:bg-white/10 hover:text-white"
            >
              Annulla
            </button>
            <button
              type="button"
              disabled={isApplying || isLoadingImg || Boolean(loadError)}
              onClick={handleConfirmApply}
              className="cursor-pointer border-2 border-[#e01010] bg-[#e01010] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg transition hover:bg-[#b80d0d] disabled:opacity-40"
            >
              {isApplying ? "Ottimizzazione in corso…" : "✓ Applica e Aggiorna Foto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="block border border-white/10 bg-black/35 px-3 py-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-white/80">{label}</span>
        <span className="font-mono text-white/60">{value > 0 ? `+${value}` : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        className="mt-1.5 w-full accent-[#e01010]"
      />
    </label>
  );
}
