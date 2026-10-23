import { apiHandler } from "@/lib/servers/errors";
import { requireAccess } from "@/lib/servers/access";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrder } from "@/lib/orders/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleGET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const order = await getOrder(id);
  if (!order)
    return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const isOwner = session?.user?.discordId === order.discordUserId;
  if (!isOwner) await requireAccess("review", order.serverId, true);

  return NextResponse.json({
    id: order.id,
    status: order.status,
    deliveryStatus: order.deliveryStatus,
    planName: order.planName,
    amount: order.amount,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    couponCode: order.couponCode,
    note: order.note,
    utr: order.utr,
    reviewNote: order.reviewNote,
    createdAt: order.createdAt,
  });
}

export const GET = apiHandler(handleGET);
