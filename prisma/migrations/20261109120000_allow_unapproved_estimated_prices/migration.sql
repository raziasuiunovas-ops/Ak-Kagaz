-- Additive catalog change: keep an estimated selling price available to admins
-- without activating it or inventing a purchase cost.
ALTER TABLE "product_prices"
  ALTER COLUMN "purchasePrice" DROP NOT NULL;

ALTER TABLE "product_prices"
  ADD COLUMN "isEstimate" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "estimateBasis" TEXT;
