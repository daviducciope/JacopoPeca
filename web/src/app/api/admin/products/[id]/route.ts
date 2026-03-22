import { NextResponse } from "next/server";

import { adminProductSchema, archiveAdminProduct, updateAdminProduct } from "@/lib/product-data";
import { isDatabaseConfigured } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "DATABASE_URL non configurato. Abilita il database per modificare prodotti." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const payload = await request.json();
  const result = adminProductSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Dati prodotto non validi.",
        details: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const product = await updateAdminProduct(id, result.data);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Unable to update admin product.", error);
    return NextResponse.json(
      { error: "Impossibile aggiornare il prodotto. Controlla slug, categoria e database." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "DATABASE_URL non configurato. Abilita il database per archiviare prodotti." },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  try {
    const product = await archiveAdminProduct(id);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Unable to archive admin product.", error);
    return NextResponse.json({ error: "Impossibile archiviare il prodotto." }, { status: 500 });
  }
}