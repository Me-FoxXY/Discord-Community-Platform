import { randomUUID } from "node:crypto";
import { beforeAll, afterAll, beforeEach, expect, it, vi } from "vitest";
const context = vi.hoisted(() => ({
  serverId: "default",
  userId: "323456789012345678",
  platform: false,
  manager: true,
  member: true,
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-community-id": context.serverId }),
}));
vi.mock("@/lib/auth", () => ({
  auth: async () => ({
    user: {
      discordId: context.userId,
      isAdmin: context.platform,
      name: "Test",
    },
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/servers/discord", async (original) => ({
  ...(await original<typeof import("@/lib/servers/discord")>()),
  guildPermissions: async () => {
    if (!context.member)
      throw new (await import("@/lib/servers/errors")).ServerError(
        "Membership revoked",
        403,
      );
    return { manager: context.manager };
  },
  validateBot: async (guildId: string) => ({
    id: guildId,
    name: "Registered test server",
    icon: null,
  }),
  discordRequest: async () => ({ roles: [] }),
}));
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/servers/access";
import { listProducts } from "@/lib/catalog";
import { quoteOrder } from "@/lib/coupons/quote";
import {
  createOrder,
  getOrder,
  listRecent,
  reviewOrder,
} from "@/lib/orders/store";

import { PATCH as settings } from "@/app/api/servers/[id]/route";
import { GET as screenshot } from "@/app/api/orders/[id]/screenshot/route";
import { POST as verify } from "@/app/api/admin/orders/[id]/verify/route";
import { POST as checkout } from "@/app/api/orders/route";
import { GET as getConfig } from "@/app/api/servers/[id]/route";
const run = randomUUID().slice(0, 8),
  a = `tenant-a-${run}`,
  b = `tenant-b-${run}`;
const guildA = "723456789012345678",
  guildB = "823456789012345678";

const ids = [a, b];
let orderId = "";
let safe = false;
const request = (body: unknown, method = "POST") =>
  new Request("http://localhost/api/test", {
    method,
    headers: { "Content-Type": "application/json", origin: "http://localhost" },
    body: JSON.stringify(body),
  });
const params = (id: string) => ({ params: Promise.resolve({ id }) });
beforeAll(async () => {
  const url = new URL(process.env.DATABASE_URL!);
  if (
    url.hostname !== "127.0.0.1" ||
    url.pathname !== "/discord_community_test"
  )
    throw Error("Isolated test database required");
  safe = true;
  for (const [id, guildId] of [
    [a, guildA],
    [b, guildB],
  ]) {
    await prisma.server.create({
      data: {
        id,
        guildId,
        name: id,
        upiId: id + "@upi",
        payeeName: id,
        createdBy: "test",
        updatedBy: "test",
      },
    });
    await prisma.product.create({
      data: {
        serverId: id,
        slug: "shared-slug",
        roleId: "223456789012345678",
        data: {
          slug: "shared-slug",
          name: id,
          price: id === a ? 100 : 200,
          benefits: [],
          features: [],
        },
      },
    });
    await prisma.coupon.create({
      data: {
        serverId: id,
        code: "SAME_CODE",
        kind: "fixed",
        value: id === a ? 10 : 20,
      },
    });
  }
  await prisma.serverAccess.create({
    data: {
      serverId: a,
      userId: context.userId,
      role: "manager",
      grantedBy: "test",
    },
  });
  context.serverId = b;
  const order = await createOrder({
    planSlug: "shared-slug",
    planName: "B",
    amount: 200,
    subtotal: 200,
    discountAmount: 0,
    couponCode: null,
    roleId: "223456789012345678",
    discordUserId: "423456789012345678",
    discordUsername: "Buyer B",
  });
  orderId = order.id;
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "pending_review",
      utr: run,
      screenshotPath: "data:image/png;base64,AA==",
    },
  });
});
beforeEach(() => {
  context.serverId = a;
  context.userId = "323456789012345678";
  context.platform = false;
  context.manager = true;
  context.member = true;
});
afterAll(async () => {
  if (!safe) return;
  await prisma.auditEvent.deleteMany({
    where: {
      OR: [
        { serverId: { in: ids } },
        { actorId: "323456789012345678", serverId: null },
      ],
    },
  });
  await prisma.order.deleteMany({ where: { serverId: { in: ids } } });
  await prisma.product.deleteMany({ where: { serverId: { in: ids } } });
  await prisma.coupon.deleteMany({ where: { serverId: { in: ids } } });
  await prisma.storeSettings.deleteMany({ where: { serverId: { in: ids } } });
  await prisma.serverAccess.deleteMany({ where: { serverId: { in: ids } } });
  await prisma.server.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});
