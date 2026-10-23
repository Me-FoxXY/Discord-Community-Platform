import { requireAccess } from "@/lib/servers/access";
import { apiHandler, ServerError } from "@/lib/servers/errors";
import { validateBot } from "@/lib/servers/discord";
import { prisma } from "@/lib/prisma";
export const POST = apiHandler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const access = await requireAccess("view", (await params).id, true);
    if (!access.server.guildId)
      throw new ServerError(
        "Import the original server configuration before validation.",
      );
    const guild = await validateBot(access.server.guildId);
    const products = await prisma.product.findMany({
      where: { serverId: access.server.id, enabled: true },
      select: { roleId: true },
    });
    for (const product of products) {
      if (!product.roleId)
        throw new ServerError("A published product has no role.");
      await validateBot(guild.id, product.roleId);
    }
    return Response.json({
      status: "ready",
      message: "Bot access and published product roles verified.",
      checkedAt: new Date().toISOString(),
    });
  },
);
