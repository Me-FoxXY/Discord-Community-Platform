import { PrismaClient, type Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { afterAll, afterEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ tx: null as Prisma.TransactionClient | null }));
vi.mock("@/lib/prisma", () => ({ prisma: {
  $queryRaw: (...args: unknown[]) => (state.tx!.$queryRaw as Function)(...args),
  $executeRaw: (...args: unknown[]) => (state.tx!.$executeRaw as Function)(...args),
} }));
import { discordFetch } from "@/lib/discord/request";
const db = new PrismaClient({ log: [] });
afterAll(() => db.$disconnect());
afterEach(() => vi.unstubAllGlobals());

for (const zone of ["Asia/Calcutta", "UTC"]) {
  it(`reserves a short wait and respects Discord cooldowns in ${zone}`, async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ retry_after: 30, global: true }, { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);
    const authorization = `Bot test-${randomUUID()}`;
    // Roll back test-only rate slots after exercising a real PostgreSQL session.
    const rollback = new Error("rollback rate test");
    await expect(db.$transaction(async tx => {
      state.tx = tx;
      await tx.$queryRaw`SELECT set_config('TimeZone', ${zone}, true)`;
      const start = performance.now();
      expect((await discordFetch("https://discord.com/api/v10/users/@me", {
        headers: { authorization },
      })).status).toBe(429);
      expect(performance.now() - start).toBeLessThan(2500);
      const blocked = await discordFetch("https://discord.com/api/v10/users/@me", {
        headers: { authorization },
      });
      expect(blocked.status).toBe(429);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      throw rollback;
    }, { timeout: 5000 })).rejects.toBe(rollback);
    state.tx = null;
  }, 10000);
}
