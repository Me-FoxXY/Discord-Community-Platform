import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

/** PostgreSQL coordinates request spacing and cooldowns across Vercel instances. */
export async function discordFetch(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url,
  );
  const auth = new Headers(init?.headers).get("authorization") || "";
  const credential = createHash("sha256").update(auth).digest("hex");
  const route = url.pathname
    .replace(/\/members\/\d+/g, "/members/:id")
    .replace(/\/roles\/\d+/g, "/roles/:id");
  const keys = [
    `global:${credential}`,
    `${credential}:${init?.method || "GET"}:${route}`,
  ];
  // Read cooldowns first. A distant slot is rejected without lengthening the queue.
  const reserve = async (id: string) => {
    const slots = await prisma.$queryRaw<{ nextAt: Date }[]>`
      INSERT INTO "DiscordRateGate" ("id","nextAt") VALUES (${id}, clock_timestamp() + interval '100 milliseconds')
      ON CONFLICT ("id") DO UPDATE SET "nextAt" = GREATEST("DiscordRateGate"."nextAt", clock_timestamp()) + interval '100 milliseconds'
      WHERE "DiscordRateGate"."nextAt" < clock_timestamp() + interval '2 seconds'
      RETURNING "nextAt"`;
    return slots[0]?.nextAt;
  };
  let wait = 0;
  for (const key of keys) {
    const slot = await reserve(key);
    if (!slot)
      return Response.json(
        { retry_after: 3 },
        { status: 429, headers: { "retry-after": "3" } },
      );
    wait = Math.max(wait, slot.getTime() - Date.now());
  }
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  const response = await fetch(input, init);
  if (response.status === 429) {
    const body = await response
      .clone()
      .json()
      .catch(() => ({}));
    const seconds = Number(
      body.retry_after || response.headers.get("retry-after"),
    );
    const until = new Date(
      Date.now() +
        (Number.isFinite(seconds) ? Math.max(1, seconds) : 60) * 1000,
    );
    const id = body.global ? keys[0] : keys[1];
    await prisma.$executeRaw`INSERT INTO "DiscordRateGate" ("id","nextAt") VALUES (${id},${until}) ON CONFLICT ("id") DO UPDATE SET "nextAt"=GREATEST("DiscordRateGate"."nextAt",${until})`;
  }
  return response;
}
