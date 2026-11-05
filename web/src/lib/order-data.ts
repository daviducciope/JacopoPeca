import "server-only";

import { siteUrl } from "@/lib/email";
import type { OrderStatus } from "@prisma/client";
import { isDatabaseConfigured, prisma, requirePrisma } from "@/lib/prisma";

export type OrderAddress = {
  name?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export type OrderChannel = "STRIPE" | "STORE" | "INSTAGRAM" | "WHATSAPP";

export type OrderMeta = {
  address?: OrderAddress | null;
  carrier?: string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | null;
  channel?: OrderChannel;
  adminNotes?: string | null;
  stockRestored?: boolean;
};

export type ShippingSettings = {
  italyStandardCents: number;
  freeThresholdCents: number;
  europeCents: number;
  enabled: boolean;
};

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  italyStandardCents: 700,     // €7.00
  freeThresholdCents: 10000,   // €100.00
  europeCents: 1500,           // €15.00
  enabled: true,
};

export type AdminOrderItem = {
  id: string;
  quantity: number;
  unitPriceCents: number;
  productName: string;
  sizeLabel: string | null;
  productId: string | null;
  variantId: string | null;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  createdAt: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  stripeCheckoutId: string | null;
  stripePaymentIntentId: string | null;
  address: OrderAddress | null;
  carrier: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  channel: OrderChannel;
  adminNotes: string | null;
  stockRestored: boolean;
  items: AdminOrderItem[];
};

export type AdminOrdersPageData = {
  orders: AdminOrder[];
  shippingSettings: ShippingSettings;
  databaseEnabled: boolean;
  usingFallbackData: boolean;
};

export function parseOrderMeta(rawNotes: string | null | undefined): OrderMeta {
  if (!rawNotes) {
    return { channel: "STRIPE" };
  }

  try {
    const parsed = JSON.parse(rawNotes) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") {
      return { adminNotes: rawNotes, channel: "STRIPE" };
    }

    // Legacy format where rawNotes was directly Stripe's customer_details.address
    if ("line1" in parsed || "postal_code" in parsed || ("city" in parsed && !("address" in parsed))) {
      return {
        address: {
          line1: typeof parsed.line1 === "string" ? parsed.line1 : null,
          line2: typeof parsed.line2 === "string" ? parsed.line2 : null,
          city: typeof parsed.city === "string" ? parsed.city : null,
          state: typeof parsed.state === "string" ? parsed.state : null,
          postal_code: typeof parsed.postal_code === "string" ? parsed.postal_code : null,
          country: typeof parsed.country === "string" ? parsed.country : null,
        },
        channel: "STRIPE",
      };
    }

    return {
      address: (parsed.address as OrderAddress | null) ?? null,
      carrier: typeof parsed.carrier === "string" ? parsed.carrier : null,
      trackingCode: typeof parsed.trackingCode === "string" ? parsed.trackingCode : null,
      trackingUrl: typeof parsed.trackingUrl === "string" ? parsed.trackingUrl : null,
      shippedAt: typeof parsed.shippedAt === "string" ? parsed.shippedAt : null,
      channel:
        parsed.channel === "STORE" ||
        parsed.channel === "INSTAGRAM" ||
        parsed.channel === "WHATSAPP"
          ? parsed.channel
          : "STRIPE",
      adminNotes: typeof parsed.adminNotes === "string" ? parsed.adminNotes : null,
      stockRestored: Boolean(parsed.stockRestored),
    };
  } catch {
    return { adminNotes: rawNotes, channel: "STRIPE" };
  }
}

export function serializeOrderMeta(meta: OrderMeta): string {
  return JSON.stringify(meta);
}

