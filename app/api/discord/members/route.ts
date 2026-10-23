import { apiHandler } from "@/lib/servers/errors";
import { NextResponse } from "next/server";
import { getGuild, validCount } from "@/lib/discord/guild";
export const dynamic = "force-dynamic";
async function handleGET() {
  const { id, data } = await getGuild();
  const total = validCount(data?.approximate_member_count);
  let online = validCount(data?.approximate_presence_count);
  if (id && online === null) {
    try {
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${id}/widget.json`,
        { next: { revalidate: 60 }, signal: AbortSignal.timeout(4000) },
      );
      if (response.ok)
        online = validCount((await response.json()).presence_count);
    } catch {
      /* Widget is optional; unavailable counts remain unknown. */
    }
  }
  return NextResponse.json(
    {
      total,
      online,
      source: total !== null || online !== null ? "live" : "unavailable",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export const GET = apiHandler(handleGET);
