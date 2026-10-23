import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkoutSchema, quoteOrder } from "@/lib/coupons/quote";
import { CouponError } from "@/lib/coupons/pricing";
import { createOrder } from "@/lib/orders/store";
import { buildUpiIntent } from "@/lib/payments/provider";
import { qrSvg } from "@/lib/qr";
import { site } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.discordId) {
    return NextResponse.json({ error: "You must be signed in to purchase." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let quote;
  try {
    quote = await quoteOrder(parsed.data);
  } catch (error) {
    if (error instanceof CouponError) return NextResponse.json({ error: error.message }, { status: 400 });
    throw error;
  }
  const { plan } = quote;

  const order = await createOrder({
    planSlug: plan.slug,
    planName: plan.name,
    amount: quote.amount,
    subtotal: quote.subtotal,
    discountAmount: quote.discountAmount,
    couponCode: quote.couponCode,
    roleId: plan.roleId,
    discordUserId: session.user.discordId,
    discordUsername: session.user.name ?? "Unknown",
  });

  const upiIntent = buildUpiIntent({ amount: order.amount, note: order.note });
  const svg = await qrSvg(upiIntent);

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    couponCode: order.couponCode,
    note: order.note,
    upiId: site.upi.id,
    payeeName: site.upi.payeeName,
    upiIntent,
    qrSvg: svg,
  });
}
