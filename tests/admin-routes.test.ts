vi.mock("@/lib/servers/access", async () => ({
  requireAccess: async () => {
    const { auth } = await import("@/lib/auth");
    const { ServerError } = await import("@/lib/servers/errors");
    const s = await auth();
    if (!s?.user?.isAdmin) throw new ServerError("Forbidden", 403);
    return {
      userId: s.user.discordId || "admin",
      role: "manager",
      server: { id: "default", status: "active" },
    };
  },
}));
vi.mock("@/lib/servers/context", () => ({
  currentServerId: async () => "default",
  currentServer: async () => ({
    id: "default",
    status: "active",
    guildId: process.env.DISCORD_GUILD_ID || "123456789012345678",
    upiId: "test@upi",
    payeeName: "Test Store",
  }),
}));
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getOrder: vi.fn(),
  reviewOrder: vi.fn(),
  deliverOrder: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/orders/store", () => ({
  getOrder: mocks.getOrder,
  reviewOrder: mocks.reviewOrder,
  OrderConflictError: class extends Error {},
}));
vi.mock("@/lib/orders/delivery", () => ({
  deliverOrder: mocks.deliverOrder,
  DeliveryConflictError: class extends Error {},
}));
import { POST as verify } from "@/app/api/admin/orders/[id]/verify/route";
import { POST as retry } from "@/app/api/admin/orders/[id]/delivery/route";
import { OrderConflictError } from "@/lib/orders/store";

const params = { params: Promise.resolve({ id: "order-1" }) };
const request = () =>
  new Request("http://localhost/api/admin/orders/order-1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "approve" }),
  });
beforeEach(() => vi.resetAllMocks());

it("blocks unauthenticated review and delivery retry before accessing an order", async () => {
  mocks.auth.mockResolvedValue(null);
  expect((await verify(request(), params)).status).toBe(403);
  expect((await retry(request(), params)).status).toBe(403);
  expect(mocks.getOrder).not.toHaveBeenCalled();
  expect(mocks.deliverOrder).not.toHaveBeenCalled();
});

it("blocks signed-in buyers from reviewing or retrying", async () => {
  mocks.auth.mockResolvedValue({
    user: { discordId: "buyer", isAdmin: false },
  });
  expect((await verify(request(), params)).status).toBe(403);
  expect((await retry(request(), params)).status).toBe(403);
});

it("returns conflict without delivering when the review has already been decided", async () => {
  mocks.auth.mockResolvedValue({ user: { discordId: "admin", isAdmin: true } });
  mocks.getOrder.mockResolvedValue({ id: "order-1" });
  mocks.reviewOrder.mockRejectedValue(
    new OrderConflictError("Already reviewed"),
  );
  expect((await verify(request(), params)).status).toBe(409);
  expect(mocks.deliverOrder).not.toHaveBeenCalled();
});

it("returns approved payment with failed delivery as separate outcomes", async () => {
  mocks.auth.mockResolvedValue({ user: { discordId: "admin", isAdmin: true } });
  mocks.getOrder.mockResolvedValue({ id: "order-1" });
  mocks.reviewOrder.mockResolvedValue({
    status: "approved",
    deliveryStatus: "pending",
  });
  mocks.deliverOrder.mockResolvedValue({
    status: "approved",
    deliveryStatus: "failed",
    deliveryError: "Missing permission",
  });
  const response = await verify(request(), params);
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    status: "approved",
    deliveryStatus: "failed",
  });
});
