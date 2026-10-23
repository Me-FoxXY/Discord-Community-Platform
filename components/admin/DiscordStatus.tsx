"use client";
import { communityFetch } from "@/components/servers/Community";
import { useCommunitySWR as useSWR } from "@/components/servers/Community";
const messages: Record<string, string> = {
  ready: "Connected. The homepage is using your Discord server banner.",
  missing_server: "Add DISCORD_GUILD_ID to connect your server.",
  invalid_server: "DISCORD_GUILD_ID must be a valid Discord server ID.",
  missing_bot:
    "Server ID is set, but DISCORD_BOT_TOKEN is missing. Add your bot token and install that bot in this server to load its banner and member counts.",
  invalid_bot: "Discord rejected the bot token. Check DISCORD_BOT_TOKEN.",
  no_access:
    "The bot cannot access this server. Check the server ID and install the bot in that server.",
  no_banner:
    "Connected, but this server has no Discord banner. The branded default GIF is shown instead.",
  unavailable:
    "Discord is temporarily unavailable. The branded default GIF is shown instead.",
};
export function DiscordStatus() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/discord/banner",
    async (url) => {
      const r = await communityFetch(url);
      if (!r.ok) throw new Error("Unavailable");
      return r.json();
    },
    { refreshInterval: 60000 },
  );
  return (
    <div className="mt-5 rounded-2xl border border-forest-200 p-4 text-sm">
      <h4 className="font-semibold">Discord connection</h4>
      <p role="status" className="mt-2">
        {isLoading
          ? "Checking Discord…"
          : (messages[error ? "unavailable" : data?.status] ??
            messages.unavailable)}
      </p>
      <p className="mt-2 text-xs text-ink-soft">
        After editing environment variables, restart the local server or
        redeploy on Vercel. Discord data refreshes about once a minute.
      </p>
      <button type="button" onClick={() => mutate()} className="mt-3 underline">
        Check again
      </button>
    </div>
  );
}
