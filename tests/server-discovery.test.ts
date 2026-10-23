import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ServerError } from "@/lib/servers/errors";
const mocks = vi.hoisted(() => ({
  identity: vi.fn(),
  grant: vi.fn(),
  discord: vi.fn(),
  decrypt: vi.fn(),
}));
vi.mock("@/lib/servers/access", () => ({ identity: mocks.identity }));
vi.mock("@/lib/prisma", () => ({
  prisma: { discordAuthorization: { findUnique: mocks.grant } },
}));
vi.mock("@/lib/servers/crypto", () => ({ decryptCredential: mocks.decrypt }));
vi.mock("@/lib/servers/discord", async (original) => ({
  ...(await original<typeof import("@/lib/servers/discord")>()),
  discordRequest: mocks.discord,
}));
import { GET } from "@/app/api/discord/manageable-guilds/route";
const request = () =>
  new Request("http://localhost/api/discord/manageable-guilds");
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CONFIG_ENCRYPTION_KEY", "ab".repeat(32));
  mocks.identity.mockResolvedValue({
    userId: "user-a",
    platformAdmin: false,
    registrar: false,
  });
  mocks.grant.mockResolvedValue({
    credentials: "encrypted",
    expiresAt: new Date(Date.now() + 60000),
  });
  mocks.decrypt.mockReturnValue("private-access-token");
});
afterEach(() => vi.unstubAllEnvs());
it("shows both owned servers to a signed-in user without granting website registration access", async () => {
  mocks.discord.mockResolvedValue([
    { id: "a", name: "First community", icon: null, owner: true },
    { id: "b", name: "Second community", icon: null, owner: true },
    { id: "c", name: "Member only", owner: false, permissions: "0" },
  ]);
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([
    { id: "a", name: "First community", icon: null },
    { id: "b", name: "Second community", icon: null },
  ]);
  expect(mocks.discord).toHaveBeenCalledWith(
    "/users/@me/guilds?limit=200",
    "private-access-token",
  );
});
it("rejects anonymous discovery before loading credentials", async () => {
  mocks.identity.mockRejectedValue(
    new ServerError("Sign in to continue.", 401),
  );
  expect((await GET(request())).status).toBe(401);
  expect(mocks.grant).not.toHaveBeenCalled();
});
it("explains missing encryption setup rather than returning an empty server list", async () => {
  vi.stubEnv("CONFIG_ENCRYPTION_KEY", "");
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect((await response.json()).error).toContain("CONFIG_ENCRYPTION_KEY");
  expect(mocks.discord).not.toHaveBeenCalled();
});
it("requires reconnection for expired or unreadable grants", async () => {
  mocks.grant.mockResolvedValueOnce({
    credentials: "encrypted",
    expiresAt: new Date(0),
  });
  expect((await GET(request())).status).toBe(401);
  mocks.decrypt.mockImplementationOnce(() => {
    throw Error("private crypto detail");
  });
  const response = await GET(request());
  expect(response.status).toBe(401);
  expect(await response.text()).not.toContain("private crypto detail");
});
