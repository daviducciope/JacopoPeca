import { NextResponse } from "next/server";
import Stripe from "stripe";

import { isDatabaseConfigured, requirePrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CheckoutMetadataItem = {
  p: string;
  v: string;
  s: string;
  q: number;
  n: string;
  u: number;
};

function readStringId(value: string | { id: string } | null) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function splitName(name: string | null | undefined) {
  if (!name) {
    return { firstName: null, lastName: null };
  }

  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? null,
    lastName: parts.slice(1).join(" ") || null,
  };
}

function parseMetadataItems(metadata: Stripe.Metadata | null | undefined) {
  const count = Number(metadata?.items_count ?? 0);
  const items: CheckoutMetadataItem[] = [];

  for (let index = 0; index < count; index += 1) {
    const raw = metadata?.[`item_${index}`];
    if (!raw) {
      continue;
    }

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

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const db = requirePrisma();
  const existingOrder = await db.order.findUnique({
    where: {
      stripeCheckoutId: session.id,
    },
  });

  if (existingOrder) {
    return;
  }

  const items = parseMetadataItems(session.metadata);
  if (items.length === 0) {
    throw new Error(`Checkout ${session.id} senza righe ordine in metadata.`);
  }

  const email = session.customer_details?.email ?? `checkout-${session.id}@jacopopeca.local`;
  const { firstName, lastName } = splitName(session.customer_details?.name);
  const stripeCustomerId = readStringId(session.customer);
  const stripePaymentIntentId = readStringId(session.payment_intent);

  await db.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: {
        email,
      },
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

    const subtotalCents = session.amount_subtotal ?? items.reduce((sum, item) => sum + item.u * item.q, 0);
    const shippingCents = session.total_details?.amount_shipping ?? 0;
    const taxCents = session.total_details?.amount_tax ?? 0;
    const totalCents = session.amount_total ?? subtotalCents + shippingCents + taxCents;

    await tx.order.create({
      data: {
        orderNumber: buildOrderNumber(session.id),
        status: "PAID",
        paymentProvider: "STRIPE",
        stripeCheckoutId: session.id,
        stripePaymentIntentId,
        subtotalCents,
        shippingCents,
        taxCents,
        totalCents,
        currency: session.currency?.toUpperCase() ?? "EUR",
        notes: session.customer_details?.address
          ? JSON.stringify(session.customer_details.address)
          : null,
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

    for (const item of items) {
      await tx.productVariant.updateMany({
        where: {
          id: item.v,
        },
        data: {
          stock: {
            decrement: item.q,
          },
        },
      });
    }
  });
}

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
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await handleCheckoutSession(event.data.object as Stripe.Checkout.Session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error", error);
    return NextResponse.json({ error: "Errore elaborazione webhook Stripe." }, { status: 500 });
  }
}
