import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { requirePrisma } from "../src/lib/prisma";
import { reserveCheckout, releaseReservation } from "../src/lib/checkout-reservations";
import { enqueueEmail, subscribeNewsletter, processEmailJobs } from "../src/lib/email";
import { emailContent } from "../src/lib/email-content";
const db = requirePrisma();

test("email rendering escapes customer-controlled content", () => {
  const content = emailContent('<script>alert("x")</script>', "A&B", 'https://example.com/?a="x"', "Vai");
  assert.ok(!content.html.includes("<script>"));
  assert.ok(content.html.includes("&lt;script&gt;"));
  assert.ok(content.text.includes("A&B"));
});

test("stock reservation, dedupe, consent gating and SendGrid retry", async () => {
  const suffix = randomUUID();
  const email = `commerce-${suffix}@example.invalid`;
  const category = await db.category.create({ data: { slug: `test-${suffix}`, name: "Commerce integration fixture" } });
  const product = await db.product.create({ data: { slug: `test-${suffix}`, name: "Commerce integration fixture", description: "Temporary test fixture", priceCents: 100, status: "DRAFT", categoryId: category.id, variants: { create: { sku: `test-${suffix}`, size: "TEST", stock: 2 } } }, include: { variants: true } });
  const variant = product.variants[0];
  const reservations: string[] = [];
  const originalFetch = globalThis.fetch;
  let deliveries = 0;
  process.env.SENDGRID_API_KEY ||= "mock-provider-key";
  process.env.SENDGRID_FROM_EMAIL ||= "test@example.invalid";
  globalThis.fetch = async (_input, init) => {
    const payload = JSON.parse(String(init?.body));
    assert.equal(payload.personalizations[0].to[0].email, email, "Never send to an existing customer during integration tests");
    deliveries++;
    return new Response(null, { status: 202 });
  };
  try {
    const result = await Promise.allSettled(Array.from({ length: 3 }, () => reserveCheckout([{ v: variant.id, q: 1 }])));
    for (const item of result) if (item.status === "fulfilled") reservations.push(item.value.id);
    assert.equal(reservations.length, 2, "Only the two stocked units may be reserved");
    assert.equal((await db.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock, 0);
    await Promise.all(reservations.flatMap(id => [releaseReservation(id), releaseReservation(id)]));
    assert.equal((await db.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock, 2, "Replayed expiration must not restore twice");
    const payload = { title: "Test", body: "Test", url: "https://jacopopeca.com/shop", label: "Shop" };
    await Promise.all(Array.from({ length: 4 }, () => enqueueEmail(`test:${suffix}`, email, "care", payload)));
    assert.equal(await db.emailJob.count({ where: { email } }), 1, "Unique dedupe key");
    await processEmailJobs(email);
    assert.equal(deliveries, 0, "Marketing without confirmed consent is cancelled");
    await subscribeNewsletter(email, "test");
    await subscribeNewsletter(email, "test");
    assert.equal(await db.emailJob.count({ where: { email, kind: "confirmation" } }), 1, "Repeated requests do not spam confirmation emails");
    await processEmailJobs(email);
    assert.equal(deliveries, 1, "Only the confirmation request is deliverable before consent");
    await db.newsletterSubscription.update({ where: { email }, data: { confirmedAt: new Date() } });
    await enqueueEmail(`welcome:${suffix}`, email, "welcome", payload);
    await processEmailJobs(email);
    assert.equal(deliveries, 2);
    await enqueueEmail(`second:${suffix}`, email, "care", payload);
    await processEmailJobs(email);
    assert.equal(deliveries, 2, "Marketing frequency cap is enforced");
    await db.newsletterSubscription.update({ where: { email }, data: { revokedAt: new Date() } });
    await enqueueEmail(`revoked:${suffix}`, email, "care", payload);
    await processEmailJobs(email);
    assert.equal(deliveries, 2, "Revocation suppresses new marketing jobs");
    await enqueueEmail(`receipt:${suffix}`, email, "order-confirmation", payload);
    await processEmailJobs(email);
    assert.equal(deliveries, 3, "Order receipts do not require marketing consent");
    globalThis.fetch = async () => new Response(null, { status: 429 });
    const retry = await enqueueEmail(`retry:${suffix}`, email, "shipping", payload);
    await processEmailJobs(email);
    const retryJob = await db.emailJob.findUniqueOrThrow({ where: { id: retry.id } });
    assert.equal(retryJob.sentAt, null);
    assert.equal(retryJob.attempts, 1);
    assert.ok(retryJob.scheduledAt.getTime() > Date.now());
    assert.equal(retryJob.lastError, "SendGrid HTTP 429");
  } finally {
    globalThis.fetch = originalFetch;
    for (const id of reservations) await releaseReservation(id);
    await db.checkoutReservation.deleteMany({ where: { id: { in: reservations } } });
    await db.emailJob.deleteMany({ where: { email } });
    await db.newsletterSubscription.deleteMany({ where: { email } });
    await db.product.delete({ where: { id: product.id } });
    await db.category.delete({ where: { id: category.id } });
    await db.$disconnect();
  }
});

test("a paid checkout consumes its reservation exactly once and queues one receipt", async () => {
  const { recordStripeCheckoutSession } = await import("../src/lib/stripe-order-sync");
  const suffix = randomUUID();
  const email = `payment-${suffix}@example.invalid`;
  const category = await db.category.create({ data: { slug: `paid-test-${suffix}`, name: "Payment test fixture" } });
  const product = await db.product.create({ data: { slug: `paid-test-${suffix}`, name: "Payment test fixture", description: "Temporary fixture", priceCents: 100, status: "DRAFT", categoryId: category.id, variants: { create: { sku: `paid-test-${suffix}`, size: "TEST", stock: 2 } } }, include: { variants: true } });
  const variant = product.variants[0];
  let reservation: Awaited<ReturnType<typeof reserveCheckout>> | undefined;
  const sessionId = `cs_test_${suffix}`;
  try {
    reservation = await reserveCheckout([{ v: variant.id, q: 1 }]);
    const session = {
      id: sessionId, payment_status: "paid", currency: "eur", amount_subtotal: 100, amount_total: 100,
      customer_details: { email, name: "Test Customer" },
      metadata: { store: "jacopopeca", reservation_id: reservation.id, marketing_opt: "false", items_count: "1", item_0: JSON.stringify({ p: product.id, v: variant.id, s: "TEST", q: 1, n: product.name, u: 100 }) },
    } as unknown as import("stripe").default.Checkout.Session;
    const first = await recordStripeCheckoutSession(session);
    const replay = await recordStripeCheckoutSession(session);
    assert.equal(first.created, true);
    assert.equal(replay.created, false);
    assert.equal(first.orderNumber, replay.orderNumber);
    assert.equal(await db.order.count({ where: { stripeCheckoutId: sessionId } }), 1);
    assert.equal(await db.emailJob.count({ where: { email, kind: "order-confirmation" } }), 1);
    assert.equal(await db.newsletterSubscription.count({ where: { email } }), 0, "A purchase never subscribes the customer without consent");
    assert.equal((await db.checkoutReservation.findUniqueOrThrow({ where: { id: reservation.id } })).state, "PAID");
    await releaseReservation(reservation.id);
    assert.equal((await db.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock, 1, "Paid stock is not restored by a late expiration replay");
  } finally {
    await db.order.deleteMany({ where: { stripeCheckoutId: sessionId } });
    await db.customer.deleteMany({ where: { email } });
    await db.emailJob.deleteMany({ where: { email } });
    if (reservation) await db.checkoutReservation.delete({ where: { id: reservation.id } });
    await db.product.delete({ where: { id: product.id } });
    await db.category.delete({ where: { id: category.id } });
    await db.$disconnect();
  }
});

test("newsletter origin checks use public domains behind the reverse proxy", async () => {
  const { POST } = await import("../src/app/api/newsletter/route");
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://jacopopeca.com";
  try {
    for (const origin of ["https://jacopopeca.com", "https://www.jacopopeca.com", "https://staging.jacopopeca.com"]) {
      const response = await POST(new Request("http://internal-container:3000/api/newsletter/", { method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify({ email: "nobody@example.invalid", consent: false }) }));
      assert.equal(response.status, 400, "Legitimate origins reach consent validation even behind an internal hostname");
    }
    const rejected = await POST(new Request("http://internal-container:3000/api/newsletter/", { method: "POST", headers: { origin: "https://unrelated.example" }, body: "{}" }));
    assert.equal(rejected.status, 403);
  } finally { process.env.NEXT_PUBLIC_SITE_URL = previous; }
});
