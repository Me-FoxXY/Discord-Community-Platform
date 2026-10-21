ALTER TABLE "Order"
  ADD COLUMN "subtotal" INTEGER,
  ADD COLUMN "discountAmount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "couponCode" TEXT;
UPDATE "Order" SET "subtotal" = "amount";
ALTER TABLE "Order" ALTER COLUMN "subtotal" SET NOT NULL;

CREATE TABLE "Coupon" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "minAmount" INTEGER NOT NULL DEFAULT 0,
  "planSlug" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Coupon_value_check" CHECK (
    ("kind" = 'percent' AND "value" BETWEEN 1 AND 99) OR
    ("kind" = 'fixed' AND "value" > 0)
  ),
  CONSTRAINT "Coupon_minAmount_check" CHECK ("minAmount" >= 0)
);
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
