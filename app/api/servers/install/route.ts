import { identity } from "@/lib/servers/access";
import { apiHandler, ServerError } from "@/lib/servers/errors";
export const GET = apiHandler(async () => {
  const actor = await identity();
  if (!actor.platformAdmin && !actor.registrar)
    throw new ServerError("You are not allowed to register servers.", 403);
  const id = process.env.AUTH_DISCORD_ID;
  if (!id)
    throw new ServerError("Discord application setup is incomplete.", 503);
  const url = new URL("https://discord.com/oauth2/authorize");
  url.search = new URLSearchParams({
    client_id: id,
    scope: "bot",
    permissions: String(2 ** 28),
    integration_type: "0",
  }).toString();
  return Response.redirect(url, 302);
});
