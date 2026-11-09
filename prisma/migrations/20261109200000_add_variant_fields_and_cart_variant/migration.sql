-- AlterTable ProductVariant: add nameRu, nameKy, price fields
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "nameRu" TEXT;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "nameKy" TEXT;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2);

-- AlterTable CartItem: add variantId field
ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "variantId" TEXT;

-- Add foreign key for variantId (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_variantId_fkey') THEN
        ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateIndex (if not exists)
CREATE INDEX IF NOT EXISTS "cart_items_variantId_idx" ON "cart_items"("variantId");

