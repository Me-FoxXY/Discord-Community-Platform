import { currentServerId, currentServer } from "@/lib/servers/context";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Order } from "@prisma/client";

export type OrderStatus =
  | "awaiting_payment"
  | "pending_review"
  | "approved"
  | "rejected";
export class OrderConflictError extends Error {}

export class DuplicateUtrError extends Error {
  constructor() {
    super("DUPLICATE_UTR");
    this.name = "DuplicateUtrError";
  }
}

export type CreateOrderInput = {
  planSlug: string;
  planName: string;
  amount: number;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  roleId?: string | null;
  discordUserId: string;
  discordUsername: string;
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const server = await currentServer();
  const note = `VD-${randomBytes(4).toString("hex").toUpperCase()}`;
  return prisma.order.create({
    data: {
      serverId: server.id,
      paymentUpiId: server.upiId,
      paymentPayee: server.payeeName,
      planSlug: input.planSlug,
      planName: input.planName,
      amount: input.amount,
      subtotal: input.subtotal,
      discountAmount: input.discountAmount,
      couponCode: input.couponCode,
      deliveryRoleId: input.roleId ?? null,
      deliveryGuildId: server.guildId,
      currency: "INR",
      note,
      status: "awaiting_payment",
      discordUserId: input.discordUserId,
      discordUsername: input.discordUsername,
    },
  });
}

export async function getOrder(id: string): Promise<Order | null> {
  return prisma.order.findUnique({
    where: { id, serverId: await currentServerId() },
  });
}

export type SubmitProofInput = {
  orderId: string;
  utr: string;
  screenshotPath: string;
  screenshotHash: string;
};

/**
 * Attach payment proof to an order.
 * Anti-fraud: a UTR can only ever be used once (unique), and a re-used
 * screenshot (same hash) flags the order for extra scrutiny.
 */
export async function submitProof(input: SubmitProofInput): Promise<Order> {
  const utrClash = await prisma.order.findFirst({
    where: { utr: input.utr, NOT: { id: input.orderId } },
    select: { id: true },
  });
  if (utrClash) throw new DuplicateUtrError();

  const hashClash = await prisma.order.findFirst({
    where: { screenshotHash: input.screenshotHash, NOT: { id: input.orderId } },
    select: { id: true },
  });

  try {
    return await prisma.order.update({
      where: {
        id: input.orderId,
        serverId: await currentServerId(),
        status: "awaiting_payment",
      },
      data: {
        utr: input.utr,
        screenshotPath: input.screenshotPath,
        screenshotHash: input.screenshotHash,
        duplicateFlag: Boolean(hashClash),
        status: "pending_review",
      },
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2025"
    ) {
      throw new OrderConflictError("Payment proof was already submitted.");
    }
    // Unique constraint race on UTR.
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      throw new DuplicateUtrError();
    }
    throw err;
  }
}

export async function listPending(): Promise<Order[]> {
  return prisma.order.findMany({
    where: { serverId: await currentServerId(), status: "pending_review" },
    orderBy: { createdAt: "asc" },
  });
}

export async function listRecent(limit = 50): Promise<Order[]> {
  return prisma.order.findMany({
    where: { serverId: await currentServerId() },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function reviewOrder(
  id: string,
  action: "approve" | "reject",
  reviewer: string,
  note?: string,
): Promise<Order> {
  const status: OrderStatus = action === "approve" ? "approved" : "rejected";
  return prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: {
        id,
        serverId: await currentServerId(),
        status: "pending_review",
        utr: { not: null },
        screenshotPath: { not: null },
      },
      data: {
        status,
        reviewedBy: reviewer,
        reviewNote: note ?? null,
        deliveryStatus: action === "approve" ? "pending" : "not_requested",
      },
    });
    if (!result.count)
      throw new OrderConflictError(
        "Only an order awaiting review with payment proof can be reviewed.",
      );
    await tx.auditEvent.create({
      data: {
        serverId: await currentServerId(),
        actorId: reviewer,
        action: `order.${action}`,
        outcome: "success",
      },
    });
    return tx.order.findUniqueOrThrow({
      where: { id, serverId: await currentServerId() },
    });
  });
}