export function buildCarrierTrackingUrl(carrier: string | null | undefined, code: string | null | undefined): string | null {
  const cleanCode = code?.trim();
  if (!cleanCode) return null;
  const c = (carrier || "").toUpperCase();

  if (c.includes("SDA") || c.includes("POSTE")) {
    return `https://www.poste.it/cerca/index.html#/risultati-spedizioni/${encodeURIComponent(cleanCode)}`;
  }
  if (c.includes("BRT") || c.includes("BARTOLINI")) {
    return `https://vas.brt.it/vas/sped_det_show.hsm?chisono=${encodeURIComponent(cleanCode)}`;
  }
  if (c.includes("GLS")) {
    return `https://www.gls-italy.com/it/servizi-per-destinatari/dettaglio-spedizione?numero_spedizione=${encodeURIComponent(cleanCode)}&tipo_ricerca=nazionale`;
  }
  if (c.includes("DHL")) {
    return `https://www.dhl.com/it-it/home/tracciabilita.html?tracking-id=${encodeURIComponent(cleanCode)}`;
  }
  if (c.includes("UPS")) {
    return `https://www.ups.com/track?loc=it_IT&tracknum=${encodeURIComponent(cleanCode)}`;
  }
  return null;
}

const SHIPPING_CONFIG_EMAIL = "system-shipping-config@jacopopeca.internal";

export async function getShippingSettings(): Promise<ShippingSettings> {
  if (!prisma) {
    return DEFAULT_SHIPPING_SETTINGS;
  }

  try {
    const record = await prisma.adminUser.findUnique({
      where: { email: SHIPPING_CONFIG_EMAIL },
    });
    if (!record) return DEFAULT_SHIPPING_SETTINGS;
    const parsed = JSON.parse(record.passwordHash) as Partial<ShippingSettings>;
    return {
      italyStandardCents:
        typeof parsed.italyStandardCents === "number"
          ? parsed.italyStandardCents
          : DEFAULT_SHIPPING_SETTINGS.italyStandardCents,
      freeThresholdCents:
        typeof parsed.freeThresholdCents === "number"
          ? parsed.freeThresholdCents
          : DEFAULT_SHIPPING_SETTINGS.freeThresholdCents,
      europeCents:
        typeof parsed.europeCents === "number"
          ? parsed.europeCents
          : DEFAULT_SHIPPING_SETTINGS.europeCents,
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : true,
    };
  } catch {
    return DEFAULT_SHIPPING_SETTINGS;
  }
}

export async function saveShippingSettings(input: ShippingSettings): Promise<ShippingSettings> {
  const db = requirePrisma();
  const sanitized: ShippingSettings = {
    italyStandardCents: Math.max(0, Math.round(input.italyStandardCents)),
    freeThresholdCents: Math.max(0, Math.round(input.freeThresholdCents)),
    europeCents: Math.max(0, Math.round(input.europeCents)),
    enabled: Boolean(input.enabled),
  };

  await db.adminUser.upsert({
    where: { email: SHIPPING_CONFIG_EMAIL },
    update: {
      passwordHash: JSON.stringify(sanitized),
      name: "Shipping Config",
      role: "config",
    },
    create: {
      email: SHIPPING_CONFIG_EMAIL,
      passwordHash: JSON.stringify(sanitized),
      name: "Shipping Config",
      role: "config",
    },
  });

  return sanitized;
}

function mapPrismaOrderToAdminOrder(order: {
  id: string;
  orderNumber: string;
  status: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  createdAt: Date;
  notes: string | null;
  stripeCheckoutId: string | null;
  stripePaymentIntentId: string | null;
  customer: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPriceCents: number;
    productName: string;
    sizeLabel: string | null;
    productId: string | null;
    variantId: string | null;
  }>;
}): AdminOrder {
  const meta = parseOrderMeta(order.notes);
  const fullName =
    [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") ||
    meta.address?.name ||
    "";

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    customerEmail: order.customer.email,
    customerName: fullName,
    customerPhone: order.customer.phone,
    stripeCheckoutId: order.stripeCheckoutId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    address: meta.address ?? null,
    carrier: meta.carrier ?? null,
    trackingCode: meta.trackingCode ?? null,
    trackingUrl:
      meta.trackingUrl ?? buildCarrierTrackingUrl(meta.carrier, meta.trackingCode),
    shippedAt: meta.shippedAt ?? null,
    channel: meta.channel ?? "STRIPE",
    adminNotes: meta.adminNotes ?? null,
    stockRestored: Boolean(meta.stockRestored),
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      productName: item.productName,
      sizeLabel: item.sizeLabel,
      productId: item.productId,
      variantId: item.variantId,
    })),
  };
}

