import { beforeEach, afterAll, expect, it, vi } from "vitest";
import { randomInt } from "node:crypto";
const state = vi.hoisted(() => ({
  userId: "423456789012345678",
  admin: false,
  signedIn: true,
  manager: true,
  bot: true,
  guildId: "",
}));
vi.mock("@/lib/servers/access", async () => ({
  identity: async () => {
    if (!state.signedIn)
      throw new (await import("@/lib/servers/errors")).ServerError(
        "Sign in",
        401,
      );
    return {
      userId: state.userId,
      platformAdmin: state.admin,
      registrar: false,
    };
  },
}));
vi.mock("@/lib/servers/discovery", () => ({
  manageableGuilds: async () =>
    state.manager
      ? [{ id: state.guildId, name: "Test community", icon: null }]
      : [],
}));
vi.mock("@/lib/servers/discord", async (original) => ({
  ...(await original<typeof import("@/lib/servers/discord")>()),
  validateBot: async (id: string) => {
    if (!state.bot)
      throw new (await import("@/lib/servers/errors")).ServerError(
        "Install the bot first",
        503,
      );
    return { id, name: "Verified community", icon: null };
  },
  guildPermissions: async (_guild: string, user: string) => ({
    manager: state.manager && user === "423456789012345678",
  }),
}));
import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/server-requests/route";
import { POST as legacyPost } from "@/app/api/servers/route";
import { POST as review } from "@/app/api/server-requests/[id]/route";
const guilds: string[] = [];
const req = (body: unknown) =>
  new Request("http://localhost/api/server-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const params = (id: string) => ({ params: Promise.resolve({ id }) });
beforeEach(() => {
  state.userId = "423456789012345678";
  state.admin = false;
  state.signedIn = true;
  state.manager = true;
  state.bot = true;
  state.guildId =
    "8" +
    String(randomInt(10000000, 99999999)) +
    String(randomInt(100000000, 999999999));
  guilds.push(state.guildId);
});
afterAll(async () => {
  const requests = await prisma.serverRequest.findMany({
    where: { guildId: { in: guilds } },
  });
  const servers = await prisma.server.findMany({
    where: { guildId: { in: guilds } },
  });
  const ids = servers.map((s) => s.id);
  await prisma.auditEvent.deleteMany({
    where: {
      OR: [
        { requestId: { in: requests.map((r) => r.id) } },
        { serverId: { in: ids } },
      ],
    },
  });
  await prisma.serverRequest.deleteMany({ where: { guildId: { in: guilds } } });
  await prisma.serverAccess.deleteMany({ where: { serverId: { in: ids } } });
  await prisma.storeSettings.deleteMany({ where: { serverId: { in: ids } } });
  await prisma.server.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});
async function submit() {
  const response = await POST(
    req({ guildId: state.guildId, message: "A community for creators" }),
  );
  expect(response.status).toBe(201);
  return response.json();
}
function becomeAdmin() {
  state.admin = true;
  state.userId = "523456789012345678";
}
it("allows a verified Discord manager to request without publishing, and rejects duplicates", async () => {
  const request = await submit();
  expect(request.status).toBe("pending");
  expect(await prisma.server.count({ where: { guildId: state.guildId } })).toBe(
    0,
  );
  expect((await POST(req({ guildId: state.guildId }))).status).toBe(409);
  expect(
    await prisma.auditEvent.count({
      where: { requestId: request.id, action: "server.request" },
    }),
  ).toBe(1);
});
it("rejects guests, malformed IDs, and users without Discord management rights", async () => {
  state.signedIn = false;
  expect((await POST(req({ guildId: state.guildId }))).status).toBe(401);
  state.signedIn = true;
  expect((await POST(req({ guildId: "invalid" }))).status).toBe(400);
  state.manager = false;
  expect((await POST(req({ guildId: state.guildId }))).status).toBe(403);
});
it("prevents the old registration route from bypassing review, even for website admins", async () => {
  state.admin = true;
  const response = await legacyPost(req({ guildId: state.guildId }));
  expect(response.status).toBe(201);
  expect((await response.json()).status).toBe("pending");
  expect(await prisma.server.count({ where: { guildId: state.guildId } })).toBe(
    0,
  );
});
it("only exposes requests to their requester or website administrators", async () => {
  const item = await submit();
  state.userId = "623456789012345678";
  const other = await (
    await GET(new Request("http://localhost/api/server-requests"))
  ).json();
  expect(other.requests.some((r: { id: string }) => r.id === item.id)).toBe(
    false,
  );
  expect(
    (await review(req({ decision: "approved" }), params(item.id))).status,
  ).toBe(403);
  becomeAdmin();
  const all = await (
    await GET(new Request("http://localhost/api/server-requests"))
  ).json();
  expect(all.requests.some((r: { id: string }) => r.id === item.id)).toBe(true);
});
it("approves once, atomically grants only the requester scoped access, and audits the decision", async () => {
  const item = await submit();
  becomeAdmin();
  const results = await Promise.all([
    review(req({ decision: "approved" }), params(item.id)),
    review(req({ decision: "approved" }), params(item.id)),
  ]);
  expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
  const saved = await prisma.serverRequest.findUniqueOrThrow({
    where: { id: item.id },
  });
  expect(saved.status).toBe("approved");
  const access = await prisma.serverAccess.findMany({
    where: { serverId: saved.serverId! },
  });
  expect(access).toHaveLength(1);
  expect(access[0].userId).toBe(item.requesterId);
  expect(access[0].role).toBe("manager");
  expect(
    await prisma.storeSettings.count({ where: { serverId: saved.serverId! } }),
  ).toBe(1);
  expect(
    await prisma.auditEvent.count({
      where: { requestId: item.id, action: "server.request.approved" },
    }),
  ).toBe(1);
});
it("requires a rejection reason and permits a fresh request after rejection", async () => {
  const item = await submit();
  becomeAdmin();
  expect(
    (await review(req({ decision: "rejected" }), params(item.id))).status,
  ).toBe(400);
  expect(
    (
      await review(
        req({
          decision: "rejected",
          note: "Please clarify your community purpose.",
        }),
        params(item.id),
      )
    ).status,
  ).toBe(200);
  expect(await prisma.server.count({ where: { guildId: state.guildId } })).toBe(
    0,
  );
  state.admin = false;
  state.userId = item.requesterId;
  await submit();
});
it("keeps the request pending if bot access or requester permissions are lost", async () => {
  const item = await submit();
  becomeAdmin();
  state.bot = false;
  expect(
    (await review(req({ decision: "approved" }), params(item.id))).status,
  ).toBe(503);
  state.bot = true;
  state.manager = false;
  expect(
    (await review(req({ decision: "approved" }), params(item.id))).status,
  ).toBe(403);
  expect(
    (await prisma.serverRequest.findUniqueOrThrow({ where: { id: item.id } }))
      .status,
  ).toBe("pending");
  expect(await prisma.server.count({ where: { guildId: state.guildId } })).toBe(
    0,
  );
});
it("rejects cross-origin request submissions", async () => {
  const request = req({ guildId: state.guildId });
  request.headers.set("origin", "https://untrusted.example");
  expect((await POST(request)).status).toBe(403);
});
