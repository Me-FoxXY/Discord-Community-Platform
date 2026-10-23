import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/servers/access";
import { apiHandler, ServerError } from "@/lib/servers/errors";
type Context = { params: Promise<{ id: string }> };
export const GET = apiHandler(async (_req: Request, { params }: Context) => {
  const access = await requireAccess("view", (await params).id, true);
  const audit =
    access.role === "manager"
      ? await prisma.auditEvent.findMany({
          where: { serverId: access.server.id },
          orderBy: { createdAt: "desc" },
          take: 30,
        })
      : [];
  return Response.json(
    { server: access.server, role: access.role, audit },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
const schema = z.object({
  version: z.number().int().positive(),
  name: z.string().trim().min(1).max(100),
  inviteUrl: z
    .string()
    .max(200)
    .refine(
      (v) =>
        v === "" ||
        /^https:\/\/(discord\.gg\/[A-Za-z0-9-]+|discord\.com\/invite\/[A-Za-z0-9-]+)$/.test(
          v,
        ),
    ),
  upiId: z
    .string()
    .trim()
    .max(100)
    .refine((v) => v === "" || /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/.test(v)),
  payeeName: z.string().trim().max(100),
  status: z.enum(["active", "disabled", "archived"]),
});
export const PATCH = apiHandler(async (req: Request, { params }: Context) => {
  const access = await requireAccess("manage", (await params).id, true);
  const input = schema.safeParse(await req.json().catch(() => null));
  if (!input.success)
    throw new ServerError(
      "Check the server name, invite URL, payment details, and version.",
    );
  const { version, ...data } = input.data;
  await prisma.$transaction(async (tx) => {
    const changed = await tx.server.updateMany({
      where: { id: access.server.id, version },
      data: { ...data, version: { increment: 1 }, updatedBy: access.userId },
    });
    if (!changed.count)
      throw new ServerError(
        "Someone changed this server. Reload before saving.",
        409,
      );
    await tx.auditEvent.create({
      data: {
        serverId: access.server.id,
        actorId: access.userId,
        action: `server.update.${data.status}`,
        outcome: "success",
      },
    });
  });
  return Response.json({ ok: true });
});
