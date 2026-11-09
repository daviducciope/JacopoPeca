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
  const notify = `shop-${suffix}@example.invalid`;
  const previousNotify = process.env.ADMIN_NOTIFY_EMAIL;
  process.env.ADMIN_NOTIFY_EMAIL = notify;
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
    assert.equal(await db.emailJob.count({ where: { email: notify, kind: "admin-order" } }), 1);
    assert.equal(await db.emailJob.count({ where: { email: notify, kind: "admin-stock" } }), 0, "Remaining stock must not alert");
    assert.equal(await db.newsletterSubscription.count({ where: { email } }), 0, "A purchase never subscribes the customer without consent");
    assert.equal((await db.checkoutReservation.findUniqueOrThrow({ where: { id: reservation.id } })).state, "PAID");
    await releaseReservation(reservation.id);
    assert.equal((await db.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock, 1, "Paid stock is not restored by a late expiration replay");
  } finally {
    await db.order.deleteMany({ where: { stripeCheckoutId: sessionId } });
    await db.customer.deleteMany({ where: { email } });
    await db.emailJob.deleteMany({ where: { OR: [{ email }, { email: notify }, { dedupeKey: `admin-order:${sessionId}` }] } });
    if (reservation) await db.checkoutReservation.delete({ where: { id: reservation.id } });
    await db.product.delete({ where: { id: product.id } });
    await db.category.delete({ where: { id: category.id } });
    if (previousNotify === undefined) delete process.env.ADMIN_NOTIFY_EMAIL;
    else process.env.ADMIN_NOTIFY_EMAIL = previousNotify;
  }
});

