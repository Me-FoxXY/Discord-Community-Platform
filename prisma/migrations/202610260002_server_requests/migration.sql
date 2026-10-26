CREATE TABLE "ServerRequest" (
  "id" TEXT PRIMARY KEY, "guildId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "icon" TEXT, "requesterId" TEXT NOT NULL, "message" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'pending', "reviewNote" TEXT, "reviewedBy" TEXT,
  "serverId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServerRequest_status_check" CHECK ("status" IN ('pending', 'approved', 'rejected'))
);
CREATE UNIQUE INDEX "ServerRequest_pending_guild_key" ON "ServerRequest" ("guildId") WHERE "status" = 'pending';
CREATE INDEX "ServerRequest_requesterId_createdAt_idx" ON "ServerRequest" ("requesterId", "createdAt");
CREATE INDEX "ServerRequest_status_createdAt_idx" ON "ServerRequest" ("status", "createdAt");
ALTER TABLE "AuditEvent" ADD COLUMN "requestId" TEXT;
