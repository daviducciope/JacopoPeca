import { NextResponse } from "next/server";
import { z } from "zod";

import { getShippingSettings, saveShippingSettings } from "@/lib/order-data";
import { isDatabaseConfigured } from "@/lib/prisma";

const shippingSchema = z.object({
  italyStandardCents: z.number().int().min(0).max(50000),
  freeThresholdCents: z.number().int().min(0).max(500000),
  europeCents: z.number().int().min(0).max(100000),
  enabled: z.boolean(),
});

export async function GET() {
  const settings = await getShippingSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database non configurato." }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const parsed = shippingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Tariffe spedizione non valide." }, { status: 400 });
  }

  try {
    const settings = await saveShippingSettings(parsed.data);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Unable to save shipping settings:", error);
    return NextResponse.json(
      { error: "Impossibile salvare le impostazioni di spedizione." },
      { status: 500 },
    );
  }
}
