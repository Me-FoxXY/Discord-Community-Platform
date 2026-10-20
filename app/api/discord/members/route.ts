import { NextResponse } from "next/server";
import { site } from "@/config/site";

export const revalidate = 60;

// Mock fallback used when no guild id is set or the widget is unavailable.
const MOCK = { total: 24800, online: 3100, source: "mock" as const };

export async function GET() {
  const guildId = site.guildId;
  if (!guildId) {
    return NextResponse.json(MOCK);
  }

  try {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`widget ${res.status}`);
    const data = (await res.json()) as {
      presence_count?: number;
      members?: unknown[];
      name?: string;
    };
    return NextResponse.json({
      total: MOCK.total, // widget.json exposes online presence, not full member count
      online: data.presence_count ?? MOCK.online,
      source: "live" as const,
    });
  } catch {
    return NextResponse.json(MOCK);
  }
}
