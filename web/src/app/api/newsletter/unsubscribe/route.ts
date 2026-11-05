import { requirePrisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const db = requirePrisma();
  const sub = await db.newsletterSubscription.findUnique({ where: { token } });
  if (!sub) return new Response("Link non valido", { status: 400 });
  await db.$transaction(async tx => {
    await tx.newsletterSubscription.update({ where: { token }, data: { revokedAt: new Date(), confirmationToken: null } });
    await tx.customer.updateMany({ where: { email: sub.email }, data: { marketingOpt: false } });
    await tx.emailJob.updateMany({ where: { email: sub.email, sentAt: null, kind: { in: ["welcome", "cart-reminder", "care", "editorial", "winback", "confirmation"] } }, data: { cancelledAt: new Date() } });
  });
  return new Response("Disiscrizione completata. Non riceverai altre email promozionali.", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token || !/^[a-f0-9-]{36}$/.test(token)) return new Response("Link non valido", { status: 400 });
  return new Response('<!doctype html><html lang="it"><meta name="viewport" content="width=device-width"><title>Disiscrizione</title><h1>Newsletter Jacopo Peca</h1><form method="POST"><button>Conferma disiscrizione</button></form></html>', { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
