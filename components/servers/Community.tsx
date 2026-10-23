"use client";
import { createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import useSWR from "swr";
import { site } from "@/config/site";
export type Community = {
  id: string;
  name: string;
  inviteUrl: string;
  status: string;
  guildId: string | null;
};
const Context = createContext<Community>({
  id: "default",
  name: "Verdanta",
  inviteUrl: "",
  status: "active",
  guildId: null,
});
export const useCommunity = () => useContext(Context);
export function CommunityProvider({
  server,
  children,
}: {
  server: Community;
  children: ReactNode;
}) {
  return <Context.Provider value={server}>{children}</Context.Provider>;
}
export function scopePath(id: string, path: string) {
  if (id !== "default" && path === "/login")
    return `/login?callbackUrl=${encodeURIComponent("/s/" + id)}`;
  if (
    id === "default" ||
    !/^\/(?:$|shop(?:[/?]|$)|checkout(?:[/?]|$)|order\/|admin(?:[/?]|$)|community(?:[/?]|$))/.test(
      path,
    )
  )
    return path;
  return `/s/${id}${path === "/" ? "" : path}`;
}
export function CommunityLink({ href, ...props }: ComponentProps<typeof Link>) {
  const server = useCommunity();
  return (
    <Link
      {...props}
      href={
        typeof href === "string"
          ? href === site.discordInvite
            ? server.inviteUrl || "/servers"
            : scopePath(server.id, href)
          : href
      }
    />
  );
}
export function apiUrl(path: string) {
  if (typeof window === "undefined") return path;
  const match = window.location.pathname.match(/^\/s\/([^/]+)/);
  return match &&
    path.startsWith("/api/") &&
    !path.startsWith("/api/s/") &&
    !path.startsWith("/api/servers") &&
    !path.startsWith("/api/auth")
    ? path.replace("/api/", `/api/s/${match[1]}/`)
    : path;
}
export const communityFetch: typeof fetch = (input, init) =>
  fetch(typeof input === "string" ? apiUrl(input) : input, init);
export function useCommunitySWR<T>(
  key: string,
  fetcher: (url: string) => Promise<T>,
  options: Parameters<typeof useSWR<T>>[2],
) {
  const server = useCommunity();
  return useSWR<T>(
    server.id === "default"
      ? key
      : key.replace("/api/", `/api/s/${server.id}/`),
    fetcher,
    options,
  );
}
export function CommunityIndicator() {
  const server = useCommunity();
  const path = usePathname();
  if (path.startsWith("/servers")) return null;
  return (
    <div className="relative z-10 mx-auto mt-24 flex max-w-6xl flex-wrap items-center justify-between gap-2 rounded-2xl border border-forest-200 bg-white/90 p-3 text-sm">
      <span>
        <strong>{server.name}</strong> · {server.guildId || "Setup pending"}{" "}
        {server.status !== "active" && ` · ${server.status}`}
      </span>
      <a href="/servers" className="underline">
        Switch / manage servers
      </a>
    </div>
  );
}
