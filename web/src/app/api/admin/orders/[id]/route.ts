import { NextResponse } from "next/server";
import { z } from "zod";

import { updateAdminOrder } from "@/lib/order-data";
import { isDatabaseConfigured } from "@/lib/prisma";

const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"]).optional(),
  carrier: z.string().trim().max(80).nullable().optional(),
  trackingCode: z.string().trim().max(120).nullable().optional(),
  trackingUrl: z.string().trim().max(500).nullable().optional(),
  adminNotes: z.string().trim().max(1000).nullable().optional(),
  customerPhone: z.string().trim().max(60).nullable().optional(),
  restoreStock: z.boolean().optional(),
  sendTrackingEmail: z.boolean().optional(),
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database non configurato." }, { status: 503 });
  }

  const { id } = await context.params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const result = orderUpdateSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json({ error: "Dati aggiornamento ordine non validi." }, { status: 400 });
  }

  try {
    const { order, emailSent, emailQueued } = await updateAdminOrder(id, result.data);
    return NextResponse.json({ order, emailSent, emailQueued });
  } catch (error) {
    console.error("Unable to update order:", error);
    return NextResponse.json(
      { error: "Impossibile aggiornare l'ordine." },
      { status: 500 },
    );
  }
}
