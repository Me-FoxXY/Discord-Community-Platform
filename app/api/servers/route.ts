import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { identity } from "@/lib/servers/access";
import { apiHandler, ServerError } from "@/lib/servers/errors";
import {
  guildPermissions,
  validateBot,
  snowflake,
} from "@/lib/servers/discord";

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
      canRegister: actor.platformAdmin || actor.registrar,
      platformAdmin: actor.platformAdmin,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
export const POST = apiHandler(async (req: Request) => {
  const actor = await identity();
  if (!actor.platformAdmin && !actor.registrar)
    throw new ServerError(
      "A website administrator must allow you to register servers.",
      403,
    );
  const parsed = z
    .object({ guildId: z.string().regex(snowflake) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    throw new ServerError("Enter a valid Discord server ID.");
  const { guildId } = parsed.data;
  const permission = await guildPermissions(guildId, actor.userId);
  if (!permission.manager) {
    await prisma.auditEvent.create({
      data: {
        actorId: actor.userId,
        action: "server.register",
        outcome: "denied",
      },
    });
    throw new ServerError(
      "You do not have sufficient permissions to add or manage this server. Please contact a website administrator or obtain the required authorization.",
      403,
    );
  }
  const guild = await validateBot(guildId);
  const server = await prisma.$transaction(async (tx) => {
    const created = await tx.server.create({
      data: {
        guildId,
        name: guild.name,
        icon: guild.icon,
        createdBy: actor.userId,
        updatedBy: actor.userId,
        access: {
          create: {
            userId: actor.userId,
            role: "manager",
            grantedBy: actor.userId,
          },
        },
      },
    });
    await tx.storeSettings.create({
      data: { id: created.id, serverId: created.id },
    });
    await tx.auditEvent.create({
      data: {
        actorId: actor.userId,
        serverId: created.id,
        action: "server.register",
        outcome: "success",
      },
    });
    return created;
  });
  return Response.json({ id: server.id }, { status: 201 });
});
