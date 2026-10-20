import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getPlan } from "@/config/plans";
import { createOrder } from "@/lib/orders/store";
import { buildUpiIntent } from "@/lib/payments/provider";
import { qrSvg } from "@/lib/qr";
import { site } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ planSlug: z.string() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.discordId) {
    return NextResponse.json({ error: "You must be signed in to purchase." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const plan = getPlan(parsed.data.planSlug);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 404 });
  }

  const order = await createOrder({
    planSlug: plan.slug,
    planName: plan.name,
    amount: plan.price,
    discordUserId: session.user.discordId,
    discordUsername: session.user.name ?? "Unknown",
  });

  const upiIntent = buildUpiIntent({ amount: order.amount, note: order.note });
  const svg = await qrSvg(upiIntent);

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    note: order.note,
    upiId: site.upi.id,
    payeeName: site.upi.payeeName,
    upiIntent,
    qrSvg: svg,
  });
}
