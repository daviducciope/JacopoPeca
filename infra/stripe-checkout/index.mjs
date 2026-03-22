import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "https://staging.jacopopeca.com",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function handler(event) {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  try {
    const { items } = JSON.parse(event.body);

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Carrello non valido" }),
      };
    }

    const line_items = items.map((item) => {
      const priceCents = Math.round(Number(item.priceCents));
      if (!Number.isFinite(priceCents) || priceCents < 50 || priceCents > 99999900) {
        throw new Error("Prezzo non valido");
      }
      const qty = Math.round(Number(item.qty));
      if (!Number.isFinite(qty) || qty < 1 || qty > 20) {
        throw new Error("Quantità non valida");
      }

      const name = String(item.name).slice(0, 200);
      const desc = item.size ? `Taglia: ${String(item.size).slice(0, 20)}` : undefined;

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name,
            ...(desc && { description: desc }),
            ...(item.image && { images: [String(item.image).slice(0, 2048)] }),
          },
          unit_amount: priceCents,
        },
        quantity: qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_address_collection: { allowed_countries: ["IT", "DE", "FR", "ES", "AT", "NL", "BE"] },
      success_url: `${process.env.ALLOWED_ORIGIN || "https://staging.jacopopeca.com"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.ALLOWED_ORIGIN || "https://staging.jacopopeca.com"}/cart`,
    });

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Errore durante la creazione del checkout." }),
    };
  }
}
