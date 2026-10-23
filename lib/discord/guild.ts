import { discordFetch } from "./request";
import { currentServer } from "@/lib/servers/context";
import { cache } from "react";
export type GuildStatus =
  | "ready"
  | "missing_server"
  | "invalid_server"
  | "missing_bot"
  | "invalid_bot"
  | "no_access"
  | "unavailable";
export const getGuild = cache(async () => {
  const server = await currentServer();
  const id = server.status === "active" ? server.guildId : null;
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!id)
    return { status: "missing_server" as GuildStatus, id: null, data: null };
  if (!/^[1-9]\d{16,19}$/.test(id))
    return { status: "invalid_server" as GuildStatus, id: null, data: null };
  if (!token) return { status: "missing_bot" as GuildStatus, id, data: null };
  try {
    const response = await discordFetch(
      `https://discord.com/api/v10/guilds/${id}?with_counts=true`,
      {
        headers: { Authorization: `Bot ${token}` },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok)
      return {
        status: (response.status === 401
          ? "invalid_bot"
          : [403, 404].includes(response.status)
            ? "no_access"
            : "unavailable") as GuildStatus,
        id,
        data: null,
      };
    const data = await response.json();
    return {
      status: "ready" as GuildStatus,
      id,
      data: data as {
        banner?: string | null;
        approximate_member_count?: number;
        approximate_presence_count?: number;
      },
    };
  } catch {
    return { status: "unavailable" as GuildStatus, id, data: null };
  }
});
export const validCount = (value: unknown): number | null =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;
