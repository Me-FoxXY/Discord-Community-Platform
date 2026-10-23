import { discordFetch } from "@/lib/discord/request";
import { ServerError } from "./errors";
export const snowflake = /^[1-9]\d{16,19}$/;
export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  permissions?: string;
  owner_id?: string;
};
type Role = {
  id: string;
  position: number;
  permissions: string;
  managed: boolean;
};
export function managesGuild(
  guild: Pick<DiscordGuild, "owner" | "permissions">,
) {
  const bits = BigInt(guild.permissions || "0");
  return !!guild.owner || (bits & 8n) !== 0n || (bits & 32n) !== 0n;
}
export async function discordRequest<T>(
  path: string,
  bearer?: string,
): Promise<T> {
  const token = bearer || process.env.DISCORD_BOT_TOKEN;
  if (!token)
    throw new ServerError("The platform bot has not been configured.", 503);
  let response: Response;
  try {
    response = await discordFetch(`https://discord.com/api/v10${path}`, {
      headers: { Authorization: `${bearer ? "Bearer" : "Bot"} ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new ServerError("Discord could not be reached. Please retry.", 503);
  }
  if (response.status === 429)
    throw new ServerError(
      "Discord is rate limiting requests. Please try again shortly.",
      429,
    );
  if (response.status === 401)
    throw new ServerError(
      bearer
        ? "Reconnect your Discord account."
        : "The platform bot credentials need attention.",
      503,
    );
  if ([403, 404].includes(response.status))
    throw new ServerError(
      "Discord access is unavailable. Check membership, bot installation, and permissions.",
      403,
    );
  if (!response.ok)
    throw new ServerError("Discord is temporarily unavailable.", 503);
  return response.json();
}
export async function guildPermissions(guildId: string, userId: string) {
  const [guild, member, roles] = await Promise.all([
    discordRequest<DiscordGuild>(`/guilds/${guildId}`),
    discordRequest<{ roles: string[] }>(`/guilds/${guildId}/members/${userId}`),
    discordRequest<Role[]>(`/guilds/${guildId}/roles`),
  ]);
  const bits = roles
    .filter((r) => r.id === guildId || member.roles.includes(r.id))
    .reduce((n, r) => n | BigInt(r.permissions), 0n);
  return {
    guild,
    member,
    roles,
    bits,
    manager: managesGuild({
      owner: guild.owner_id === userId,
      permissions: String(bits),
    }),
  };
}
export async function validateBot(guildId: string, roleId?: string) {
  if (!snowflake.test(guildId))
    throw new ServerError("Enter a valid Discord server ID.");
  const bot = await discordRequest<{ id: string }>("/users/@me");
  const result = await guildPermissions(guildId, bot.id);
  if (!(result.bits & (1n << 28n)) && !(result.bits & 8n))
    throw new ServerError("Give the bot Manage Roles permission.");
  if (roleId) {
    const role = result.roles.find((r) => r.id === roleId);
    const highest = Math.max(
      ...result.roles
        .filter((r) => result.member.roles.includes(r.id))
        .map((r) => r.position),
      0,
    );
    const privileged =
      8n | 32n | (1n << 28n) | (1n << 4n) | 2n | 4n | (1n << 29n);
    if (
      !role ||
      role.id === guildId ||
      role.managed ||
      role.position >= highest ||
      BigInt(role.permissions) & privileged
    )
      throw new ServerError(
        "Choose an ordinary perk role below the bot. Managed or administrative roles cannot be sold.",
      );
  }
  return result.guild;
}
