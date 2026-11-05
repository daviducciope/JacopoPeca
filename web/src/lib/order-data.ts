import "server-only";

import type { OrderStatus } from "@prisma/client";
import { isDatabaseConfigured, prisma, requirePrisma } from "@/lib/prisma";

export type AdminOrderItem = {
  id: string;
  quantity: number;
  unitPriceCents: number;
  productName: string;
  sizeLabel: string | null;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  customerEmail: string;
  customerName: string;
  stripeCheckoutId: string | null;
  stripePaymentIntentId: string | null;
  items: AdminOrderItem[];
};

export type AdminOrdersPageData = {
  orders: AdminOrder[];
  databaseEnabled: boolean;
  usingFallbackData: boolean;
};

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<AdminOrder> {
  const db = requirePrisma();
  const order = await db.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      customer: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalCents: order.totalCents,
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    customerEmail: order.customer.email,
    customerName: [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" "),
    stripeCheckoutId: order.stripeCheckoutId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      productName: item.productName,
      sizeLabel: item.sizeLabel,
    })),
  };
}

export async function getAdminOrdersPageData(): Promise<AdminOrdersPageData> {
  if (!prisma) {
    return {
      orders: [],
      databaseEnabled: isDatabaseConfigured,
      usingFallbackData: true,
    };
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return {
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalCents: order.totalCents,
        currency: order.currency,
        createdAt: order.createdAt.toISOString(),
        customerEmail: order.customer.email,
        customerName: [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" "),
        stripeCheckoutId: order.stripeCheckoutId,
        stripePaymentIntentId: order.stripePaymentIntentId,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          productName: item.productName,
          sizeLabel: item.sizeLabel,
        })),
      })),
      databaseEnabled: isDatabaseConfigured,
      usingFallbackData: false,
    };
  } catch (error) {
    console.error("Database orders unavailable.", error);
    return {
      orders: [],
      databaseEnabled: isDatabaseConfigured,
      usingFallbackData: true,
    };
  }
}
