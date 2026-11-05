import { randomUUID } from "node:crypto";
import { requirePrisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/email";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token || !/^[a-f0-9-]{36}$/.test(token)) return new Response("Link non valido", { status: 400 });
  return new Response(`<!doctype html><html lang="it"><meta name="viewport" content="width=device-width"><title>Conferma newsletter</title><body><h1>Newsletter Jacopo Peca</h1><p>Conferma di voler ricevere novità e selezioni dal laboratorio.</p><form method="POST"><input type="hidden" name="token" value="${token}"><button>Conferma iscrizione</button></form></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
export async function POST(request: Request) {
  const token = String((await request.formData()).get("token") || "");
  const db = requirePrisma();
  const sub = await db.newsletterSubscription.findUnique({ where: { confirmationToken: token } });
  if (!sub || Date.now() - sub.confirmationRequestedAt.getTime() > 7 * 86400000) return new Response("Link scaduto. Richiedi una nuova iscrizione.", { status: 400 });
  await db.$transaction(async tx => {
    const confirmed = await tx.newsletterSubscription.updateMany({ where: { email: sub.email, confirmationToken: token }, data: { confirmedAt: new Date(), revokedAt: null, confirmationToken: null, token: randomUUID() } });
    if (!confirmed.count) throw new Error("Conferma già utilizzata");
    await tx.customer.updateMany({ where: { email: sub.email }, data: { marketingOpt: true } });
    const key = `welcome:${sub.email}:${sub.confirmationRequestedAt.toISOString()}`;
    await tx.emailJob.upsert({ where: { dedupeKey: key }, update: { dedupeKey: key }, create: { dedupeKey: key, email: sub.email, kind: "welcome", payload: { title: "Benvenuto nel laboratorio Jacopo Peca", body: "Denim lavorato a mano, dettagli unici e nuove uscite. Ti scriveremo due volte al mese: puoi disiscriverti in ogni momento. Inizia dai capi disponibili nello shop.", url: `${siteUrl()}/shop`, label: "Entra nello shop" } } });
  });
  return new Response("Iscrizione confermata. Benvenuto da Jacopo Peca!", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
