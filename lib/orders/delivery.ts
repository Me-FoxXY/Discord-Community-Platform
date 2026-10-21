import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { grantRole, roleTarget, RoleDeliveryError } from "@/lib/discord/roles";

export class DeliveryConflictError extends Error {}

export async function deliverOrder(id: string) {
  const now = new Date();
  const token = randomUUID();
  // A short lease makes interrupted Vercel requests recoverable by an admin retry.
  const claim = await prisma.order.updateMany({
    where: {
      id,
      status: "approved",
      AND: [
        { OR: [
          { deliveryStatus: { in: ["pending", "failed"] } },
          { deliveryStatus: "delivering", deliveryLeaseUntil: { lte: now } },
        ] },
        { OR: [{ deliveryRetryAt: null }, { deliveryRetryAt: { lte: now } }] },
      ],
    },
    data: {
      deliveryStatus: "delivering",
      deliveryToken: token,
      deliveryLeaseUntil: new Date(now.getTime() + 60_000),
      deliveryAttempts: { increment: 1 },
    },
  });
  if (!claim.count) throw new DeliveryConflictError("Delivery is complete, already running, or cooling down.");

  const order = await prisma.order.findUniqueOrThrow({ where: { id } });
  try {
    const target = order.deliveryGuildId && order.deliveryRoleId
      ? { guildId: order.deliveryGuildId, roleId: order.deliveryRoleId }
      : roleTarget(order.planSlug);
    // Preserve the first target across retries, even if settings later change.
    await prisma.order.update({
      where: { id, deliveryToken: token },
      data: { deliveryGuildId: target.guildId, deliveryRoleId: target.roleId },
    });
    await grantRole(target.guildId, target.roleId, order.discordUserId);
    await prisma.order.updateMany({
      where: { id, deliveryToken: token },
      data: {
        deliveryStatus: "delivered", deliveredAt: new Date(),
        deliveryError: null, deliveryRetryAt: null,
        deliveryToken: null, deliveryLeaseUntil: null,
      },
    });
  } catch (error) {
    const message = error instanceof RoleDeliveryError
      ? error.message : "Delivery was interrupted. Please retry.";
    const seconds = error instanceof RoleDeliveryError ? error.retryAfterSeconds : 30;
    await prisma.order.updateMany({
      where: { id, deliveryToken: token },
      data: {
        deliveryStatus: "failed", deliveryError: message,
        deliveryRetryAt: new Date(Date.now() + seconds * 1000),
        deliveryToken: null, deliveryLeaseUntil: null,
      },
    });
  }
  return prisma.order.findUniqueOrThrow({ where: { id } });
}
