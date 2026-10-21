import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z.object({ active: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid coupon update." }, { status: 400 });
  const result = await prisma.coupon.updateMany({ where: { id: (await params).id }, data: parsed.data });
  if (!result.count) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
