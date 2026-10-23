import { apiHandler } from "@/lib/servers/errors";
import { requireAccess } from "@/lib/servers/access";
import { currentServerId } from "@/lib/servers/context";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deliverOrder, DeliveryConflictError } from "@/lib/orders/delivery";

export const runtime = "nodejs";

async function handlePOST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  await requireAccess("review");
  try {
    const order = await deliverOrder((await params).id);
    return NextResponse.json({
      ok: true,
      status: order.status,
      deliveryStatus: order.deliveryStatus,
      deliveryError: order.deliveryError,
    });
  } catch (error) {
    if (error instanceof DeliveryConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

export const POST = apiHandler(handlePOST);
