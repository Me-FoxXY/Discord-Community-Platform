import { apiHandler } from "@/lib/servers/errors";
import { requireAccess } from "@/lib/servers/access";
import { currentServerId } from "@/lib/servers/context";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/catalog";

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z0-9_-]{3,32}$/,
        "Use 3–32 letters, numbers, hyphens or underscores.",
      ),
    kind: z.enum(["percent", "fixed"]),
    value: z.number().int().positive().max(100000),
    minAmount: z.number().int().min(0).max(100000),
    planSlug: z.string().max(80).nullable(),
    expiresAt: z.string().datetime().nullable(),
  })
  .refine((data) => data.kind !== "percent" || data.value < 100, {
    message: "Percentage discounts must be between 1 and 99.",
  });

async function handlePOST(req: Request) {
  const session = await auth();
  const access = await requireAccess("manage");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  if (parsed.data.planSlug && !(await getPlan(parsed.data.planSlug))) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }
  const expiresAt = parsed.data.expiresAt
    ? new Date(parsed.data.expiresAt)
    : null;
  if (expiresAt && expiresAt <= new Date()) {
    return NextResponse.json(
      { error: "Choose a future expiry time." },
      { status: 400 },
    );
  }
  try {
    const coupon = await prisma.$transaction(async (tx) => {
      const row = await tx.coupon.create({
        data: { serverId: access.server.id, ...parsed.data, expiresAt },
      });
      await tx.auditEvent.create({
        data: {
          serverId: access.server.id,
          actorId: access.userId,
          action: "coupon.create",
          outcome: "success",
        },
      });
      return row;
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That coupon code already exists." },
        { status: 409 },
      );
    }
    throw error;
  }
}

export const POST = apiHandler(handlePOST);
