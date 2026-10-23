import { discordFetch } from "./request";
export class RoleDeliveryError extends Error {
  constructor(
    message: string,
    public retryAfterSeconds = 30,
  ) {
    super(message);
  }
}

const snowflake = /^[1-9]\d{16,19}$/;

export function roleTarget(planSlug: string) {
  const keys: Record<string, string> = {
    premium: "DISCORD_ROLE_PREMIUM",
    "premium-pro": "DISCORD_ROLE_PREMIUM_PRO",
    "premium-plus": "DISCORD_ROLE_PREMIUM_PLUS",
  };
  const guildId = process.env.DISCORD_GUILD_ID ?? "";
  const roleId = process.env[keys[planSlug] ?? ""] ?? "";
  if (!snowflake.test(guildId) || !snowflake.test(roleId)) {
    throw new RoleDeliveryError(
      "Configure the Discord server and this plan's role before delivering.",
    );
  }
  return { guildId, roleId };
}

export async function grantRole(
  guildId: string,
  roleId: string,
  userId: string,
  request: typeof fetch = discordFetch,
) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token)
    throw new RoleDeliveryError(
      "Configure DISCORD_BOT_TOKEN before delivering.",
    );
  if (![guildId, roleId, userId].every((id) => snowflake.test(id))) {
    throw new RoleDeliveryError(
      "A valid Discord member, server, and role are required.",
    );
  }
  let response: Response;
  try {
    // PUT adds an existing role; repeating it does not create another role.
    response = await request(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bot ${token}` },
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    throw new RoleDeliveryError(
      "Discord could not be reached. Retry delivery shortly.",
    );
  }
  if (response.status === 204) return;
  if (response.status === 429) {
    const body = await response.json().catch(() => ({}));
    const seconds = Number(
      body.retry_after ?? response.headers.get("retry-after"),
    );
    throw new RoleDeliveryError(
      "Discord is rate limiting delivery. Retry after the cooldown.",
      Number.isFinite(seconds) && seconds > 0
        ? Math.max(1, Math.ceil(seconds))
        : 60,
    );
  }
  if (response.status === 403) {
    throw new RoleDeliveryError(
      "Check the bot's Manage Roles permission and role hierarchy.",
    );
  }
  if (response.status === 404) {
    throw new RoleDeliveryError(
      "Check that the member, bot, and purchased role are in the server.",
    );
  }
  if (response.status === 401)
    throw new RoleDeliveryError("The Discord bot token is invalid.");
  throw new RoleDeliveryError(
    "Discord rejected delivery. Check the setup and retry.",
  );
}
