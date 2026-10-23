import { z } from "zod";
import { identity } from "@/lib/servers/access";
import { apiHandler, ServerError } from "@/lib/servers/errors";
import { prisma } from "@/lib/prisma";
import { snowflake } from "@/lib/servers/discord";
import { adminIds } from "@/lib/auth/admin";
export const GET = apiHandler(async () => {
  const actor = await identity();
  if (!actor.platformAdmin)
    throw new ServerError(
      "Only platform administrators can manage registration access.",
      403,
    );
  return Response.json(
    await prisma.platformAccess.findMany({ orderBy: { userId: "asc" } }),
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
export const PUT = apiHandler(async (req: Request) => {
  const actor = await identity();
  if (!actor.platformAdmin)
    throw new ServerError(
      "Only platform administrators can manage registration access.",
      403,
    );
  const input = z
    .object({
      userId: z.string().regex(snowflake),
      role: z.enum(["registrar", "remove"]),
    })
    .safeParse(await req.json().catch(() => null));
  if (!input.success) throw new ServerError("Enter a valid Discord user ID.");
  if (
    input.data.userId === actor.userId ||
    adminIds().includes(input.data.userId)
  )
    throw new ServerError("Bootstrap administrators cannot be changed here.");
  await prisma.$transaction(async (tx) => {
    const existing = await tx.platformAccess.findUnique({
      where: { userId: input.data.userId },
    });
    if (existing?.role === "administrator")
      throw new ServerError(
        "Platform administrator changes require the infrastructure operator.",
      );
    if (input.data.role === "remove")
      await tx.platformAccess.deleteMany({
        where: { userId: input.data.userId },
      });
    else
      await tx.platformAccess.upsert({
        where: { userId: input.data.userId },
        create: input.data,
        update: { role: input.data.role },
      });
    await tx.auditEvent.create({
      data: {
        actorId: actor.userId,
        action: `platform.${input.data.role}.${input.data.userId}`,
        outcome: "success",
      },
    });
  });
  return Response.json({ ok: true });
});
