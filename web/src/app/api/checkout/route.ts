import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getCheckoutProductsBySlugs } from "@/lib/product-data";

export const dynamic = "force-dynamic";

type CheckoutItem = {
  slug: string;
  qty: number;
  size?: string | null;
};

function toAbsoluteUrl(value: string, baseUrl: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY non configurata." },
      { status: 503 },
    );
  }

  let payload: { items?: CheckoutItem[] };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload checkout non valido." }, { status: 400 });
  }

  const items = payload.items ?? [];
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return NextResponse.json({ error: "Carrello non valido." }, { status: 400 });
  }

  const slugs = items.map((item) => item.slug);
  const productLookup = await getCheckoutProductsBySlugs(slugs);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const lineItems = items.map((item) => {
      const product = productLookup.get(item.slug);
      if (!product) {
        throw new Error(`Prodotto non trovato: ${item.slug}`);
      }

      const qty = Math.round(Number(item.qty));
      if (!Number.isFinite(qty) || qty < 1 || qty > 20) {
        throw new Error(`Quantita non valida per ${item.slug}`);
      }

      if (!product.inStock) {
        throw new Error(`${product.name} non e disponibile`);
      }

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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["IT", "DE", "FR", "ES", "AT", "NL", "BE"],
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore durante la creazione del checkout.",
      },
      { status: 500 },
    );
  }
}