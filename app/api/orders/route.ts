import { apiHandler } from "@/lib/servers/errors";
import { currentServer } from "@/lib/servers/context";
import { ServerError } from "@/lib/servers/errors";
import { discordRequest, validateBot } from "@/lib/servers/discord";
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

async function handlePOST(req: Request) {
  const session = await auth();
  if (!session?.user?.discordId) {
    return NextResponse.json(
      { error: "You must be signed in to purchase." },
      { status: 401 },
    );
  }

  const server = await currentServer();
  if (
    server.status !== "active" ||
    !server.guildId ||
    !server.upiId ||
    !server.payeeName
  )
    throw new ServerError("This store is not ready for purchases.", 409);
  await discordRequest(
    `/guilds/${server.guildId}/members/${session.user.discordId}`,
  );
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let quote;
  try {
    quote = await quoteOrder(parsed.data);
  } catch (error) {
    if (error instanceof CouponError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    throw error;
  }
  const { plan } = quote;
  if (!plan.roleId)
    throw new ServerError("This product is not ready for purchase.", 409);
  await validateBot(server.guildId, plan.roleId);

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

  const upiIntent = buildUpiIntent({
    amount: order.amount,
    note: order.note,
    upiId: order.paymentUpiId!,
    payeeName: order.paymentPayee!,
  });
  const svg = await qrSvg(upiIntent);

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    couponCode: order.couponCode,
    note: order.note,
    upiId: order.paymentUpiId,
    payeeName: order.paymentPayee,
    upiIntent,
    qrSvg: svg,
  });
}

export const POST = apiHandler(handlePOST);
