-- Additive migration: product videos.
CREATE TABLE IF NOT EXISTS "ProductVideo" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "posterUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "productId" TEXT NOT NULL,
  CONSTRAINT "ProductVideo_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ProductVideo_productId_idx" ON "ProductVideo"("productId");
DO $$ BEGIN
  ALTER TABLE "ProductVideo" ADD CONSTRAINT "ProductVideo_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
