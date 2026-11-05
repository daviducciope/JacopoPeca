import "server-only";
import { randomUUID } from "node:crypto";
import { requirePrisma } from "@/lib/prisma";
import { emailContent } from "@/lib/email-content";
import type { Prisma } from "@prisma/client";

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://jacopopeca.com").replace(/\/$/, "");
const marketingKinds = new Set(["welcome", "cart-reminder", "care", "editorial", "winback"]);

export async function enqueueEmail(key: string, email: string, kind: string, payload: Prisma.InputJsonObject, scheduledAt = new Date()) {
  return requirePrisma().emailJob.upsert({
    where: { dedupeKey: key }, update: { dedupeKey: key },
    create: { dedupeKey: key, email, kind, payload, scheduledAt },
  });
}

export async function subscribeNewsletter(email: string, source: string) {
  const db = requirePrisma();
  await db.newsletterSubscription.createMany({ data: [{ email, source }], skipDuplicates: true });
  let subscription = await db.newsletterSubscription.findUniqueOrThrow({ where: { email } });
  if (subscription.confirmedAt && !subscription.revokedAt) return;
  const threshold = new Date(Date.now() - 24 * 3600000);
  await db.newsletterSubscription.updateMany({
    where: { email, confirmationRequestedAt: { lte: threshold } },
    data: { confirmationToken: randomUUID(), confirmationRequestedAt: new Date(), source },
  });
  subscription = await db.newsletterSubscription.findUniqueOrThrow({ where: { email } });
  if (!subscription.confirmationToken) return;
  const url = `${siteUrl()}/api/newsletter/confirm?token=${subscription.confirmationToken}`;
  await enqueueEmail(`confirm:${subscription.confirmationToken}`, email, "confirmation", {
    title: "Conferma l’iscrizione a Jacopo Peca",
    body: "Hai richiesto novità dal laboratorio e nuove uscite. Conferma con il pulsante entro 7 giorni. Se non hai richiesto l’iscrizione, ignora questa email.",
    url, label: "Conferma iscrizione",
  });
}

