vi.mock("@/lib/discord/request", () => ({
  discordFetch: (...args: Parameters<typeof fetch>) => fetch(...args),
}));
import { afterEach, describe, expect, it, vi } from "vitest";
import { grantRole, roleTarget } from "@/lib/discord/roles";

const guild = "123456789012345678";
const role = "223456789012345678";
const user = "323456789012345678";
afterEach(() => vi.unstubAllEnvs());

describe("Discord role delivery", () => {
  it("adds the same existing role using PUT on repeated attempts", async () => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "test-token");
    const request = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    await grantRole(guild, role, user, request);
    await grantRole(guild, role, user, request);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenCalledWith(
      `https://discord.com/api/v10/guilds/${guild}/members/${user}/roles/${role}`,
      expect.objectContaining({
        method: "PUT",
        headers: { Authorization: "Bot test-token" },
      }),
    );
  });

  it("retains Discord's cooldown without sleeping inside the request", async () => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "test-token");
    const request = vi
      .fn()
      .mockResolvedValue(Response.json({ retry_after: 12.5 }, { status: 429 }));
    await expect(grantRole(guild, role, user, request)).rejects.toMatchObject({
      retryAfterSeconds: 13,
    });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("reports missing permissions without exposing the raw response", async () => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "test-token");
    const request = vi
      .fn()
      .mockResolvedValue(new Response("private diagnostics", { status: 403 }));
    await expect(grantRole(guild, role, user, request)).rejects.toThrow(
      "Manage Roles",
    );
  });

  it("fails clearly for missing configuration without making a request", async () => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "");
    const request = vi.fn();
    await expect(grantRole(guild, role, user, request)).rejects.toThrow(
      "DISCORD_BOT_TOKEN",
    );
    expect(request).not.toHaveBeenCalled();
  });

  it("rejects unknown plan mappings", () => {
    vi.stubEnv("DISCORD_GUILD_ID", guild);
    expect(() => roleTarget("unknown")).toThrow("Configure");
  });

  it("turns a network timeout into a safe retryable failure", async () => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "test-token");
    const request = vi.fn().mockRejectedValue(new Error("socket failed"));
    await expect(grantRole(guild, role, user, request)).rejects.toThrow(
      "could not be reached",
    );
  });
});
