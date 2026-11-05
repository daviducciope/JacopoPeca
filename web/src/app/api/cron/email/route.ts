import { cleanExpiredReservations } from "@/lib/checkout-reservations";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processEmailJobs, scheduleCampaigns } from "@/lib/email";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
  const actual = request.headers.get("authorization") || "";
  if (!process.env.CRON_SECRET || Buffer.byteLength(actual) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await cleanExpiredReservations();
    await scheduleCampaigns();
    return NextResponse.json(await processEmailJobs());
  } catch { return NextResponse.json({ error: "Elaborazione email fallita" }, { status: 503 }); }
}
