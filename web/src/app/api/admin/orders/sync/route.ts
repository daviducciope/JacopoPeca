import { NextResponse } from "next/server";

import { getAdminOrdersPageData } from "@/lib/order-data";
import { isDatabaseConfigured } from "@/lib/prisma";
import { syncRecentStripeOrders } from "@/lib/stripe-order-sync";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database non configurato." }, { status: 503 });
  }

  try {
    const syncResult = await syncRecentStripeOrders();
    const pageData = await getAdminOrdersPageData();
    return NextResponse.json({
      ...syncResult,
      orders: pageData.orders,
    });
  } catch (error) {
    console.error("Unable to sync Stripe orders:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile sincronizzare gli ordini da Stripe.",
      },
      { status: 500 },
    );
  }
}
