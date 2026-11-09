import { NextResponse } from "next/server";
import { z } from "zod";

import { deleteAdminCategory, updateAdminCategory } from "@/lib/product-data";
import { isDatabaseConfigured } from "@/lib/prisma";

const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Inserisci almeno 2 caratteri per il nome categoria.")
    .max(60),
  description: z.string().trim().max(300).optional(),
});

const deleteCategorySchema = z
  .object({
    reassignToCategoryId: z.string().trim().min(1).optional(),
  })
  .optional();

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "DATABASE_URL non configurato." }, { status: 503 });
  }

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const parsed = updateCategorySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Nome categoria non valido." },
      { status: 400 },
    );
  }

  try {
    const category = await updateAdminCategory(id, parsed.data);
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Unable to update category:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Impossibile aggiornare la categoria.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "DATABASE_URL non configurato." }, { status: 503 });
  }

  const { id } = await params;

  let reassignToCategoryId: string | undefined;
  try {
    const text = await request.text();
    if (text.trim()) {
      const parsed = deleteCategorySchema.safeParse(JSON.parse(text));
      if (parsed.success && parsed.data?.reassignToCategoryId) {
        reassignToCategoryId = parsed.data.reassignToCategoryId;
      }
    }
  } catch {
    // Empty or non-JSON body is fine
  }

  try {
    const result = await deleteAdminCategory(id, reassignToCategoryId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Unable to delete category:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Impossibile eliminare la categoria.",
      },
      { status: 400 },
    );
  }
}
