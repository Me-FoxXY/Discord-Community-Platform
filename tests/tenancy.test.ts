import { afterEach, expect, it, vi } from "vitest";
import { encryptCredential, decryptCredential } from "@/lib/servers/crypto";
import { managesGuild } from "@/lib/servers/discord";
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";
afterEach(() => vi.unstubAllEnvs());
it("binds encrypted credentials to a user and rejects tampering", () => {
  vi.stubEnv("CONFIG_ENCRYPTION_KEY", "ab".repeat(32));
  const encrypted = encryptCredential("secret-token", "user-a");
  expect(encrypted).not.toContain("secret-token");
  expect(decryptCredential(encrypted, "user-a")).toBe("secret-token");
  expect(() => decryptCredential(encrypted, "user-b")).toThrow();
  const parts = encrypted.split(".");
  parts[2] = Buffer.alloc(16).toString("base64");
  expect(() => decryptCredential(parts.join("."), "user-a")).toThrow();
});
it("rejects a missing encryption key", () => {
  vi.stubEnv("CONFIG_ENCRYPTION_KEY", "");
  expect(() => encryptCredential("secret", "a")).toThrow(
    "CONFIG_ENCRYPTION_KEY",
  );
});
it("checks Discord permissions without truncating high bits", () => {
  expect(managesGuild({ permissions: String((1n << 50n) | 32n) })).toBe(true);
  expect(managesGuild({ permissions: String(1n << 50n) })).toBe(false);
  expect(managesGuild({ owner: true })).toBe(true);
});
it("overwrites forged tenant headers and derives scope from the URL", () => {
  const root = middleware(
    new NextRequest("http://localhost/api/orders", {
      headers: { "x-community-id": "forged" },
    }),
  );
  expect(root.headers.get("x-middleware-request-x-community-id")).toBe(
    "default",
  );
  const scoped = middleware(
    new NextRequest("http://localhost/api/s/server-a/orders", {
      headers: { "x-community-id": "forged" },
    }),
  );
  expect(scoped.headers.get("x-middleware-request-x-community-id")).toBe(
    "server-a",
  );
  expect(scoped.headers.get("x-middleware-rewrite")).toBe(
    "http://localhost/api/orders",
  );
});
it("keeps local IP rewrites on the incoming origin", () => {
  const response = middleware(
    new NextRequest("http://127.0.0.1:3000/s/server-b/shop", {
      headers: { host: "127.0.0.1:3000" },
    }),
  );
  expect(response.headers.get("x-middleware-rewrite")).toBe(
    "http://127.0.0.1:3000/shop",
  );
  expect(response.headers.get("x-middleware-request-x-community-id")).toBe(
    "server-b",
  );
});
