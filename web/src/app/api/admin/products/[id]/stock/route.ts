import { NextResponse } from "next/server";
import { z } from "zod";

import { updateAdminProductStock } from "@/lib/product-data";
import { isDatabaseConfigured } from "@/lib/prisma";

const stockUpdateSchema = z.object({
  variants: z
    .array(
      z.object({
        id: z.string().min(1),
        stock: z.number().int().min(0),
      }),
    )
    .min(1),
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

  const result = stockUpdateSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "Dati stock non validi.", details: result.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const product = await updateAdminProductStock(id, result.data.variants);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Unable to update product stock.", error);
    return NextResponse.json({ error: "Impossibile aggiornare lo stock." }, { status: 500 });
  }
}
