vi.mock("@/lib/catalog", async () => { const { plans } = await import("@/config/plans"); return { getPlan: async (slug: string) => plans.find(p => p.slug === slug) }; });
import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(), findUnique: vi.fn(), createOrder: vi.fn(), buildUpiIntent: vi.fn(), qrSvg: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: { coupon: { findUnique: mocks.findUnique } } }));
vi.mock("@/lib/orders/store", () => ({ createOrder: mocks.createOrder }));
vi.mock("@/lib/payments/provider", () => ({ buildUpiIntent: mocks.buildUpiIntent }));
vi.mock("@/lib/qr", () => ({ qrSvg: mocks.qrSvg }));
import { POST as checkout } from "@/app/api/orders/route";
import { POST as preview } from "@/app/api/orders/quote/route";

const request = (body: object) => new Request("http://localhost/api/orders", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue({ user: { discordId: "buyer", name: "Member" } });
  mocks.findUnique.mockResolvedValue({
    code: "SAVE10", kind: "percent", value: 10, active: true, minAmount: 0, planSlug: null, expiresAt: null,
  });
  mocks.createOrder.mockImplementation(async (data) => ({ ...data, id: "order-1", note: "ORDER" }));
  mocks.buildUpiIntent.mockReturnValue("upi://pay");
  mocks.qrSvg.mockResolvedValue("<svg/>");
});
it("ignores client prices and uses discounted server pricing for the order and UPI", async () => {
  const response = await checkout(request({
    planSlug: "premium-pro", couponCode: " save10 ", amount: 1, discountAmount: 48,
  }));
  expect(response.status).toBe(200);
  expect(mocks.findUnique).toHaveBeenCalledWith({ where: { code: "SAVE10" } });
  expect(mocks.createOrder).toHaveBeenCalledWith(expect.objectContaining({
    subtotal: 49, discountAmount: 4, amount: 45, couponCode: "SAVE10",
  }));
  expect(mocks.buildUpiIntent).toHaveBeenCalledWith({ amount: 45, note: "ORDER" });
  expect(await response.json()).toMatchObject({ subtotal: 49, discountAmount: 4, amount: 45 });
});
it("revalidates coupons at order creation after a successful preview", async () => {
  expect((await preview(request({ planSlug: "premium", couponCode: "SAVE10" }))).status).toBe(200);
  mocks.findUnique.mockResolvedValue(null);
  expect((await checkout(request({ planSlug: "premium", couponCode: "SAVE10" }))).status).toBe(400);
  expect(mocks.createOrder).not.toHaveBeenCalled();
});
it("does not create an order for an unknown coupon", async () => {
  mocks.findUnique.mockResolvedValue(null);
  expect((await checkout(request({ planSlug: "premium", couponCode: "INVALID" }))).status).toBe(400);
  expect(mocks.createOrder).not.toHaveBeenCalled();
});
it("requires login before looking up discount codes", async () => {
  mocks.auth.mockResolvedValue(null);
  expect((await preview(request({ planSlug: "premium", couponCode: "SAVE10" }))).status).toBe(401);
  expect(mocks.findUnique).not.toHaveBeenCalled();
});
it("rejects prototype property names as plans", async () => {
  expect((await checkout(request({ planSlug: "constructor" }))).status).toBe(400);
  expect(mocks.createOrder).not.toHaveBeenCalled();
});
