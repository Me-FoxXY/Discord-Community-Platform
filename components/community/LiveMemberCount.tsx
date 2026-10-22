"use client";

import useSWR from "swr";
import { formatCompact } from "@/lib/utils";

type MembersResponse = { total: number; online: number; source: "live" | "mock" };

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<MembersResponse>);

export function LiveMemberCount({ className }: { className?: string }) {
  const { data } = useSWR<MembersResponse>("/api/discord/members", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  const online = data?.source === "live" ? data.online : null;

  return (
    <span className={className}>
      <span className="relative mr-2 inline-flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint-500" />
      </span>
      <span className="font-semibold text-forest-900">{online === null ? "Join our community" : formatCompact(online)}</span>
      {online !== null && <span className="text-ink-soft"> online now</span>}
    </span>
  );
}
