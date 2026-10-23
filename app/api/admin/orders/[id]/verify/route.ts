import { apiHandler } from "@/lib/servers/errors";
import { requireAccess } from "@/lib/servers/access";
import { currentServerId } from "@/lib/servers/context";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getOrder, reviewOrder, OrderConflictError } from "@/lib/orders/store";
import { deliverOrder, DeliveryConflictError } from "@/lib/orders/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(500).optional(),
});

async function handlePOST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // Defense in depth — middleware already gates /api/admin.
  const session = await auth();
  const access = await requireAccess("review", undefined, true);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const order = await getOrder(id);
  if (!order)
    return NextResponse.json({ error: "Order not found." }, { status: 404 });

  try {
    let updated = await reviewOrder(
      id,
      parsed.data.action,
      access.userId,
      parsed.data.note,
    );
    if (parsed.data.action === "approve" && access.server.status === "active")
      updated = await deliverOrder(id);
    return NextResponse.json({
      ok: true,
      status: updated.status,
      deliveryStatus: updated.deliveryStatus,
      deliveryError: updated.deliveryError,
    });
  } catch (error) {
    if (
      error instanceof OrderConflictError ||
      error instanceof DeliveryConflictError
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

export const POST = apiHandler(handlePOST);
