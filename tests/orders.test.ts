import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  updateMany: vi.fn(), update: vi.fn(), findUniqueOrThrow: vi.fn(), findFirst: vi.fn(),
}));
const discord = vi.hoisted(() => ({ grantRole: vi.fn(), roleTarget: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { order: db } }));
vi.mock("@/lib/discord/roles", async (original) => ({
  ...await original<typeof import("@/lib/discord/roles")>(),
  ...discord,
}));
import { reviewOrder, submitProof, OrderConflictError } from "@/lib/orders/store";
import { deliverOrder, DeliveryConflictError } from "@/lib/orders/delivery";
import { RoleDeliveryError } from "@/lib/discord/roles";

const order = {
  id: "order-1", planSlug: "premium", discordUserId: "323456789012345678",
  status: "approved", deliveryGuildId: "123456789012345678",
  deliveryRoleId: "223456789012345678",
};
beforeEach(() => {
  vi.resetAllMocks();
  db.findUniqueOrThrow.mockResolvedValue(order);
  db.updateMany.mockResolvedValue({ count: 1 });
  db.update.mockResolvedValue(order);
  discord.grantRole.mockResolvedValue(undefined);
});

describe("manual payment decisions", () => {
  it("approves only pending reviews with proof, and saves pending delivery", async () => {
    await reviewOrder(order.id, "approve", "admin");
    expect(db.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: order.id, status: "pending_review", utr: { not: null }, screenshotPath: { not: null } },
      data: expect.objectContaining({ status: "approved", deliveryStatus: "pending", reviewedBy: "admin" }),
    }));
    expect(discord.grantRole).not.toHaveBeenCalled();
  });

  it("rejects stale or repeated decisions without starting delivery", async () => {
    db.updateMany.mockResolvedValue({ count: 0 });
    await expect(reviewOrder(order.id, "reject", "other-admin")).rejects.toBeInstanceOf(OrderConflictError);
    expect(discord.grantRole).not.toHaveBeenCalled();
  });

  it("does not request delivery for a rejection", async () => {
    await reviewOrder(order.id, "reject", "admin", "Amount mismatch");
    expect(db.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "rejected", deliveryStatus: "not_requested" }),
    }));
  });

  it("cannot overwrite proof after another submission wins the database update", async () => {
    db.findFirst.mockResolvedValue(null);
    db.update.mockRejectedValue({ code: "P2025" });
    await expect(submitProof({
      orderId: order.id, utr: "123456789012", screenshotPath: "data:image/png;base64,AA==", screenshotHash: "hash",
    })).rejects.toBeInstanceOf(OrderConflictError);
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: order.id, status: "awaiting_payment" },
    }));
  });
});

describe("delivery attempts", () => {
  it("does not call Discord if another attempt owns the lease or delivery is already complete", async () => {
    db.updateMany.mockResolvedValue({ count: 0 });
    await expect(deliverOrder(order.id)).rejects.toBeInstanceOf(DeliveryConflictError);
    expect(discord.grantRole).not.toHaveBeenCalled();
  });

  it("uses the persisted target, then records successful delivery with its lease token", async () => {
    await deliverOrder(order.id);
    expect(discord.roleTarget).not.toHaveBeenCalled();
    expect(discord.grantRole).toHaveBeenCalledWith(order.deliveryGuildId, order.deliveryRoleId, order.discordUserId);
    const token = db.updateMany.mock.calls[0][0].data.deliveryToken;
    expect(db.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: order.id, deliveryToken: token },
      data: expect.objectContaining({ deliveryStatus: "delivered", deliveryToken: null }),
    }));
  });

  it("keeps payment approval intact when Discord fails and saves a retry time", async () => {
    discord.grantRole.mockRejectedValue(new RoleDeliveryError("Try later", 120));
    const before = Date.now();
    await deliverOrder(order.id);
    const update = db.updateMany.mock.calls[1][0].data;
    expect(update.deliveryStatus).toBe("failed");
    expect(update.status).toBeUndefined();
    expect(update.deliveryRetryAt.getTime()).toBeGreaterThanOrEqual(before + 120_000);
  });

  it("allows an expired lease to be reclaimed but only on approved payments", async () => {
    await deliverOrder(order.id);
    const where = db.updateMany.mock.calls[0][0].where;
    expect(where.status).toBe("approved");
    expect(where.AND[0].OR).toContainEqual({
      deliveryStatus: "delivering", deliveryLeaseUntil: { lte: expect.any(Date) },
    });
  });
});
