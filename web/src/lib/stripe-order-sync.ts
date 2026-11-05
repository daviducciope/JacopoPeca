import "server-only";

import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { subscribeNewsletter, siteUrl } from "@/lib/email";
import { serializeOrderMeta, type OrderAddress } from "@/lib/order-data";
import { requirePrisma } from "@/lib/prisma";

type CheckoutMetadataItem = {
  p: string;
  v: string;
  s: string;
  q: number;
  n: string;
  u: number;
};

function readStringId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function splitName(name: string | null | undefined) {
  if (!name) return { firstName: null, lastName: null };
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? null,
    lastName: parts.slice(1).join(" ") || null,
  };
}

function parseMetadataItems(metadata: Stripe.Metadata | null | undefined): CheckoutMetadataItem[] {
  const count = Number(metadata?.items_count ?? 0);
  const items: CheckoutMetadataItem[] = [];

  for (let index = 0; index < count; index += 1) {
    const raw = metadata?.[`item_${index}`];
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as CheckoutMetadataItem;
      if (parsed.p && parsed.v && parsed.s && parsed.q > 0 && parsed.u > 0) {
        items.push(parsed);
      }
    } catch {
      continue;
    }
  }

  return items;
}

function buildOrderNumber(sessionId: string) {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `JP-${datePart}-${sessionId.slice(-8).toUpperCase()}`;
}

export async function recordStripeCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<{ created: boolean; orderNumber: string | null }> {
  if (session.payment_status !== "paid" || (session.metadata?.store && session.metadata.store !== "jacopopeca")) {
    return { created: false, orderNumber: null };
  }

  const db = requirePrisma();
  const existingOrder = await db.order.findUnique({
    where: { stripeCheckoutId: session.id },
    select: { orderNumber: true },
  });

  if (existingOrder) {
    const email = session.customer_details?.email?.trim().toLowerCase();
    if (email && session.metadata?.marketing_opt === "true") await subscribeNewsletter(email, "checkout");
    return { created: false, orderNumber: existingOrder.orderNumber };
  }

  const items = parseMetadataItems(session.metadata);
  if (items.length === 0) {
    return { created: false, orderNumber: null };
  }

  const email =
    session.customer_details?.email?.trim().toLowerCase() ??
    `checkout-${session.id.slice(-10)}@jacopopeca.local`;

  const shippingDetails = session.collected_information?.shipping_details;
  const displayName = shippingDetails?.name || session.customer_details?.name || null;
  const { firstName, lastName } = splitName(displayName);
  const stripeCustomerId = readStringId(session.customer);
  const stripePaymentIntentId = readStringId(session.payment_intent);
  const rawAddr = shippingDetails?.address ?? session.customer_details?.address;

  const address: OrderAddress | null = rawAddr
    ? {
        name: displayName,
        line1: rawAddr.line1 ?? null,
        line2: rawAddr.line2 ?? null,
        city: rawAddr.city ?? null,
        state: rawAddr.state ?? null,
        postal_code: rawAddr.postal_code ?? null,
        country: rawAddr.country ?? null,
      }
    : null;

  const orderNumber = buildOrderNumber(session.id);

  try {
  await db.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        phone: session.customer_details?.phone ?? null,
        ...(stripeCustomerId ? { stripeId: stripeCustomerId } : {}),
      },
      create: {
        email,
        firstName,
        lastName,
        phone: session.customer_details?.phone ?? null,
        stripeId: stripeCustomerId,
      },
    });

    const subtotalCents =
      session.amount_subtotal ?? items.reduce((sum, item) => sum + item.u * item.q, 0);
    const shippingCents = session.total_details?.amount_shipping ?? 0;
    const taxCents = session.total_details?.amount_tax ?? 0;
    const totalCents = session.amount_total ?? subtotalCents + shippingCents + taxCents;

    await tx.order.create({
      data: {
        orderNumber,
        status: "PAID",
        paymentProvider: "STRIPE",
        stripeCheckoutId: session.id,
        stripePaymentIntentId,
        subtotalCents,
        shippingCents,
        taxCents,
        totalCents,
        currency: session.currency?.toUpperCase() ?? "EUR",
        notes: serializeOrderMeta({
          channel: "STRIPE",
          address,
        }),
        customerId: customer.id,
        items: {
          create: items.map((item) => ({
            quantity: item.q,
            unitPriceCents: item.u,
            productName: item.n,
            sizeLabel: item.s,
            productId: item.p,
            variantId: item.v,
          })),
        },
      },
    });

    if (!email.endsWith(".local")) {
      await tx.emailJob.upsert({
        where: { dedupeKey: `order:${session.id}` }, update: {},
        create: { dedupeKey: `order:${session.id}`, email, kind: "order-confirmation", payload: {
          title: `Ordine ${orderNumber} confermato`,
          body: `Grazie per il tuo acquisto!\n\n${items.map(item => `${item.q} × ${item.n} · Taglia ${item.s}`).join("\n")}\n\nTotale pagato: ${(totalCents / 100).toFixed(2)} €. Riceverai il tracking quando il pacco sarà spedito.`,
          url: `${siteUrl()}/contatti`, label: "Contatta il laboratorio",
        } },
      });
      await tx.emailJob.upsert({
        where: { dedupeKey: `care:${session.id}` }, update: {},
        create: { dedupeKey: `care:${session.id}`, email, kind: "care", scheduledAt: new Date(Date.now() + 14 * 86400000), payload: {
          title: "Il tuo denim, nel tempo", body: "Per preservare il tuo capo artigianale, segui l’etichetta di lavaggio, lavalo al rovescio ed evita l’asciugatrice se non prevista. Per dubbi sui dettagli lavorati a mano, scrivi al laboratorio. Scopri gli altri capi disponibili per i tuoi abbinamenti.",
          url: `${siteUrl()}/shop`, label: "Scopri gli abbinamenti",
        } },
      });
    }
    if (session.metadata?.reservation_id) {
      const claimed = await tx.checkoutReservation.updateMany({ where: { id: session.metadata.reservation_id, state: "HOLD" }, data: { state: "PAID", sessionId: session.id } });
      if (!claimed.count) throw new Error("Prenotazione checkout non valida: richiesta riconciliazione.");
    } else for (const item of items) {
      await tx.productVariant.updateMany({
        where: { id: item.v },
        data: {
          stock: { decrement: item.q },
        },
      });
    }
  }, { isolationLevel: "Serializable" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await db.order.findUnique({ where: { stripeCheckoutId: session.id } });
      if (existing) return { created: false, orderNumber: existing.orderNumber };
    }
    throw error;
  }
  if (session.metadata?.marketing_opt === "true" && !email.endsWith(".local")) await subscribeNewsletter(email, "checkout");
  return { created: true, orderNumber };
}

export async function syncRecentStripeOrders(): Promise<{
  checked: number;
  imported: number;
}> {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY non configurata.");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sessions = await stripe.checkout.sessions.list({ limit: 40 });

  let imported = 0;
  for (const session of sessions.data) {
    if (session.payment_status === "paid" && session.metadata?.store === "jacopopeca") {
      const res = await recordStripeCheckoutSession(session);
      if (res.created) {
        imported += 1;
      }
    }
  }

  return {
    checked: sessions.data.length,
    imported,
  };
}
