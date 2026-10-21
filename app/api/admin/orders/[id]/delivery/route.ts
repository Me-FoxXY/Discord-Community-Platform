import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deliverOrder, DeliveryConflictError } from "@/lib/orders/delivery";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.isAdmin || !session.user.discordId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const order = await deliverOrder((await params).id);
    return NextResponse.json({
      ok: true, status: order.status, deliveryStatus: order.deliveryStatus,
      deliveryError: order.deliveryError,
    });
  } catch (error) {
    if (error instanceof DeliveryConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
