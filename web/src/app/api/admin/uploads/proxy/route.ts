import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_HOST_PATTERNS = [
  /^jacopopeca\.com$/i,
  /^www\.jacopopeca\.com$/i,
  /\.amazonaws\.com$/i,
];

function isAllowedImageUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }

    const assetBase = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
    if (assetBase) {
      try {
        const assetUrl = new URL(assetBase);
        if (parsed.hostname.toLowerCase() === assetUrl.hostname.toLowerCase()) {
          return parsed;
        }
      } catch {
        // ignore invalid env URL
      }
    }

    if (ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url")?.trim() ?? "";

  const validatedUrl = isAllowedImageUrl(target);
  if (!validatedUrl) {
    return NextResponse.json(
      { error: "URL immagine esterno non consentito dal proxy." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(validatedUrl.toString(), {
      headers: { Accept: "image/*,*/*;q=0.8" },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Impossibile recuperare l'immagine (${upstream.status}).` },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Errore durante il caricamento dell'immagine remota." },
      { status: 502 },
    );
  }
}

