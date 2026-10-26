import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { identity } from "./access";
import { manageableGuilds } from "./discovery";
import { guildPermissions, snowflake, validateBot } from "./discord";
import { ServerError } from "./errors";

export async function submitServerRequest(req: Request) {
  const actor = await identity();
  const parsed = z
    .object({
      guildId: z.string().regex(snowflake),
      message: z.string().trim().max(1000).default(""),
    })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    throw new ServerError(
      "Choose a valid Discord server and keep your message under 1,000 characters.",
    );
  const guild = (await manageableGuilds(actor.userId)).find(
    (g) => g.id === parsed.data.guildId,
  );
  if (!guild)
    throw new ServerError(
      "You must own this Discord server or have Administrator or Manage Server permission to request access.",
      403,
    );
  const existing = await prisma.server.findUnique({
    where: { guildId: guild.id },
  });
  if (existing)
    throw new ServerError(
      "This server is already connected. Contact its website manager for access.",
      409,
    );
  if (
    await prisma.serverRequest.findFirst({
      where: { guildId: guild.id, status: "pending" },
    })
  )
    throw new ServerError(
      "A request for this server is already awaiting review.",
      409,
    );
  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.serverRequest.create({
      data: {
        guildId: guild.id,
        name: guild.name,
        icon: guild.icon,
        requesterId: actor.userId,
        message: parsed.data.message,
      },
    });
    await tx.auditEvent.create({
      data: {
        requestId: request.id,
        actorId: actor.userId,
        action: "server.request",
        outcome: "success",
      },
    });
    return request;
  });
  return Response.json(result, { status: 201 });
}

export async function reviewServerRequest(req: Request, id: string) {
  const actor = await identity();
  if (!actor.platformAdmin)
    throw new ServerError(
      "Only website administrators can review server requests.",
      403,
    );
  const parsed = z
    .object({
      decision: z.enum(["approved", "rejected"]),
      note: z.string().trim().max(1000).default(""),
    })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    throw new ServerError(
      "Choose approve or reject and keep your note under 1,000 characters.",
    );
  const { decision, note } = parsed.data;
  if (decision === "rejected" && !note)
    throw new ServerError(
      "Add a reason so the requester knows what to change.",
    );
  const pending = await prisma.serverRequest.findUnique({ where: { id } });
  if (!pending) throw new ServerError("Request not found.", 404);
  if (pending.status !== "pending")
    throw new ServerError(
      "This request has already been reviewed. Refresh the list.",
      409,
    );
  let guild: Awaited<ReturnType<typeof validateBot>> | undefined;
  if (decision === "approved") {
    guild = await validateBot(pending.guildId);
    const permission = await guildPermissions(
      pending.guildId,
      pending.requesterId,
    );
    if (!permission.manager)
      throw new ServerError(
        "The requester no longer has Discord management permission. Approval was not saved.",
        403,
      );
  }
  const result = await prisma.$transaction(async (tx) => {
    const changed = await tx.serverRequest.updateMany({
      where: { id, status: "pending" },
      data: { status: decision, reviewNote: note, reviewedBy: actor.userId },
    });
    if (changed.count !== 1)
      throw new ServerError(
        "Another administrator already reviewed this request.",
        409,
      );
    let serverId: string | null = null;
    if (decision === "approved" && guild) {
      const server = await tx.server.create({
        data: {
          guildId: guild.id,
          name: guild.name,
          icon: guild.icon,
          createdBy: pending.requesterId,
          updatedBy: actor.userId,
          access: {
            create: {
              userId: pending.requesterId,
              role: "manager",
              grantedBy: actor.userId,
            },
          },
        },
      });
      serverId = server.id;
      await tx.storeSettings.create({
        data: { id: server.id, serverId: server.id },
      });
      await tx.serverRequest.update({ where: { id }, data: { serverId } });
    }
    await tx.auditEvent.create({
      data: {
        requestId: id,
        serverId,
        actorId: actor.userId,
        action: `server.request.${decision}`,
        outcome: "success",
      },
    });
    return { status: decision, serverId };
  });
  return Response.json(result);
}
