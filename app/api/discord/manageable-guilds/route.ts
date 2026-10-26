import { identity } from "@/lib/servers/access";
import { manageableGuilds } from "@/lib/servers/discovery";
import { apiHandler } from "@/lib/servers/errors";
export const GET = apiHandler(async () => {
  const actor = await identity();
  return Response.json(await manageableGuilds(actor.userId), {
    headers: { "Cache-Control": "private, no-store" },
  });
});
