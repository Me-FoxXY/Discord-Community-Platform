import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentServerId } from "./context";
import { guildPermissions } from "./discord";
import { ServerError } from "./errors";

export type Capability = "view" | "review" | "manage";
export function permits(role: string, capability: Capability) {
  return (
    role === "manager" ||
    (role === "reviewer" && capability !== "manage") ||
    (role === "viewer" && capability === "view")
  );
}
export async function identity() {
  const session = await auth();
  if (!session?.user?.discordId)
    throw new ServerError("Sign in to continue.", 401);
  const platform = await prisma.platformAccess.findUnique({
    where: { userId: session.user.discordId },
  });
  return {
    userId: session.user.discordId,
    platformAdmin: !!session.user.isAdmin || platform?.role === "administrator",
    registrar: platform?.role === "registrar",
  };
}
export async function requireAccess(
  capability: Capability,
  explicitId?: string,
  allowDisabled = false,
) {
  const actor = await identity();
  const serverId = explicitId || (await currentServerId());
  const server = await prisma.server.findUnique({ where: { id: serverId } });
  if (!server) throw new ServerError("Server not found.", 404);
  const assignment = await prisma.serverAccess.findUnique({
    where: { serverId_userId: { serverId, userId: actor.userId } },
  });
  if (!actor.platformAdmin) {
    let allowed = !!assignment && permits(assignment.role, capability);
    if (allowed && server.guildId) {
      const live = await guildPermissions(server.guildId, actor.userId);
      if (assignment!.role === "manager") allowed = live.manager;
    } else allowed = false;
    if (!allowed) {
      await prisma.auditEvent.create({
        data: {
          serverId,
          actorId: actor.userId,
          action: `access.${capability}`,
          outcome: "denied",
        },
      });
      throw new ServerError(
        "You do not have sufficient permissions to add or manage this server. Please contact a website administrator or obtain the required authorization.",
        403,
      );
    }
  }
  if (!allowDisabled && server.status !== "active")
    throw new ServerError(
      "This server is disabled. New operations are paused.",
      409,
    );
  return {
    ...actor,
    server,
    role: actor.platformAdmin ? "manager" : assignment!.role,
  };
}