it("isolates same-named products and coupon codes between servers", async () => {
  expect((await listProducts())[0].price).toBe(100);
  expect(
    (await quoteOrder({ planSlug: "shared-slug", couponCode: "SAME_CODE" }))
      .amount,
  ).toBe(90);
  context.serverId = b;
  expect((await listProducts())[0].price).toBe(200);
  expect(
    (await quoteOrder({ planSlug: "shared-slug", couponCode: "SAME_CODE" }))
      .amount,
  ).toBe(180);
});
it("does not reveal foreign orders or screenshots through manipulated IDs", async () => {
  expect(await getOrder(orderId)).toBeNull();
  expect(await listRecent()).toHaveLength(0);
  expect(
    (
      await screenshot(
        new Request("http://localhost/api/orders/x/screenshot"),
        params(orderId),
      )
    ).status,
  ).toBe(404);
  expect(
    (await verify(request({ action: "approve" }), params(orderId))).status,
  ).toBe(404);
  expect(
    (await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status,
  ).toBe("pending_review");
});
it("rejects staff who change the server context to an unassigned server", async () => {
  context.serverId = b;
  await expect(requireAccess("manage")).rejects.toMatchObject({ status: 403 });
  expect(
    (await getConfig(new Request("http://localhost/api/servers/x"), params(b)))
      .status,
  ).toBe(403);
  expect(
    await prisma.auditEvent.count({
      where: { serverId: b, outcome: "denied" },
    }),
  ).toBeGreaterThan(0);
});
it("rechecks lost Discord permissions and membership on the next request", async () => {
  await expect(requireAccess("manage")).resolves.toMatchObject({
    role: "manager",
  });
  context.manager = false;
  await expect(requireAccess("review")).rejects.toMatchObject({ status: 403 });
  context.manager = true;
  context.member = false;
  await expect(requireAccess("view")).rejects.toMatchObject({ status: 403 });
});
it("allows delegated reviewers without granting settings access", async () => {
  await prisma.serverAccess.update({
    where: { serverId_userId: { serverId: a, userId: context.userId } },
    data: { role: "reviewer" },
  });
  context.manager = false;
  await expect(requireAccess("review")).resolves.toMatchObject({
    role: "reviewer",
  });
  await expect(requireAccess("manage")).rejects.toMatchObject({ status: 403 });
  await prisma.serverAccess.update({
    where: { serverId_userId: { serverId: a, userId: context.userId } },
    data: { role: "manager" },
  });
});
it("ignores a forged checkout server and snapshots the correct payment recipient", async () => {
  const response = await checkout(
    request({ planSlug: "shared-slug", serverId: b, amount: 1 }),
  );
  expect(response.status).toBe(200);
  const data = await response.json();
  const row = await prisma.order.findUniqueOrThrow({
    where: { id: data.orderId },
  });
  expect(row).toMatchObject({
    serverId: a,
    amount: 100,
    paymentUpiId: a + "@upi",
    deliveryGuildId: guildA,
  });
});
it("serializes configuration edits, audits the winner, and pauses disabled stores", async () => {
  const body = {
    version: 1,
    name: a,
    inviteUrl: "",
    upiId: "new@upi",
    payeeName: "New",
    status: "disabled",
  };
  const responses = await Promise.all([
    settings(request(body, "PATCH"), params(a)),
    settings(request(body, "PATCH"), params(a)),
  ]);
  expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
  expect(
    await prisma.auditEvent.count({
      where: {
        serverId: a,
        action: "server.update.disabled",
        outcome: "success",
      },
    }),
  ).toBe(1);
  expect((await checkout(request({ planSlug: "shared-slug" }))).status).toBe(
    409,
  );
  await prisma.server.update({ where: { id: a }, data: { status: "active" } });
});
it("rejects cross-origin writes before changing configuration", async () => {
  const req = new Request("http://localhost/api/servers/" + a, {
    method: "PATCH",
    headers: { origin: "https://attacker.example" },
    body: "{}",
  });
  expect((await settings(req, params(a))).status).toBe(403);
});
