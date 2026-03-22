import { NextResponse } from "next/server";

import { adminProductSchema, createAdminProduct, getAdminProductsPageData } from "@/lib/product-data";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function GET() {
  const data = await getAdminProductsPageData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "DATABASE_URL non configurato. Abilita il database per creare prodotti." },
      { status: 503 },
    );
  }

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
    const product = await createAdminProduct(result.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Unable to create admin product.", error);
    return NextResponse.json(
      { error: "Impossibile creare il prodotto. Verifica categoria, slug e connessione database." },
      { status: 500 },
    );
  }
}