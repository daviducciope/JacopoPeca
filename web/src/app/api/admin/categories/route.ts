import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminCategory, getStorefrontCategories } from "@/lib/product-data";
import { isDatabaseConfigured } from "@/lib/prisma";

const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Inserisci almeno 2 caratteri per il nome categoria.").max(60),
  description: z.string().trim().max(300).optional(),
});

export async function GET() {
  const categories = await getStorefrontCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "DATABASE_URL non configurato." },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const parsed = createCategorySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Nome categoria non valido." },
      { status: 400 },
    );
  }

  try {
    const category = await createAdminCategory(parsed.data.name, parsed.data.description);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Unable to create category:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossibile creare la categoria." },
      { status: 400 },
    );
  }
}
