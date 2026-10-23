import { afterEach, expect, it, vi } from "vitest";
import { validateAuthResponse } from "oauth4webapi";

vi.mock("next-auth", () => ({ default: () => ({}) }));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function configuredIssuer() {
  vi.stubEnv("AUTH_DISCORD_ID", "test-client");
  vi.stubEnv("AUTH_DISCORD_SECRET", "test-secret");
  const { authConfig } = await import("@/lib/auth");
  const provider = authConfig.providers.find(
    (p) => typeof p !== "function" && p.id === "discord",
  );
  if (!provider || typeof provider === "function")
    throw Error("Discord provider missing");
  return (provider.options as { issuer: string }).issuer;
}

it("accepts Discord's issuer in an OAuth callback with matching state", async () => {
  const issuer = await configuredIssuer();
  const result = validateAuthResponse(
    { issuer },
    { client_id: "test-client" },
    new URLSearchParams({
      code: "test-code",
      iss: "https://discord.com",
      state: "test-state",
    }),
    "test-state",
  );
  expect(result.get("code")).toBe("test-code");
});

it("still rejects a callback from an unexpected issuer", async () => {
  const issuer = await configuredIssuer();
  expect(() =>
    validateAuthResponse(
      { issuer },
      { client_id: "test-client" },
      new URLSearchParams({
        code: "test-code",
        iss: "https://untrusted.example",
        state: "test-state",
      }),
      "test-state",
    ),
  ).toThrow(/issuer/);
});
