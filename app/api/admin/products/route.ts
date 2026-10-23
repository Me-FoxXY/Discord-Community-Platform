import { apiHandler } from "@/lib/servers/errors";
import { validateBot } from "@/lib/servers/discord";
import { currentServer } from "@/lib/servers/context";
import { requireAccess } from "@/lib/servers/access";
import { currentServerId } from "@/lib/servers/context";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema, productPlan } from "@/lib/product-input";
import type { Plan } from "@/config/plans";

async function save(req: Request, editing: boolean) {
  const access = await requireAccess("manage");
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  const { slug, roleId, enabled } = parsed.data;
  const server = await currentServer();
  if (enabled) {
    if (!server.guildId || !roleId)
      return NextResponse.json(
        { error: "Set a valid server and role before publishing." },
        { status: 400 },
      );
    await validateBot(server.guildId, roleId);
  }
  const old = await prisma.product.findUnique({
    where: { serverId_slug: { serverId: await currentServerId(), slug } },
  });
  if (editing && !old)
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  const data = JSON.parse(
    JSON.stringify(
      productPlan(parsed.data, old?.data as unknown as Plan | undefined),
    ),
  );
  try {
    await prisma.$transaction(async (tx) => {
      if (editing)
        await tx.product.update({
          where: { serverId_slug: { serverId: await currentServerId(), slug } },
          data: { data, roleId, enabled },
        });
      else
        await tx.product.create({
          data: {
            serverId: await currentServerId(),
            slug,
            data,
            roleId,
            enabled,
          },
        });
      await tx.auditEvent.create({
        data: {
          serverId: server.id,
          actorId: access.userId,
          action: editing ? "product.update" : "product.create",
          outcome: "success",
        },
      });
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That product URL already exists. Choose another slug." },
        { status: 409 },
      );
    }
    throw error;
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
export const POST = apiHandler((req: Request) => save(req, false));
export const PATCH = apiHandler((req: Request) => save(req, true));
