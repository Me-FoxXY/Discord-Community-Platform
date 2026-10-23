vi.mock("@/lib/servers/discord", () => ({
  validateBot: async () => ({ id: "123456789012345678" }),
  discordRequest: async () => ({ roles: [] }),
}));
vi.mock("@/lib/servers/access", async () => ({
  requireAccess: async () => {
    const { auth } = await import("@/lib/auth");
    const { ServerError } = await import("@/lib/servers/errors");
    const s = await auth();
    if (!s?.user?.isAdmin) throw new ServerError("Forbidden", 403);
    return {
      userId: s.user.discordId || "admin",
      role: "manager",
      server: { id: "default" },
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
const mock = vi.hoisted(() => ({
  auth: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ auth: mock.auth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: async (fn: Function) =>
      fn({
        product: mock,
        storeSettings: { upsert: mock.upsert },
        auditEvent: { create: async () => ({}) },
      }),
    product: mock,
    storeSettings: { upsert: mock.upsert },
  },
}));
import { POST, PATCH } from "@/app/api/admin/products/route";
import { PATCH as theme } from "@/app/api/admin/settings/route";
const input = {
  slug: "creator-pass",
  name: "Creator Pass",
  price: 99,
  durationDays: 30,
  tagline: "Create together",
  description: "Access the creator room.",
  benefits: ["Creator room"],
  roleId: "223456789012345678",
  enabled: true,
};
const req = (body: unknown) =>
  new Request("http://localhost/api/admin", {
    method: "POST",
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.resetAllMocks();
  mock.auth.mockResolvedValue({ user: { isAdmin: true } });
});
it("denies product and theme mutations to members", async () => {
  mock.auth.mockResolvedValue({ user: { isAdmin: false } });
  expect((await POST(req(input))).status).toBe(403);
  expect((await PATCH(req(input))).status).toBe(403);
  expect(
    (await theme(req({ primaryColor: "#112233", accentColor: "#445566" })))
      .status,
  ).toBe(403);
  expect(mock.create).not.toHaveBeenCalled();
  expect(mock.upsert).not.toHaveBeenCalled();
});
it("requires valid prices and a role before publishing new products", async () => {
  for (const change of [
    { price: 0 },
    { price: 1.5 },
    { roleId: null },
    { slug: "../admin" },
  ])
    expect((await POST(req({ ...input, ...change }))).status).toBe(400);
  expect(mock.create).not.toHaveBeenCalled();
});
it("creates a reusable product and allows hidden drafts without a role", async () => {
  expect((await POST(req(input))).status).toBe(200);
  expect(mock.create).toHaveBeenCalledWith({
    data: expect.objectContaining({
      slug: input.slug,
      roleId: input.roleId,
      enabled: true,
      data: expect.objectContaining({ price: 99, benefits: ["Creator room"] }),
    }),
  });
  expect(
    (await POST(req({ ...input, roleId: null, enabled: false }))).status,
  ).toBe(200);
});
it("reports missing products and duplicate URLs", async () => {
  mock.findUnique.mockResolvedValue(null);
  expect((await PATCH(req(input))).status).toBe(404);
  mock.create.mockRejectedValue({ code: "P2002" });
  expect((await POST(req(input))).status).toBe(409);
});
it("persists only valid custom hex colors", async () => {
  expect(
    (
      await theme(
        req({ primaryColor: "red;display:none", accentColor: "#112233" }),
      )
    ).status,
  ).toBe(400);
  expect(mock.upsert).not.toHaveBeenCalled();
  expect(
    (await theme(req({ primaryColor: "#ff0066", accentColor: "#123abc" })))
      .status,
  ).toBe(200);
  expect(mock.upsert).toHaveBeenCalled();
});

it("preserves FAQs when editing a product price", async () => {
  const faq = [{ q: "How do I claim my role?", a: "Submit payment proof." }];
  mock.findUnique.mockResolvedValue({ data: { faq } });
  expect((await PATCH(req({ ...input, price: 129 }))).status).toBe(200);
  expect(mock.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        data: expect.objectContaining({ faq, price: 129 }),
      }),
    }),
  );
});
