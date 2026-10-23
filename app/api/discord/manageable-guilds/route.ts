import { identity } from "@/lib/servers/access";
import { prisma } from "@/lib/prisma";
import { decryptCredential } from "@/lib/servers/crypto";
import {
  discordRequest,
  managesGuild,
  type DiscordGuild,
} from "@/lib/servers/discord";
import { apiHandler, ServerError } from "@/lib/servers/errors";
export const GET = apiHandler(async () => {
  const actor = await identity();
  if (!/^[a-fA-F0-9]{64}$/.test(process.env.CONFIG_ENCRYPTION_KEY || ""))
    throw new ServerError(
      "Server discovery is not configured. Ask the website operator to set CONFIG_ENCRYPTION_KEY, then reconnect Discord.",
      503,
    );
  const grant = await prisma.discordAuthorization.findUnique({
    where: { userId: actor.userId },
  });
  if (!grant || grant.expiresAt <= new Date())
    throw new ServerError(
      "Sign out and reconnect Discord to refresh server access.",
      401,
    );
  let credential: string;
  try {
    credential = decryptCredential(grant.credentials, actor.userId);
  } catch {
    throw new ServerError(
      "Reconnect Discord to restore server discovery.",
      401,
    );
  }
  const guilds = await discordRequest<DiscordGuild[]>(
    "/users/@me/guilds?limit=200",
    credential,
  );
  return Response.json(
    guilds
      .filter(managesGuild)
      .map(({ id, name, icon }) => ({ id, name, icon })),
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