export async function processEmailJobs(onlyEmail?: string) {
  const db = requirePrisma();
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) throw new Error("Mittente o API SendGrid non configurati");
  const now = new Date();
  // A crash after provider acceptance is ambiguous: expose the message for review
  // rather than automatically sending a possible duplicate.
  await db.emailJob.updateMany({ where: { lockedAt: { lt: new Date(now.getTime() - 15 * 60000) }, sentAt: null, cancelledAt: null }, data: { cancelledAt: now, lastError: "Worker interrotto: verificare consegna su SendGrid prima di riattivare", lockedAt: null } });
  const candidates = await db.emailJob.findMany({
    where: { ...(onlyEmail ? { email: onlyEmail } : {}), sentAt: null, cancelledAt: null, scheduledAt: { lte: now }, attempts: { lt: 5 }, lockedAt: null },
    orderBy: { scheduledAt: "asc" }, take: 40,
  });
  let sent = 0;
  for (const candidate of candidates) {
    // Atomic claim prevents concurrent workers sending the same message.
    const claim = await db.emailJob.updateMany({ where: { id: candidate.id, lockedAt: null, sentAt: null, cancelledAt: null }, data: { lockedAt: now, attempts: { increment: 1 } } });
    if (!claim.count) continue;
    try {
      let unsubscribe: string | undefined;
      if (marketingKinds.has(candidate.kind)) {
        const sub = await db.newsletterSubscription.findUnique({ where: { email: candidate.email } });
        if (!sub?.confirmedAt || sub.revokedAt) {
          await db.emailJob.update({ where: { id: candidate.id }, data: { cancelledAt: now, lockedAt: null } });
          continue;
        }
        if (candidate.kind === "cart-reminder") {
          const purchased = await db.order.findFirst({ where: { customer: { email: candidate.email }, status: { in: ["PAID", "FULFILLED"] }, createdAt: { gte: candidate.createdAt } } });
          if (purchased) {
            await db.emailJob.update({ where: { id: candidate.id }, data: { cancelledAt: now, lockedAt: null } });
            continue;
          }
        }
        unsubscribe = `${siteUrl()}/api/newsletter/unsubscribe?token=${sub.token}`;
        const recent = await db.emailJob.findFirst({ where: { email: candidate.email, kind: { in: [...marketingKinds] }, sentAt: { gte: new Date(now.getTime() - 7 * 86400000) } } });
        if (recent && candidate.kind === "cart-reminder") {
          await db.emailJob.update({ where: { id: candidate.id }, data: { cancelledAt: now, lockedAt: null } });
          continue;
        }
        if (recent) {
          await db.emailJob.update({ where: { id: candidate.id }, data: { lockedAt: null, attempts: { decrement: 1 }, scheduledAt: new Date(recent.sentAt!.getTime() + 7 * 86400000) } });
          continue;
        }
      }
      let p = candidate.payload as Record<string, string>;
      if (candidate.kind === "editorial") {
        const refreshed = await editorialPayload(candidate.email, candidate.createdAt.getUTCDate());
        if (!refreshed) {
          await db.emailJob.update({ where: { id: candidate.id }, data: { cancelledAt: now, lockedAt: null } });
          continue;
        }
        p = refreshed;
      }
      const content = emailContent(p.title, p.body, p.url, p.label, unsubscribe);
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST", signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: candidate.email }] }],
          from: { email: process.env.SENDGRID_FROM_EMAIL, name: "Jacopo Peca" },
          ...(process.env.SENDGRID_REPLY_TO_EMAIL ? { reply_to: { email: process.env.SENDGRID_REPLY_TO_EMAIL } } : {}),
          subject: p.title,
          content: [{ type: "text/plain", value: content.text }, { type: "text/html", value: content.html }],
          ...(unsubscribe ? { headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }, ...(process.env.SENDGRID_MARKETING_GROUP_ID ? { asm: { group_id: Number(process.env.SENDGRID_MARKETING_GROUP_ID) } } : {}) } : {}),
        }),
      });
      if (!response.ok) throw new Error(`SendGrid HTTP ${response.status}`);
      await db.emailJob.update({ where: { id: candidate.id }, data: { sentAt: new Date(), lockedAt: null, lastError: null } });
      sent++;
    } catch (error) {
      await db.emailJob.update({ where: { id: candidate.id }, data: { lockedAt: null, lastError: error instanceof Error ? error.message : "Invio fallito", scheduledAt: new Date(Date.now() + 2 ** candidate.attempts * 15 * 60000) } });
    }
  }
  return { checked: candidates.length, sent };
}

async function editorialPayload(email: string, day: number) {
  const products = await requirePrisma().product.findMany({
    where: { status: "ACTIVE", variants: { some: { stock: { gt: 0 } } }, orderItems: { none: { order: { customer: { email }, status: { in: ["PAID", "FULFILLED"] } } } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 30,
  });
  const offset = products.length ? (day < 10 ? 0 : 3) % products.length : 0;
  const ordered = [...products.slice(offset), ...products.slice(0, offset)];
  const picks: typeof products = [];
  for (const product of ordered) {
    if (!picks.some(p => p.categoryId === product.categoryId)) picks.push(product);
    if (picks.length === 3) break;
  }
  if (!picks.length) return null;
  return {
    title: day < 10 ? "Dal laboratorio: la selezione Jacopo Peca" : "Denim da vivere: dettagli e nuovi abbinamenti",
    body: `Capi artigianali disponibili in laboratorio:\n\n${picks.map(p => `${p.name} — ${(p.priceCents / 100).toFixed(2)} €`).join("\n")}\n\nScopri materiali, taglie e disponibilità aggiornate nello shop.`,
    url: `${siteUrl()}/product/${picks[0].slug}`, label: "Scopri la selezione",
  };
}

export async function scheduleCampaigns() {
  const db = requirePrisma();
  const today = new Date();
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit" }).format(today);
  const day = Number(date.slice(-2));
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", hour: "2-digit", hourCycle: "h23" }).format(today));
  if (![1, 15].includes(day) || hour < 10) return;
  const subscribers = await db.newsletterSubscription.findMany({ where: { confirmedAt: { not: null }, revokedAt: null } });
  for (const sub of subscribers) {
    const payload = await editorialPayload(sub.email, day);
    if (payload) await enqueueEmail(`editorial:${date}:${sub.email}`, sub.email, "editorial", payload);
  }
}
