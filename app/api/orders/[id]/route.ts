import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrder } from "@/lib/orders/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const isOwner = session?.user?.discordId === order.discordUserId;
  if (!isOwner && !session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
