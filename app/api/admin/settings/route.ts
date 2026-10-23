import { apiHandler } from "@/lib/servers/errors";
import { requireAccess } from "@/lib/servers/access";
import { currentServerId } from "@/lib/servers/context";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  accentColor: z.string().regex(/^#[0-9a-f]{6}$/i),
});
async function handlePATCH(req: Request) {
  const access = await requireAccess("manage");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter valid six-digit hex colors." },
      { status: 400 },
    );
  await prisma.$transaction(async (tx) => {
    await tx.storeSettings.upsert({
      where: { serverId: await currentServerId() },
      create: {
        id: await currentServerId(),
        serverId: await currentServerId(),
        ...parsed.data,
      },
      update: parsed.data,
    });
    await tx.auditEvent.create({
      data: {
        serverId: access.server.id,
        actorId: access.userId,
        action: "theme.update",
        outcome: "success",
      },
    });
  });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export const PATCH = apiHandler(handlePATCH);
