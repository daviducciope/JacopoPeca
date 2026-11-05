import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeNewsletter } from "@/lib/email";
export const dynamic = "force-dynamic";
const schema = z.object({ email: z.email().max(254).transform(v => v.trim().toLowerCase()), consent: z.literal(true), website: z.string().max(0).optional() });
export async function POST(request: Request) {
  const publicOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin;
  const allowedOrigins = new Set([publicOrigin]);
  if (publicOrigin === "https://jacopopeca.com") {
    allowedOrigins.add("https://www.jacopopeca.com");
    allowedOrigins.add("https://staging.jacopopeca.com");
  }
  if (request.headers.get("origin") && !allowedOrigins.has(request.headers.get("origin")!)) return NextResponse.json({ error: "Origine non valida" }, { status: 403 });
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Inserisci un’email valida e accetta l’iscrizione." }, { status: 400 });
    await subscribeNewsletter(parsed.data.email, "footer");
    return NextResponse.json({ message: "Controlla la tua email per confermare l’iscrizione." });
  } catch { return NextResponse.json({ error: "Iscrizione temporaneamente non disponibile. Riprova più tardi." }, { status: 503 }); }
}
