import { NextResponse } from "next/server";
import { z } from "zod";

import {
  adminProductSchema,
  archiveAdminProduct,
  deleteAdminProduct,
  updateAdminProduct,
  updateAdminProductStatus,
} from "@/lib/product-data";
import { isDatabaseConfigured } from "@/lib/prisma";

function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

const quickStatusSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  quickStatusOnly: z.literal(true),
});

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

  // Check if this is a quick status toggle
  const statusCheck = quickStatusSchema.safeParse(payload);
  if (statusCheck.success) {
    try {
      const product = await updateAdminProductStatus(id, statusCheck.data.status);
      return NextResponse.json({ product });
    } catch (error) {
      console.error("Unable to update product status.", error);
      return NextResponse.json(
        { error: "Impossibile cambiare lo stato del prodotto." },
        { status: 500 },
      );
    }
  }

  const result = adminProductSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Controlla i campi obbligatori del prodotto.",
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
    if (isPrismaUniqueError(error)) {
      return NextResponse.json(
        { error: "SKU o slug già in uso. Riprova." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Impossibile aggiornare il prodotto. Controlla categoria e database." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "DATABASE_URL non configurato. Abilita il database per gestire prodotti." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const url = new URL(request.url);
  const permanent = url.searchParams.get("permanent") === "true";

  try {
    if (permanent) {
      const result = await deleteAdminProduct(id);
      return NextResponse.json({ deletedId: result.deletedId, permanent: true });
    }
    const product = await archiveAdminProduct(id);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Unable to delete/archive admin product.", error);
    return NextResponse.json(
      { error: permanent ? "Impossibile eliminare il prodotto." : "Impossibile archiviare il prodotto." },
      { status: 500 },
    );
  }
}