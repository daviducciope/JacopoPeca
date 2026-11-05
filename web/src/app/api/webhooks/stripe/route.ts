import { NextResponse } from "next/server";
import Stripe from "stripe";
import { releaseReservation } from "@/lib/checkout-reservations";
import { enqueueEmail, subscribeNewsletter, siteUrl } from "@/lib/email";

import { updateAdminOrder } from "@/lib/order-data";
import { isDatabaseConfigured, requirePrisma } from "@/lib/prisma";
import { recordStripeCheckoutSession } from "@/lib/stripe-order-sync";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "DATABASE_URL non configurato." }, { status: 503 });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook non configurato." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Firma Stripe mancante." }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Firma Stripe non valida." },
      { status: 400 },
    );
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await recordStripeCheckoutSession(event.data.object as Stripe.Checkout.Session);
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (charge.refunded && intent) {
        const order = await requirePrisma().order.findUnique({ where: { stripePaymentIntentId: intent } });
        if (order && order.status !== "REFUNDED") await updateAdminOrder(order.id, { status: "REFUNDED" });
      }
    }
    if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      const expired = event.data.object as Stripe.Checkout.Session;
      if (expired.metadata?.store === "jacopopeca" && expired.metadata?.reservation_id) await releaseReservation(expired.metadata.reservation_id);
    }
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email?.trim().toLowerCase() || session.customer_email;
      if (session.metadata?.store === "jacopopeca" && session.metadata?.marketing_opt === "true" && email) {
        await subscribeNewsletter(email, "checkout");
        await enqueueEmail(`cart:${session.id}`, email, "cart-reminder", {
          title: "Il tuo denim ti aspetta",
          body: "Hai lasciato alcuni capi nel carrello. Se vuoi riprendere l’acquisto, torna allo shop: prezzi, taglie e disponibilità saranno verificati nuovamente.",
          url: `${siteUrl()}/shop`, label: "Riprendi l’acquisto",
        }, new Date(Date.now() + 24 * 3600000));
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error", error);
    return NextResponse.json({ error: "Errore elaborazione webhook Stripe." }, { status: 500 });
  }
}
