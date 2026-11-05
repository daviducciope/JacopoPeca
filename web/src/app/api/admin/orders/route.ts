import { NextResponse } from "next/server";
import { z } from "zod";

import { createManualAdminOrder, getAdminOrdersPageData } from "@/lib/order-data";
import { isDatabaseConfigured } from "@/lib/prisma";

const manualOrderSchema = z.object({
  productId: z.string().min(1, "Seleziona un prodotto."),
  variantId: z.string().min(1, "Seleziona una taglia."),
  quantity: z.number().int().min(1).max(50).default(1),
  priceCents: z.number().int().min(0),
  channel: z.enum(["STORE", "INSTAGRAM", "WHATSAPP"]).default("STORE"),
  customerName: z.string().trim().max(120).optional(),
  customerEmail: z.string().trim().max(160).optional(),
  customerPhone: z.string().trim().max(60).optional(),
  adminNotes: z.string().trim().max(500).optional(),
  address: z
    .object({
      name: z.string().trim().max(120).nullable().optional(),
      line1: z.string().trim().max(200).nullable().optional(),
      line2: z.string().trim().max(200).nullable().optional(),
      city: z.string().trim().max(120).nullable().optional(),
      state: z.string().trim().max(80).nullable().optional(),
      postal_code: z.string().trim().max(40).nullable().optional(),
      country: z.string().trim().max(40).nullable().optional(),
    })
    .nullable()
    .optional(),
});

export async function GET() {
  const data = await getAdminOrdersPageData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database non configurato." }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const parsed = manualOrderSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dati vendita non validi." },
      { status: 400 },
    );
  }

  try {
    const order = await createManualAdminOrder(parsed.data);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Unable to create manual order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossibile registrare la vendita." },
      { status: 500 },
    );
  }
}
