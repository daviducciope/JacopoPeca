import { NextResponse } from "next/server";
import { z } from "zod";

import { updateAdminOrderStatus } from "@/lib/order-data";
import { isDatabaseConfigured } from "@/lib/prisma";

const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"]),
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

  const result = orderStatusSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json({ error: "Stato ordine non valido." }, { status: 400 });
  }

  try {
    const order = await updateAdminOrderStatus(id, result.data.status);
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Unable to update order status:", error);
    return NextResponse.json({ error: "Impossibile aggiornare lo stato dell'ordine." }, { status: 500 });
  }
}