test("a sale that empties a size queues one shop alert and ignores open holds until the last payment", async () => {
  const { recordStripeCheckoutSession } = await import("../src/lib/stripe-order-sync");
  const { processEmailJobs } = await import("../src/lib/email");
  const suffix = randomUUID();
  const email = `soldout-${suffix}@example.invalid`;
  const notify = `shop-soldout-${suffix}@example.invalid`;
  const previousNotify = process.env.ADMIN_NOTIFY_EMAIL;
  const previousKey = process.env.SENDGRID_API_KEY;
  const previousFrom = process.env.SENDGRID_FROM_EMAIL;
  process.env.ADMIN_NOTIFY_EMAIL = notify;
  process.env.SENDGRID_API_KEY ||= "mock-provider-key";
  process.env.SENDGRID_FROM_EMAIL ||= "test@example.invalid";
  const category = await db.category.create({ data: { slug: `soldout-${suffix}`, name: "Sold out fixture" } });
  const product = await db.product.create({
    data: {
      slug: `soldout-${suffix}`, name: "Sold out fixture", description: "Temporary fixture", priceCents: 100, status: "ACTIVE", categoryId: category.id,
      variants: { create: [{ sku: `soldout-a-${suffix}`, size: "S", stock: 1 }, { sku: `soldout-b-${suffix}`, size: "M", stock: 2 }] },
    },
    include: { variants: true },
  });
  const soldOut = product.variants.find((variant) => variant.size === "S")!;
  const held = product.variants.find((variant) => variant.size === "M")!;
  const reservations: string[] = [];
  const sessionIds: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    const payload = JSON.parse(String(init?.body));
    assert.equal(payload.personalizations[0].to[0].email, notify);
    return new Response(null, { status: 202 });
  };
  try {
    const emptyReservation = await reserveCheckout([{ v: soldOut.id, q: 1 }]);
    reservations.push(emptyReservation.id);
    const emptySessionId = `cs_test_${suffix}_empty`;
    sessionIds.push(emptySessionId);
    const emptySession = {
      id: emptySessionId, payment_status: "paid", currency: "eur", amount_subtotal: 100, amount_total: 100,
      customer_details: { email, name: "Test Customer" },
      metadata: { store: "jacopopeca", reservation_id: emptyReservation.id, marketing_opt: "false", items_count: "1", item_0: JSON.stringify({ p: product.id, v: soldOut.id, s: "S", q: 1, n: product.name, u: 100 }) },
    } as unknown as import("stripe").default.Checkout.Session;
    await recordStripeCheckoutSession(emptySession);
    await recordStripeCheckoutSession(emptySession);
    assert.equal(await db.emailJob.count({ where: { dedupeKey: `admin-order:${emptySessionId}` } }), 1);
    assert.equal(await db.emailJob.count({ where: { dedupeKey: { startsWith: `admin-stock:${soldOut.id}:0:` } } }), 1);

    const firstHold = await reserveCheckout([{ v: held.id, q: 1 }]);
    const secondHold = await reserveCheckout([{ v: held.id, q: 1 }]);
    reservations.push(firstHold.id, secondHold.id);
    const firstSessionId = `cs_test_${suffix}_hold1`;
    const secondSessionId = `cs_test_${suffix}_hold2`;
    sessionIds.push(firstSessionId, secondSessionId);
    const paidSession = (id: string, reservationId: string) => ({
      id, payment_status: "paid", currency: "eur", amount_subtotal: 100, amount_total: 100,
      customer_details: { email, name: "Test Customer" },
      metadata: { store: "jacopopeca", reservation_id: reservationId, marketing_opt: "false", items_count: "1", item_0: JSON.stringify({ p: product.id, v: held.id, s: "M", q: 1, n: product.name, u: 100 }) },
    }) as unknown as import("stripe").default.Checkout.Session;
    await recordStripeCheckoutSession(paidSession(firstSessionId, firstHold.id));
    assert.equal(await db.emailJob.count({ where: { dedupeKey: { startsWith: `admin-stock:${held.id}:0:` } } }), 0, "An open hold still accounts for the last piece");
    await recordStripeCheckoutSession(paidSession(secondSessionId, secondHold.id));
    assert.equal(await db.emailJob.count({ where: { dedupeKey: { startsWith: `admin-stock:${held.id}:0:` } } }), 1);

    const sent = await processEmailJobs(notify);
    assert.equal(sent.sent, 5, "Shop alerts are transactional and do not wait for newsletter consent");
  } finally {
    globalThis.fetch = originalFetch;
    if (previousNotify === undefined) delete process.env.ADMIN_NOTIFY_EMAIL;
    else process.env.ADMIN_NOTIFY_EMAIL = previousNotify;
    if (previousKey === undefined) delete process.env.SENDGRID_API_KEY;
    else process.env.SENDGRID_API_KEY = previousKey;
    if (previousFrom === undefined) delete process.env.SENDGRID_FROM_EMAIL;
    else process.env.SENDGRID_FROM_EMAIL = previousFrom;
    await db.emailJob.deleteMany({ where: { OR: [{ email }, { email: notify }, { dedupeKey: { in: sessionIds.map((id) => `admin-order:${id}`) } }] } });
    await db.order.deleteMany({ where: { stripeCheckoutId: { in: sessionIds } } });
    await db.customer.deleteMany({ where: { email } });
    await db.checkoutReservation.deleteMany({ where: { id: { in: reservations } } });
    await db.product.delete({ where: { id: product.id } });
    await db.category.delete({ where: { id: category.id } });
  }
});