export type UpdateOrderPayload = {
  status?: OrderStatus;
  carrier?: string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  adminNotes?: string | null;
  address?: OrderAddress | null;
  customerPhone?: string | null;
  restoreStock?: boolean;
  sendTrackingEmail?: boolean;
};

export async function updateAdminOrder(
  orderId: string,
  payload: UpdateOrderPayload,
): Promise<{ order: AdminOrder; emailSent: boolean; emailQueued: boolean }> {
  const db = requirePrisma();

  const existing = await db.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!existing) {
    throw new Error("Ordine non trovato.");
  }

  const currentMeta = parseOrderMeta(existing.notes);
  const nextStatus = payload.status ?? existing.status;

  const nextCarrier = payload.carrier !== undefined ? payload.carrier : currentMeta.carrier;
  const nextTrackingCode =
    payload.trackingCode !== undefined ? payload.trackingCode : currentMeta.trackingCode;
  const nextTrackingUrl =
    payload.trackingUrl !== undefined
      ? payload.trackingUrl || buildCarrierTrackingUrl(nextCarrier, nextTrackingCode)
      : currentMeta.trackingUrl || buildCarrierTrackingUrl(nextCarrier, nextTrackingCode);

  const nextMeta: OrderMeta = {
    ...currentMeta,
    carrier: nextCarrier ?? null,
    trackingCode: nextTrackingCode ?? null,
    trackingUrl: nextTrackingUrl ?? null,
    adminNotes: payload.adminNotes !== undefined ? payload.adminNotes : currentMeta.adminNotes,
    address: payload.address !== undefined ? payload.address : currentMeta.address,
    shippedAt:
      nextStatus === "FULFILLED" && !currentMeta.shippedAt
        ? new Date().toISOString()
        : currentMeta.shippedAt ?? null,
  };

  // Restore stock if requested and not already restored
  const shouldRestoreStock =
    payload.restoreStock &&
    (nextStatus === "CANCELLED" || nextStatus === "REFUNDED") &&
    !currentMeta.stockRestored;

  if (shouldRestoreStock) {
    nextMeta.stockRestored = true;
  }

  const updated = await db.$transaction(async (tx) => {
    if (payload.customerPhone !== undefined) {
      await tx.customer.update({
        where: { id: existing.customerId },
        data: { phone: payload.customerPhone || null },
      });
    }

    if (shouldRestoreStock) {
      for (const item of existing.items) {
        if (item.variantId) {
          await tx.productVariant.updateMany({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    if (existing.customer.email && !existing.customer.email.endsWith(".local")) {
      const shippingChanged = nextStatus === "FULFILLED" && (existing.status !== "FULFILLED" || nextTrackingCode !== currentMeta.trackingCode || payload.sendTrackingEmail);
      const statusChanged = nextStatus !== existing.status && (nextStatus === "CANCELLED" || nextStatus === "REFUNDED");
      if (shippingChanged || statusChanged) {
        const kind = shippingChanged ? "shipping" : nextStatus === "REFUNDED" ? "refund" : "cancellation";
        const key = `${kind}:${existing.id}:${shippingChanged ? nextTrackingCode || "no-tracking" : nextStatus}`;
        const title = shippingChanged ? `Ordine ${existing.orderNumber} spedito` : nextStatus === "REFUNDED" ? `Aggiornamento rimborso ordine ${existing.orderNumber}` : `Ordine ${existing.orderNumber} annullato`;
        const body = shippingChanged ? `Il tuo capo artigianale è in viaggio.\nCorriere: ${nextCarrier || "Corriere espresso"}\nTracking: ${nextTrackingCode || "In aggiornamento"}` : nextStatus === "REFUNDED" ? "Lo stato del tuo ordine è stato aggiornato a rimborsato. Per i dettagli dell’operazione e i tempi di accredito, contatta il negozio." : "Il tuo ordine è stato annullato. Per informazioni su pagamento e assistenza, contatta il negozio.";
        const safeTrackingUrl = nextTrackingUrl && /^https:\/\//i.test(nextTrackingUrl) ? nextTrackingUrl : null;
        await tx.emailJob.upsert({ where: { dedupeKey: key }, update: {}, create: { dedupeKey: key, email: existing.customer.email, kind, payload: { title, body, url: safeTrackingUrl || `${siteUrl()}/contatti`, label: safeTrackingUrl ? "Traccia la spedizione" : "Contatta il negozio" } } });
      }
    }
    return tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        notes: serializeOrderMeta(nextMeta),
      },
      include: {
        customer: true,
        items: { orderBy: { createdAt: "asc" } },
      },
    });
  });

  const mappedOrder = mapPrismaOrderToAdminOrder(updated);
  const emailQueued = Boolean(await db.emailJob.findFirst({ where: { email: mappedOrder.customerEmail, sentAt: null, cancelledAt: null, kind: { in: ["shipping", "refund", "cancellation"] } } }));
  return { order: mappedOrder, emailSent: false, emailQueued };
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<AdminOrder> {
  const { order } = await updateAdminOrder(orderId, { status });
  return order;
}

export type CreateManualOrderInput = {
  productId: string;
  variantId: string;
  quantity: number;
  priceCents: number;
  channel: "STORE" | "INSTAGRAM" | "WHATSAPP";
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: OrderAddress | null;
  adminNotes?: string;
};

export async function createManualAdminOrder(input: CreateManualOrderInput): Promise<AdminOrder> {
  const db = requirePrisma();

  const product = await db.product.findUnique({
    where: { id: input.productId },
    include: { variants: true },
  });

  if (!product) {
    throw new Error("Prodotto non trovato.");
  }

  const variant =
    product.variants.find((v) => v.id === input.variantId) ?? product.variants[0];
  if (!variant) {
    throw new Error("Taglia/variante non trovata.");
  }

  const qty = Math.max(1, Math.round(input.quantity));
  const unitPriceCents = Math.max(0, Math.round(input.priceCents));
  const totalCents = unitPriceCents * qty;

  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randSuffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  const orderNumber = `JP-${input.channel.slice(0, 2)}-${datePart}-${randSuffix}`;

  const cleanEmail =
    input.customerEmail?.trim().toLowerCase() ||
    `${input.channel.toLowerCase()}-${randSuffix.toLowerCase()}@jacopopeca.local`;
  const nameParts = (input.customerName?.trim() || `Cliente ${input.channel}`).split(/\s+/);
  const firstName = nameParts[0] || "Cliente";
  const lastName = nameParts.slice(1).join(" ") || null;

  const meta: OrderMeta = {
    channel: input.channel,
    address: input.address ?? null,
    adminNotes: input.adminNotes?.trim() || `Vendita diretta (${input.channel})`,
  };

  const created = await db.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email: cleanEmail },
      update: {
        firstName,
        lastName,
        ...(input.customerPhone ? { phone: input.customerPhone.trim() } : {}),
      },
      create: {
        email: cleanEmail,
        firstName,
        lastName,
        phone: input.customerPhone?.trim() || null,
      },
    });

    await tx.productVariant.update({
      where: { id: variant.id },
      data: {
        stock: Math.max(0, variant.stock - qty),
      },
    });

    return tx.order.create({
      data: {
        orderNumber,
        status: "PAID",
        paymentProvider: "STRIPE",
        subtotalCents: totalCents,
        shippingCents: 0,
        taxCents: 0,
        totalCents,
        currency: "EUR",
        notes: serializeOrderMeta(meta),
        customerId: customer.id,
        items: {
          create: [
            {
              quantity: qty,
              unitPriceCents,
              productName: product.name,
              sizeLabel: variant.size,
              productId: product.id,
              variantId: variant.id,
            },
          ],
        },
      },
      include: {
        customer: true,
        items: { orderBy: { createdAt: "asc" } },
      },
    });
  });

  return mapPrismaOrderToAdminOrder(created);
}

export async function getAdminOrdersPageData(): Promise<AdminOrdersPageData> {
  const shippingSettings = await getShippingSettings();

  if (!prisma) {
    return {
      orders: [],
      shippingSettings,
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
      take: 150,
    });

    return {
      orders: orders.map(mapPrismaOrderToAdminOrder),
      shippingSettings,
      databaseEnabled: isDatabaseConfigured,
      usingFallbackData: false,
    };
  } catch (error) {
    console.error("Database orders unavailable.", error);
    return {
      orders: [],
      shippingSettings,
      databaseEnabled: isDatabaseConfigured,
      usingFallbackData: true,
    };
  }
}
