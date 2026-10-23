"use client";
import { communityFetch } from "@/components/servers/Community";
import { useCommunitySWR as useSWR } from "@/components/servers/Community";
import { formatCompact } from "@/lib/utils";
type MembersResponse = {
  total: number | null;
  online: number | null;
  source: "live" | "unavailable";
};
export function useMembers() {
  return useSWR<MembersResponse>(
    "/api/discord/members",
    async (url) => {
      const r = await communityFetch(url);
      if (!r.ok) throw new Error("Counts unavailable");
      return r.json();
    },
    { refreshInterval: 60000, revalidateOnFocus: false },
  );
}
export function MemberStats() {
  const { data } = useMembers();
  return (
    <div className="grid grid-cols-2 gap-6" aria-label="Discord member counts">
      {[
        ["Members", data?.total],
        ["Online now", data?.online],
      ].map(([label, value]) => (
        <div key={String(label)}>
          <div className="font-display text-3xl font-semibold text-forest-900">
            {typeof value === "number" ? formatCompact(value) : "—"}
          </div>
          <p className="mt-1 text-sm text-ink-soft">{label}</p>
        </div>
      ))}
      <p className="col-span-2 text-xs text-ink-soft">
        {data?.source === "live"
          ? "Approximate counts from Discord. Unavailable counts show —."
          : "Member counts are currently unavailable."}
      </p>
    </div>
  );
}
export function LiveMemberCount({ className }: { className?: string }) {
  const { data } = useMembers();
  const online = data?.online;
  return (
    <span className={className}>
      <span className="font-semibold text-forest-900">
        {typeof online === "number"
          ? `${formatCompact(online)} online now`
          : "Join our community"}
      </span>
    </span>
  );
}
