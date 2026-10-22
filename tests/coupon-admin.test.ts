vi.mock("@/lib/catalog", async () => { const { plans } = await import("@/config/plans"); return { getPlan: async (slug: string) => plans.find(p => p.slug === slug) }; });
import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), create: vi.fn(), updateMany: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: { coupon: { create: mocks.create, updateMany: mocks.updateMany } } }));
import { POST } from "@/app/api/admin/coupons/route";
import { PATCH } from "@/app/api/admin/coupons/[id]/route";
const input = { code: "save10", kind: "percent", value: 10, minAmount: 0, planSlug: null, expiresAt: null };
const request = (body: object) => new Request("http://localhost/api/admin/coupons", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
beforeEach(() => { vi.resetAllMocks(); mocks.auth.mockResolvedValue({ user: { isAdmin: true } }); });
it("blocks buyers from creating or disabling coupons", async () => {
  mocks.auth.mockResolvedValue({ user: { isAdmin: false } });
  expect((await POST(request(input))).status).toBe(403);
  expect((await PATCH(request({ active: false }), { params: Promise.resolve({ id: "coupon" }) })).status).toBe(403);
  expect(mocks.create).not.toHaveBeenCalled();
  expect(mocks.updateMany).not.toHaveBeenCalled();
});
it("normalizes new coupon codes", async () => {
  mocks.create.mockResolvedValue({ id: "coupon", ...input, code: "SAVE10" });
  expect((await POST(request(input))).status).toBe(201);
  expect(mocks.create).toHaveBeenCalledWith({ data: { ...input, code: "SAVE10" } });
});
it("rejects 100 percent discounts and past expiry", async () => {
  expect((await POST(request({ ...input, value: 100 }))).status).toBe(400);
  expect((await POST(request({ ...input, expiresAt: "2000-01-01T00:00:00Z" }))).status).toBe(400);
  expect(mocks.create).not.toHaveBeenCalled();
});
it("reports duplicate codes as conflicts", async () => {
  mocks.create.mockRejectedValue({ code: "P2002" });
  expect((await POST(request(input))).status).toBe(409);
});