test("shop alerts are skipped when no notify address is configured", async () => {
  const { recordStripeCheckoutSession } = await import("../src/lib/stripe-order-sync");
  const suffix = randomUUID();
  const email = `silent-${suffix}@example.invalid`;
  const previousNotify = process.env.ADMIN_NOTIFY_EMAIL;
  const previousReply = process.env.SENDGRID_REPLY_TO_EMAIL;
  delete process.env.ADMIN_NOTIFY_EMAIL;
  delete process.env.SENDGRID_REPLY_TO_EMAIL;
  const category = await db.category.create({ data: { slug: `silent-${suffix}`, name: "Silent fixture" } });
  const product = await db.product.create({
    data: { slug: `silent-${suffix}`, name: "Silent fixture", description: "Temporary fixture", priceCents: 100, status: "DRAFT", categoryId: category.id, variants: { create: { sku: `silent-${suffix}`, size: "U", stock: 1 } } },
    include: { variants: true },
  });
  const sessionId = `cs_test_silent_${suffix}`;
  try {
    const session = {
      id: sessionId, payment_status: "paid", currency: "eur", amount_subtotal: 100, amount_total: 100,
      customer_details: { email, name: "Test Customer" },
      metadata: { store: "jacopopeca", marketing_opt: "false", items_count: "1", item_0: JSON.stringify({ p: product.id, v: product.variants[0].id, s: "U", q: 1, n: product.name, u: 100 }) },
    } as unknown as import("stripe").default.Checkout.Session;
    const result = await recordStripeCheckoutSession(session);
    assert.equal(result.created, true);
    assert.equal(await db.emailJob.count({ where: { dedupeKey: `admin-order:${sessionId}` } }), 0);
    assert.equal((await db.productVariant.findUniqueOrThrow({ where: { id: product.variants[0].id } })).stock, 0);
  } finally {
    if (previousNotify === undefined) delete process.env.ADMIN_NOTIFY_EMAIL;
    else process.env.ADMIN_NOTIFY_EMAIL = previousNotify;
    if (previousReply === undefined) delete process.env.SENDGRID_REPLY_TO_EMAIL;
    else process.env.SENDGRID_REPLY_TO_EMAIL = previousReply;
    await db.emailJob.deleteMany({ where: { OR: [{ email }, { dedupeKey: `admin-order:${sessionId}` }] } });
    await db.order.deleteMany({ where: { stripeCheckoutId: sessionId } });
    await db.customer.deleteMany({ where: { email } });
    await db.product.delete({ where: { id: product.id } });
    await db.category.delete({ where: { id: category.id } });
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

test("antibot guards checkout and newsletter against bots, honeypots, and flooding", async () => {
  const { POST: checkoutPost } = await import("../src/app/api/checkout/route");
  const { POST: newsletterPost } = await import("../src/app/api/newsletter/route");
  const { resetRateLimitForTests } = await import("../src/lib/antibot");
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://jacopopeca.com";
  resetRateLimitForTests();
  try {
    const crossOriginCheckout = await checkoutPost(
      new Request("http://internal-container:3000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", origin: "https://evil.example" },
        body: JSON.stringify({ items: [{ slug: "test", qty: 1 }] }),
      }),
    );
    assert.equal(crossOriginCheckout.status, 403, "Cross-origin checkout requests must be rejected");

    const botUaCheckout = await checkoutPost(
      new Request("http://internal-container:3000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "https://jacopopeca.com",
          "user-agent": "python-requests/2.31.0",
        },
        body: JSON.stringify({ items: [{ slug: "test", qty: 1 }] }),
      }),
    );
    assert.equal(botUaCheckout.status, 403, "Automated scraper/bot User-Agents must be rejected");

    const honeypotCheckout = await checkoutPost(
      new Request("http://internal-container:3000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", origin: "https://jacopopeca.com" },
        body: JSON.stringify({ items: [{ slug: "test", qty: 1 }], website: "https://spam.example" }),
      }),
    );
    assert.equal(honeypotCheckout.status, 400, "Filled checkout honeypot must fail validation");

    for (let i = 0; i < 6; i++) {
      await newsletterPost(
        new Request("http://internal-container:3000/api/newsletter/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            origin: "https://jacopopeca.com",
            "x-forwarded-for": "203.0.113.99",
          },
          body: JSON.stringify({ email: "nobody@example.invalid", consent: false }),
        }),
      );
    }
    const rateLimited = await newsletterPost(
      new Request("http://internal-container:3000/api/newsletter/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "https://jacopopeca.com",
          "x-forwarded-for": "203.0.113.99",
        },
        body: JSON.stringify({ email: "nobody@example.invalid", consent: false }),
      }),
    );
    assert.equal(rateLimited.status, 429, "Repeated requests from the same IP must be rate-limited");
  } finally {
    resetRateLimitForTests();
    process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});
