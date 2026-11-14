ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'FINIK';

ALTER TABLE "payments"
ADD COLUMN "providerPaymentId" TEXT,
ADD COLUMN "expiresAt" TIMESTAMP(3);

ALTER TABLE "orders"
ADD COLUMN "activePaymentId" TEXT;

CREATE UNIQUE INDEX "payments_providerPaymentId_key"
ON "payments"("providerPaymentId");

ALTER TABLE "payment_webhook_events"
ADD COLUMN "providerEventId" TEXT;

CREATE UNIQUE INDEX "payment_webhook_events_providerEventId_key"
ON "payment_webhook_events"("providerEventId");
