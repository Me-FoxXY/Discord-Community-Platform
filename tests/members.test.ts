vi.mock("@/lib/discord/request", () => ({
  discordFetch: (...args: Parameters<typeof fetch>) => fetch(...args),
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
import { afterEach, expect, it, vi } from "vitest";
import { GET } from "@/app/api/discord/members/route";
import { GET as banner } from "@/app/api/discord/banner/route";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
function setup() {
  vi.stubEnv("DISCORD_GUILD_ID", "123456789012345678");
  vi.stubEnv("DISCORD_BOT_TOKEN", "test");
}
it("uses actual member counts, including zero online", async () => {
  setup();
  const fetch = vi
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({
        approximate_member_count: 42,
        approximate_presence_count: 0,
      }),
    });
  vi.stubGlobal("fetch", fetch);
  expect(
    await (await GET(new Request("http://localhost/api/discord"))).json(),
  ).toEqual({ total: 42, online: 0, source: "live" });
  expect(fetch.mock.calls[0][0]).toContain("with_counts=true");
});
it("does not substitute invented counts when Discord fails", async () => {
  setup();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  expect(
    await (await GET(new Request("http://localhost/api/discord"))).json(),
  ).toEqual({ total: null, online: null, source: "unavailable" });
});
it("explains a missing bot and inaccessible server", async () => {
  setup();
  vi.stubEnv("DISCORD_BOT_TOKEN", "");
  expect(
    await (
      await banner(new Request("http://localhost/api/discord/banner"))
    ).json(),
  ).toMatchObject({ status: "missing_bot", url: null });
  vi.stubEnv("DISCORD_BOT_TOKEN", "test");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));
  expect(
    await (
      await banner(new Request("http://localhost/api/discord/banner"))
    ).json(),
  ).toMatchObject({ status: "no_access", url: null });
});
