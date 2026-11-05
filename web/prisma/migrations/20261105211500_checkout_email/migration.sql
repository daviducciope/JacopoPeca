-- Additive migration. Existing customers are deliberately not subscribed.
CREATE TABLE IF NOT EXISTS "NewsletterSubscription" (
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "confirmationToken" TEXT,
  "confirmationRequestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "consentVersion" TEXT NOT NULL DEFAULT '2026-11-05',
  "confirmedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("email")
);
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscription_token_key" ON "NewsletterSubscription"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscription_confirmationToken_key" ON "NewsletterSubscription"("confirmationToken");
CREATE TABLE IF NOT EXISTS "EmailJob" (
  "id" TEXT NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "lockedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EmailJob_dedupeKey_key" ON "EmailJob"("dedupeKey");
CREATE INDEX IF NOT EXISTS "EmailJob_sentAt_cancelledAt_scheduledAt_idx" ON "EmailJob"("sentAt", "cancelledAt", "scheduledAt");
CREATE TABLE IF NOT EXISTS "CheckoutReservation" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT,
  "items" JSONB NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'HOLD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CheckoutReservation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CheckoutReservation_sessionId_key" ON "CheckoutReservation"("sessionId");
CREATE INDEX IF NOT EXISTS "CheckoutReservation_state_expiresAt_idx" ON "CheckoutReservation"("state", "expiresAt");
