import "server-only";
import { requirePrisma } from "@/lib/prisma";
import Stripe from "stripe";

type ReservationItem = { v: string; q: number };
export async function reserveCheckout(items: ReservationItem[]) {
  return requirePrisma().$transaction(async tx => {
    for (const item of [...items].sort((a,b) => a.v.localeCompare(b.v))) {
      const updated = await tx.productVariant.updateMany({ where: { id: item.v, stock: { gte: item.q } }, data: { stock: { decrement: item.q } } });
      if (!updated.count) throw new Error("Uno dei capi non è più disponibile nella quantità richiesta.");
    }
    return tx.checkoutReservation.create({ data: { items, expiresAt: new Date(Date.now() + 2 * 3600000) } });
  });
}
export async function releaseReservation(id: string) {
  const db = requirePrisma();
  await db.$transaction(async tx => {
    const reservation = await tx.checkoutReservation.findUnique({ where: { id } });
    if (!reservation || reservation.state !== "HOLD") return;
    const claimed = await tx.checkoutReservation.updateMany({ where: { id, state: "HOLD" }, data: { state: "RELEASED" } });
    if (!claimed.count) return;
    for (const item of reservation.items as ReservationItem[]) {
      await tx.productVariant.updateMany({ where: { id: item.v }, data: { stock: { increment: item.q } } });
    }
  });
}
export async function cleanExpiredReservations() {
  const db = requirePrisma();
  if (!process.env.STRIPE_SECRET_KEY) return;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const due = await db.checkoutReservation.findMany({ where: { state: "HOLD", expiresAt: { lte: new Date() } }, take: 40 });
  for (const reservation of due) {
    let session: Stripe.Checkout.Session | undefined;
    if (reservation.sessionId) session = await stripe.checkout.sessions.retrieve(reservation.sessionId);
    else {
      // Recover ambiguous network failures: never free stock for a completed payment.
      for await (const candidate of stripe.checkout.sessions.list({ created: { gte: Math.floor(reservation.createdAt.getTime() / 1000) - 60, lte: Math.floor(reservation.expiresAt.getTime() / 1000) }, limit: 100 })) {
        if (candidate.metadata?.reservation_id === reservation.id) { session = candidate; break; }
      }
      if (session) await db.checkoutReservation.update({ where: { id: reservation.id }, data: { sessionId: session.id } });
    }
    if (!session || session.status === "expired") await releaseReservation(reservation.id);
    if (session?.payment_status === "paid") {
      const { recordStripeCheckoutSession } = await import("@/lib/stripe-order-sync");
      await recordStripeCheckoutSession(session);
    }
  }
}
