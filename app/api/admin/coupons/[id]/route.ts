import { apiHandler } from "@/lib/servers/errors";
import { requireAccess } from "@/lib/servers/access";
import { currentServerId } from "@/lib/servers/context";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function handlePATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const access = await requireAccess("manage");
  const parsed = z
    .object({ active: z.boolean() })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid coupon update." },
      { status: 400 },
    );
  const result = await prisma.$transaction(async (tx) => {
    const changed = await tx.coupon.updateMany({
      where: { id: (await params).id, serverId: await currentServerId() },
      data: parsed.data,
    });
    if (changed.count)
      await tx.auditEvent.create({
        data: {
          serverId: access.server.id,
          actorId: access.userId,
          action: "coupon.update",
          outcome: "success",
        },
      });
    return changed;
  });
  if (!result.count)
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export const PATCH = apiHandler(handlePATCH);
