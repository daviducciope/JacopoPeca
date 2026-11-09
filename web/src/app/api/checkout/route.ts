import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { guardPublicMutation } from "@/lib/antibot";
import { getShippingSettings } from "@/lib/order-data";
import { getCheckoutProductsBySlugs } from "@/lib/product-data";
import { reserveCheckout, releaseReservation } from "@/lib/checkout-reservations";
import { isDatabaseConfigured, requirePrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  items: z.array(z.object({ slug: z.string().min(1).max(180), qty: z.number().int().min(1).max(20), size: z.string().max(80).nullable().optional() })).min(1).max(44),
  email: z.email().max(254).optional(),
  marketingOpt: z.boolean().default(false),
  country: z.enum(["IT", "DE", "FR", "ES", "AT", "NL", "BE"]).default("IT"),
  website: z.string().max(0).optional(),
});

function toAbsoluteUrl(value: string, baseUrl: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

export async function POST(request: Request) {
  const blocked = guardPublicMutation(request, {
    scope: "checkout",
    maxRequests: 8,
    windowMs: 10 * 60 * 1000,
    requireOriginInProd: true,
  });
  if (blocked) return blocked;

  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "DATABASE_URL non configurato. Il checkout runtime richiede il database." },
      { status: 503 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY non configurata." },
      { status: 503 },
    );
  }

  let parsed;
  try { parsed = checkoutSchema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Carrello non valido." }, { status: 400 }); }
  if (!parsed.success) return NextResponse.json({ error: "Verifica prodotti, taglie e quantità del carrello." }, { status: 400 });
  const payload = parsed.data;
  const items = payload.items;
  const keys = items.map(item => `${item.slug}:${item.size ?? ""}`);
  if (new Set(keys).size !== keys.length) return NextResponse.json({ error: "Il carrello contiene righe duplicate." }, { status: 400 });

  let reservationId: string | undefined;
  const slugs = items.map((item) => item.slug);
  try {
  const [productLookup, shippingSettings] = await Promise.all([
    getCheckoutProductsBySlugs(slugs),
    getShippingSettings(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    if (payload.country !== "IT" && (!shippingSettings.enabled || shippingSettings.europeCents <= 0)) return NextResponse.json({ error: "Spedizione non disponibile per il paese selezionato." }, { status: 400 });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sessionMetadata: Record<string, string> = {
      items_count: String(items.length),
      store: "jacopopeca",
      marketing_opt: String(payload.marketingOpt),
      consent_version: "2026-11-05",
    };

    let subtotalCents = 0;

    const lineItems = items.map((item, metadataIndex) => {
      const product = productLookup.get(item.slug);
      if (!product) {
        throw new Error(`Prodotto non trovato: ${item.slug}`);
      }

      const qty = item.qty;
      if (!Number.isFinite(qty) || qty < 1 || qty > 20) {
        throw new Error(`Quantita non valida per ${item.slug}`);
      }

      if (!product.inStock) {
        throw new Error(`${product.name} non e disponibile`);
      }

      const variant = item.size
        ? product.sizes.find((size) => size.label === item.size)
        : product.sizes.length === 1
          ? product.sizes[0]
          : null;

      if (!variant) {
        throw new Error(`Seleziona una taglia valida per ${product.name}`);
      }

      if (variant.stock < qty) {
        throw new Error(`Stock insufficiente per ${product.name} taglia ${variant.label}`);
      }

      subtotalCents += product.priceCents * qty;

      sessionMetadata[`item_${metadataIndex}`] = JSON.stringify({
        p: product.id,
        v: variant.id,
        s: variant.label,
        q: qty,
        n: product.name,
        u: product.priceCents,
      });

      const thumbnail = product.images.find((image) => image.isThumbnail) || product.images[0];

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            description: item.size ? `Taglia: ${item.size}` : product.categoryName,
            ...(thumbnail
              ? {
                  images: [toAbsoluteUrl(thumbnail.url, siteUrl)],
                }
              : {}),
          },
          unit_amount: product.priceCents,
        },
        quantity: qty,
      };
    });

    const isFreeShipping =
      shippingSettings.freeThresholdCents > 0 &&
      subtotalCents >= shippingSettings.freeThresholdCents;
    const italyShippingAmount = isFreeShipping ? 0 : shippingSettings.italyStandardCents;

    const amount = payload.country === "IT" ? italyShippingAmount : shippingSettings.europeCents;
    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = shippingSettings.enabled ? [{
      shipping_rate_data: {
        type: "fixed_amount", fixed_amount: { amount, currency: "eur" },
        display_name: amount === 0 ? "Spedizione gratuita" : payload.country === "IT" ? "Corriere Espresso Italia" : "Corriere Europa",
        delivery_estimate: { minimum: { unit: "business_day", value: payload.country === "IT" ? 2 : 4 }, maximum: { unit: "business_day", value: payload.country === "IT" ? 4 : 7 } },
      },
    }] : [];

    const reservation = await reserveCheckout(items.map((_, index) => {
      const item = JSON.parse(sessionMetadata[`item_${index}`]) as { v: string; q: number };
      return { v: item.v, q: item.q };
    }));
    reservationId = reservation.id;
    sessionMetadata.reservation_id = reservation.id;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      metadata: sessionMetadata,
      allow_promotion_codes: true,
      locale: "it",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      ...(payload.email ? { customer_email: payload.email.trim().toLowerCase() } : {}),
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: [payload.country],
      },
      ...(shippingOptions.length > 0 ? { shipping_options: shippingOptions } : {}),
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
    }, { idempotencyKey: `jacopopeca:${reservation.id}` });
    await requirePrisma().checkoutReservation.update({ where: { id: reservation.id }, data: { sessionId: session.id } });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (reservationId && (error instanceof Stripe.errors.StripeInvalidRequestError || error instanceof Stripe.errors.StripeAuthenticationError)) await releaseReservation(reservationId);
    console.error("Stripe checkout failed", error instanceof Stripe.errors.StripeError ? error.type : "validation_or_database");
    return NextResponse.json(
      {
        error: error instanceof Stripe.errors.StripeError ? "Pagamento temporaneamente non disponibile. Riprova più tardi." : "Verifica la disponibilità e le taglie dei prodotti. Se il problema persiste, contattaci.",
      },
      { status: 500 },
    );
  }
}
