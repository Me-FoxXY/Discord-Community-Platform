import { prisma } from "@/lib/prisma";
import { decryptCredential } from "./crypto";
import { discordRequest, managesGuild, type DiscordGuild } from "./discord";
import { ServerError } from "./errors";

export async function manageableGuilds(userId: string) {
  if (!/^[a-fA-F0-9]{64}$/.test(process.env.CONFIG_ENCRYPTION_KEY || ""))
    throw new ServerError(
      "Server discovery is not configured. Ask the website operator to set CONFIG_ENCRYPTION_KEY, then reconnect Discord.",
      503,
    );
  const grant = await prisma.discordAuthorization.findUnique({
    where: { userId },
  });
  if (!grant || grant.expiresAt <= new Date())
    throw new ServerError(
      "Sign out and reconnect Discord to refresh server access.",
      401,
    );
  let token: string;
  try {
    token = decryptCredential(grant.credentials, userId);
  } catch {
    throw new ServerError(
      "Reconnect Discord to restore server discovery.",
      401,
    );
  }
  const guilds = await discordRequest<DiscordGuild[]>(
    "/users/@me/guilds?limit=200",
    token,
  );
  return guilds
    .filter(managesGuild)
    .map(({ id, name, icon }) => ({ id, name, icon }));
}
