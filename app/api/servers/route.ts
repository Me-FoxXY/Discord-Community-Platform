import { prisma } from "@/lib/prisma";
import { identity } from "@/lib/servers/access";
import { apiHandler } from "@/lib/servers/errors";
import { submitServerRequest } from "@/lib/servers/requests";
export const GET = apiHandler(async () => {
  const actor = await identity();
  const servers = await prisma.server.findMany({
    where: actor.platformAdmin
      ? {}
      : { access: { some: { userId: actor.userId } } },
    select: {
      id: true,
      name: true,
      guildId: true,
      icon: true,
      status: true,
      version: true,
    },
    orderBy: { name: "asc" },
  });
  return Response.json(
    {
      servers,
      canRegister: false,
      platformAdmin: actor.platformAdmin,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
export const POST = apiHandler(submitServerRequest);
