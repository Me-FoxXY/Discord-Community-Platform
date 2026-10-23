import { z } from "zod";
import { requireAccess } from "@/lib/servers/access";
import { apiHandler, ServerError } from "@/lib/servers/errors";
import { prisma } from "@/lib/prisma";
import { guildPermissions, snowflake } from "@/lib/servers/discord";
type Context = { params: Promise<{ id: string }> };
export const GET = apiHandler(async (_req: Request, { params }: Context) => {
  const access = await requireAccess("manage", (await params).id, true);
  return Response.json(
    await prisma.serverAccess.findMany({
      where: { serverId: access.server.id },
    }),
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
export const PUT = apiHandler(async (req: Request, { params }: Context) => {
  const access = await requireAccess("manage", (await params).id);
  const input = z
    .object({
      userId: z.string().regex(snowflake),
      role: z.enum(["manager", "reviewer", "viewer", "remove"]),
    })
    .safeParse(await req.json().catch(() => null));
  if (!input.success)
    throw new ServerError("Enter a valid Discord user ID and role.");
  const { userId, role } = input.data;
  if (userId === access.userId)
    throw new ServerError("Ask another manager to change your own access.");
  if (role !== "remove") {
    if (!access.server.guildId)
      throw new ServerError("Configure this server first.");
    const permission = await guildPermissions(access.server.guildId, userId);
    if (role === "manager" && !permission.manager)
      throw new ServerError(
        "Server managers must also have Manage Server or Administrator in Discord.",
      );
  }
  await prisma.$transaction(async (tx) => {
    if (role === "remove")
      await tx.serverAccess.deleteMany({
        where: { serverId: access.server.id, userId },
      });
    else
      await tx.serverAccess.upsert({
        where: { serverId_userId: { serverId: access.server.id, userId } },
        create: {
          serverId: access.server.id,
          userId,
          role,
          grantedBy: access.userId,
        },
        update: { role, grantedBy: access.userId },
      });
    await tx.auditEvent.create({
      data: {
        serverId: access.server.id,
        actorId: access.userId,
        action: `access.${role}.${userId}`,
        outcome: "success",
      },
    });
  });
  return Response.json({ ok: true });
});
