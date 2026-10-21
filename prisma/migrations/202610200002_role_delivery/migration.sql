ALTER TABLE "Order"
  ADD COLUMN "deliveryStatus" TEXT NOT NULL DEFAULT 'not_requested',
  ADD COLUMN "deliveryGuildId" TEXT,
  ADD COLUMN "deliveryRoleId" TEXT,
  ADD COLUMN "deliveryToken" TEXT,
  ADD COLUMN "deliveryLeaseUntil" TIMESTAMP(3),
  ADD COLUMN "deliveryRetryAt" TIMESTAMP(3),
  ADD COLUMN "deliveryError" TEXT,
  ADD COLUMN "deliveredAt" TIMESTAMP(3),
  ADD COLUMN "deliveryAttempts" INTEGER NOT NULL DEFAULT 0;

-- Existing approvals had only a log hook, not verified delivery.
UPDATE "Order" SET "deliveryStatus" = 'pending' WHERE "status" = 'approved';
