import { prisma } from "@/lib/prisma";
import { identity } from "@/lib/servers/access";
import { apiHandler } from "@/lib/servers/errors";
import { submitServerRequest } from "@/lib/servers/requests";
export const GET = apiHandler(async () => {
  const actor = await identity();
  const requests = await prisma.serverRequest.findMany({
    where: actor.platformAdmin ? {} : { requesterId: actor.userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return Response.json(
    { requests, platformAdmin: actor.platformAdmin },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
export const POST = apiHandler(submitServerRequest);
