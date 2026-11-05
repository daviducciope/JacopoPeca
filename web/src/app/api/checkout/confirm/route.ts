import { NextResponse } from "next/server";
import Stripe from "stripe";

import { isDatabaseConfigured } from "@/lib/prisma";
import { recordStripeCheckoutSession } from "@/lib/stripe-order-sync";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isDatabaseConfigured || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ confirmed: false }, { status: 200 });
  }

  let sessionId = "";
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = body.sessionId?.trim() || "";
  } catch {
    return NextResponse.json({ confirmed: false }, { status: 400 });
  }

  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ confirmed: false }, { status: 400 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const result = await recordStripeCheckoutSession(session);
    return NextResponse.json({
      confirmed: session.payment_status === "paid" && Boolean(result.orderNumber),
      orderNumber: result.orderNumber,
      created: result.created,
    });
  } catch (error) {
    console.error("Unable to confirm checkout session:", error);
    return NextResponse.json({ confirmed: false }, { status: 200 });
  }
}
