"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { DiscordIcon } from "@/components/icons/brands";
import { Button } from "@/components/ui/Button";
import { Loader2, LogIn } from "lucide-react";

export function LoginForm({
  discordConfigured,
  devLoginEnabled,
  callbackUrl,
}: {
  discordConfigured: boolean;
  devLoginEnabled: boolean;
  callbackUrl: string;
}) {
  const [devName, setDevName] = useState("Test Member");
  const [loading, setLoading] = useState<"discord" | "dev" | null>(null);

  const [error, setError] = useState("");
  async function login(provider: "discord" | "dev") {
    setLoading(provider); setError("");
    try {
      const result = await signIn(provider, { redirect: false, redirectTo: callbackUrl, ...(provider === "dev" ? { username: devName } : {}) });
      if (!result || result.error) throw new Error("Sign-in failed. Please try again.");
      window.location.assign(result.url || callbackUrl);
    } catch (error) { setError(error instanceof Error ? error.message : "Sign-in failed."); setLoading(null); }
  }

  return (
    <div className="min-w-0 space-y-5">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {discordConfigured ? (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => login("discord")}
          disabled={loading !== null}
        >
          {loading === "discord" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <DiscordIcon className="h-5 w-5" />
          )}
          Continue with Discord
        </Button>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
          Discord OAuth isn&apos;t configured yet. Add <code className="font-mono">AUTH_DISCORD_ID</code> and{" "}
          <code className="font-mono">AUTH_DISCORD_SECRET</code> to <code className="font-mono">.env</code> to enable it.
        </div>
      )}

      {devLoginEnabled ? (
        <div className="rounded-2xl border border-forest-100 bg-white/60 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-500">
            Dev login (local testing)
          </p>
          <div className="flex min-w-0 flex-col gap-3">
            <input
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              placeholder="Display name"
              aria-label="Dev login display name"
              className="h-11 w-full min-w-0 rounded-full border border-forest-200 bg-white px-4 text-sm outline-none focus:border-forest-400"
            />
            <Button
              variant="outline"
              onClick={() => login("dev")}
              disabled={loading !== null}
            >
              {loading === "dev" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Sign in
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
