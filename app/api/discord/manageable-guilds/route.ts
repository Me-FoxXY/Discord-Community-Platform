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
  if (!actor.platformAdmin && !actor.registrar)
    throw new ServerError("You are not allowed to register servers.", 403);
  const grant = await prisma.discordAuthorization.findUnique({
    where: { userId: actor.userId },
  });
  if (!grant || grant.expiresAt <= new Date())
    throw new ServerError(
      "Sign out and reconnect Discord to refresh server access.",
      401,
    );
  const guilds = await discordRequest<DiscordGuild[]>(
    "/users/@me/guilds",
    decryptCredential(grant.credentials, actor.userId),
  );
  return Response.json(
    guilds
      .filter(managesGuild)
      .map(({ id, name, icon }) => ({ id, name, icon })),
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
