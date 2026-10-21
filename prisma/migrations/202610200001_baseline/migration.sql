CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "planSlug" TEXT NOT NULL,
  "planName" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "note" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'awaiting_payment',
  "discordUserId" TEXT NOT NULL,
  "discordUsername" TEXT NOT NULL,
  "utr" TEXT,
  "screenshotPath" TEXT,
  "screenshotHash" TEXT,
  "duplicateFlag" BOOLEAN NOT NULL DEFAULT false,
  "reviewedBy" TEXT,
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Order_note_key" ON "Order"("note");
CREATE UNIQUE INDEX "Order_utr_key" ON "Order"("utr");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_discordUserId_idx" ON "Order"("discordUserId");
