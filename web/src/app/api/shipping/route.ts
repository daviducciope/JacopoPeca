import { getShippingSettings } from "@/lib/order-data";
export const dynamic = "force-dynamic";
export async function GET() { return Response.json(await getShippingSettings()); }
