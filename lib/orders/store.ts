import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Order } from "@prisma/client";

export type OrderStatus = "awaiting_payment" | "pending_review" | "approved" | "rejected";

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
  discordUserId: string;
  discordUsername: string;
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const note = `VD-${randomBytes(4).toString("hex").toUpperCase()}`;
  return prisma.order.create({
    data: {
      planSlug: input.planSlug,
      planName: input.planName,
      amount: input.amount,
      currency: "INR",
      note,
      status: "awaiting_payment",
      discordUserId: input.discordUserId,
      discordUsername: input.discordUsername,
    },
  });
}

export function getOrder(id: string): Promise<Order | null> {
  return prisma.order.findUnique({ where: { id } });
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
      where: { id: input.orderId },
      data: {
        utr: input.utr,
        screenshotPath: input.screenshotPath,
        screenshotHash: input.screenshotHash,
        duplicateFlag: Boolean(hashClash),
        status: "pending_review",
      },
    });
  } catch (err: unknown) {
    // Unique constraint race on UTR.
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002") {
      throw new DuplicateUtrError();
    }
    throw err;
  }
}

export function listPending(): Promise<Order[]> {
  return prisma.order.findMany({
    where: { status: "pending_review" },
    orderBy: { createdAt: "asc" },
  });
}

export function listRecent(limit = 50): Promise<Order[]> {
  return prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

export async function reviewOrder(
  id: string,
  action: "approve" | "reject",
  reviewer: string,
  note?: string,
): Promise<Order> {
  const status: OrderStatus = action === "approve" ? "approved" : "rejected";
  const order = await prisma.order.update({
    where: { id },
    data: { status, reviewedBy: reviewer, reviewNote: note ?? null },
  });
  if (status === "approved") await onOrderApproved(order);
  return order;
}

/**
 * Perk-grant hook. This is where a Discord bot call would assign the purchased
 * role / perk to the buyer's Discord account.
 */
async function onOrderApproved(order: Order): Promise<void> {
  // TODO: integrate Discord bot — assign role, grant XP boost, create voice channel.
  console.log(
    `[perks] grant "${order.planName}" to ${order.discordUsername} (${order.discordUserId}) — order ${order.id}`,
  );
}
