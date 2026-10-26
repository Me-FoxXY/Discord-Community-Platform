"use client";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  ArrowUpRight,
  Check,
  Clock3,
  Leaf,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

type Community = {
  id: string;
  guildId: string | null;
  name: string;
  icon: string | null;
  status: string;
};
type Onboarding = {
  id: string;
  guildId: string;
  name: string;
  icon: string | null;
  requesterId: string;
  message: string;
  status: string;
  reviewNote: string | null;
  serverId: string | null;
  createdAt: string;
};
const field =
  "w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-950 focus:outline-2 focus:outline-forest-400";
export async function serverRequest(
  url: string,
  method = "GET",
  body?: unknown,
) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Unable to complete this request.");
  return data;
}
export function ServerBadge({ status }: { status: string }) {
  const styles =
    status === "pending"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : ["active", "approved"].includes(status)
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${styles}`}
    >
      {status === "pending" ? "Awaiting review" : status}
    </span>
  );
}
export function ServerAvatar({
  name,
  guildId,
  icon,
}: {
  name: string;
  guildId: string | null;
  icon: string | null;
}) {
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 font-display text-xl text-forest-700">
      {icon && guildId ? (
        <img
          src={`https://cdn.discordapp.com/icons/${guildId}/${icon}.webp?size=128`}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}
export function ServerHub() {
  const { status, data: session } = useSession();
  const [servers, setServers] = useState<Community[]>([]);
  const [requests, setRequests] = useState<Onboarding[]>([]);
  const [guilds, setGuilds] = useState<
    { id: string; name: string; icon: string | null }[]
  >([]);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [guildId, setGuildId] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("communities");
  const [filter, setFilter] = useState("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  async function load() {
    const [communityData, requestData] = await Promise.all([
      serverRequest("/api/servers"),
      serverRequest("/api/server-requests"),
    ]);
    setServers(communityData.servers);
    setAdmin(requestData.platformAdmin);
    setRequests(requestData.requests);
  }
  async function discover() {
    setDiscovering(true);
    setDiscoveryError("");
    try {
      setGuilds(await serverRequest("/api/discord/manageable-guilds"));
    } catch (e) {
      setDiscoveryError(
        e instanceof Error ? e.message : "Could not load Discord servers.",
      );
    } finally {
      setDiscovering(false);
    }
  }
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    void load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    void discover();
  }, [status]);
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (status === "unauthenticated")
    return (
      <section className="mx-auto max-w-xl rounded-4xl border border-forest-100 bg-white/90 p-10 text-center shadow-soft">
        <Leaf className="mx-auto mb-5 h-10 w-10 text-forest-600" />
        <h2 className="font-display text-3xl">Your community starts here</h2>
        <p className="my-5 text-ink-soft">
          Sign in with Discord to find your servers, request a storefront, and
          manage your community.
        </p>
        <Button onClick={() => signIn("discord", { callbackUrl: "/servers" })}>
          Continue with Discord
        </Button>
      </section>
    );
  if (status === "loading" || loading)
    return (
      <div role="status" className="grid gap-5 sm:grid-cols-3">
        <span className="sr-only">Loading your communities</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-3xl bg-white/70" />
        ))}
      </div>
    );
  const mine = requests.filter(
    (r) => r.requesterId === session?.user?.discordId,
  );
  const pending = requests.filter((r) => r.status === "pending");
  const unavailable =
    servers.some((s) => s.guildId === guildId) ||
    requests.some((r) => r.guildId === guildId && r.status !== "rejected");
  return (
    <div className="space-y-7">
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}{" "}
          <button
            className="ml-2 underline"
            onClick={() => act(async () => {})}
          >
            Refresh
          </button>
        </div>
      )}
      {notice && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          <Check className="h-4 w-4" />
          {notice}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Connected communities", count: servers.length, Icon: Leaf },
          { label: "Your requests", count: mine.length, Icon: Clock3 },
          {
            label: admin ? "Awaiting your review" : "Awaiting approval",
            count: admin
              ? pending.length
              : mine.filter((r) => r.status === "pending").length,
            Icon: ShieldCheck,
          },
        ].map(({ label, count, Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-3xl border border-forest-100 bg-white/80 p-5"
          >
            <span className="rounded-2xl bg-forest-50 p-3 text-forest-600">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-3xl">{count}</p>
              <p className="text-xs text-ink-soft">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-100 pb-4">
        <div
          aria-label="Community workspace sections"
          className="flex flex-wrap gap-2"
        >
          {[
            ["communities", "Communities"],
            ["requests", "Your requests"],
            ...(admin ? [["review", "Review queue"]] : []),
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${tab === id ? "bg-forest-700 text-white" : "bg-white/60 text-forest-700 hover:bg-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          onClick={() => {
            setTab("new");
            setNotice("");
          }}
        >
          <Plus className="h-4 w-4" />
          Request a community
        </Button>
      </div>
      {tab === "communities" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((s) => (
            <article
              key={s.id}
              className="group flex flex-col rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <ServerAvatar {...s} />
                <ServerBadge status={s.status} />
              </div>
              <h2 className="mt-5 break-words font-display text-2xl">
                {guilds.find((g) => g.id === s.guildId)?.name || s.name}
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Your storefront, products, staff, and community settings.
              </p>
              <p className="mt-3 text-xs text-ink-soft">
                Server ID · {s.guildId || "Setup pending"}
              </p>
              <a
                href={`/servers/${s.id}`}
                className="mt-6 flex items-center justify-between border-t border-forest-100 pt-4 text-sm font-semibold text-forest-700"
              >
                Manage community
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </article>
          ))}
          {!servers.length && (
            <div className="col-span-full rounded-3xl border border-dashed border-forest-200 bg-white/60 px-6 py-14 text-center">
              <Leaf className="mx-auto mb-4 h-8 w-8 text-forest-500" />
              <h2 className="font-display text-2xl">Room for your community</h2>
              <p className="mx-auto my-3 max-w-lg text-sm text-ink-soft">
                Discord ownership lets you request a storefront. Once a website
                administrator approves it, your community will appear here.
              </p>
              <Button variant="outline" onClick={() => setTab("new")}>
                Find my Discord servers
              </Button>
            </div>
          )}
        </div>
      )}
      {tab === "new" && (
        <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
          <form
            className="space-y-5 rounded-4xl border border-forest-100 bg-white/90 p-6 shadow-soft sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              void act(async () => {
                await serverRequest("/api/server-requests", "POST", {
                  guildId,
                  message,
                });
                setMessage("");
                setGuildId("");
                setTab("requests");
                setNotice(
                  "Request submitted. A website administrator will review your community.",
                );
              });
            }}
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-forest-600">
                Grow with Verdanta
              </span>
              <h2 className="mt-2 font-display text-3xl">
                Request a storefront
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Choose a server you own or manage. Its name is verified directly
                with Discord.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="request-guild" className="text-sm font-semibold">
                Discord server
              </label>
              <button
                type="button"
                disabled={discovering}
                onClick={() => discover()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${discovering ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
            {discoveryError && (
              <div
                role="alert"
                className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900"
              >
                {discoveryError}
                <button
                  type="button"
                  className="mt-2 block underline"
                  onClick={() =>
                    signIn(
                      "discord",
                      { callbackUrl: "/servers" },
                      { prompt: "consent" },
                    )
                  }
                >
                  Reconnect Discord
                </button>
              </div>
            )}
            <Select
              id="request-guild"
              aria-label="Discord server"
              value={guildId}
              onChange={setGuildId}
              disabled={discovering || busy}
              className={field}
            >
              <option value="">
                {discovering
                  ? "Finding your servers…"
                  : "Choose a Discord server"}
              </option>
              {guilds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                  {guilds.filter((other) => other.name === g.name).length > 1
                    ? ` · …${g.id.slice(-6)}`
                    : ""}
                </option>
              ))}
            </Select>
            {!discovering && !discoveryError && !guilds.length && (
              <p className="text-sm text-ink-soft">
                No servers with ownership, Administrator, or Manage Server
                permission were found for this account.
              </p>
            )}
            {unavailable && (
              <p className="text-sm text-amber-800">
                This community is already connected or has a request awaiting
                review.
              </p>
            )}
            <label className="block text-sm font-semibold">
              Tell us about your community{" "}
              <span className="font-normal text-ink-soft">(optional)</span>
              <textarea
                value={message}
                maxLength={1000}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className={`${field} mt-2 resize-y`}
                placeholder="What is your community about? What perks would you like to offer?"
              />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-forest-100 pt-5">
              <span className="text-xs text-ink-soft">
                No storefront is published until approval.
              </span>
              <Button disabled={busy || !guildId || unavailable || discovering}>
                {busy ? "Submitting…" : "Submit request"}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <aside className="rounded-4xl border border-forest-100 bg-forest-50/80 p-7">
            <h3 className="font-display text-2xl">A thoughtful start</h3>
            <ol className="mt-6 space-y-6">
              {[
                "Choose your Discord community",
                "Send your request for review",
                "Set up your approved storefront",
              ].map((text, i) => (
                <li key={text} className="flex gap-3 text-sm">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white font-semibold text-forest-700">
                    {i + 1}
                  </span>
                  <span className="pt-1">{text}</span>
                </li>
              ))}
            </ol>
            <p className="mt-7 border-t border-forest-200 pt-5 text-sm text-ink-soft">
              Before approval, the platform bot must be installed with Manage
              Roles. Your Discord management permissions are checked again at
              review time.
            </p>
          </aside>
        </div>
      )}
      {(tab === "requests" || (tab === "review" && admin)) && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">
                {tab === "review"
                  ? "Community applications"
                  : "Your application history"}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {tab === "review"
                  ? "Review the community, verify bot setup, and leave a clear decision."
                  : "Follow each request from submission to a ready storefront."}
              </p>
            </div>
            {tab === "review" && (
              <div className="w-48">
                <Select
                  aria-label="Request status"
                  value={filter}
                  onChange={setFilter}
                  className={field}
                >
                  <option value="pending">Awaiting review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="all">All requests</option>
                </Select>
              </div>
            )}
          </div>
          {(tab === "review"
            ? requests.filter((r) => filter === "all" || r.status === filter)
            : mine
          ).map((r) => (
            <article
              key={r.id}
              className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ServerAvatar {...r} />
                  <div>
                    <h3 className="break-words font-display text-xl">
                      {r.name}
                    </h3>
                    <p className="mt-1 text-xs text-ink-soft">
                      {new Date(r.createdAt).toLocaleDateString()} · Server{" "}
                      {r.guildId}
                    </p>
                  </div>
                </div>
                <ServerBadge status={r.status} />
              </div>
              {r.message && (
                <p className="mt-5 whitespace-pre-wrap break-words rounded-2xl bg-forest-50/60 p-4 text-sm text-ink-soft">
                  {r.message}
                </p>
              )}
              {r.reviewNote && (
                <p className="mt-4 text-sm">
                  <strong>Review note: </strong>
                  {r.reviewNote}
                </p>
              )}
              {tab === "review" && r.status === "pending" && (
                <div className="mt-5 border-t border-forest-100 pt-5">
                  <p className="mb-3 text-xs text-ink-soft">
                    Requested by Discord user {r.requesterId}. Approval grants
                    this requester management access only to this community.
                  </p>
                  <label className="text-sm font-semibold">
                    Review note
                    <textarea
                      aria-label={`Review note for ${r.name}`}
                      rows={2}
                      maxLength={1000}
                      value={notes[r.id] || ""}
                      onChange={(e) =>
                        setNotes({ ...notes, [r.id]: e.target.value })
                      }
                      className={`${field} mt-2`}
                      placeholder="Required when rejecting; explain what should change."
                    />
                  </label>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      disabled={busy}
                      onClick={() =>
                        act(async () => {
                          await serverRequest(
                            `/api/server-requests/${r.id}`,
                            "POST",
                            { decision: "approved", note: notes[r.id] || "" },
                          );
                          setNotice(
                            `${r.name} approved. The requester can now manage its storefront.`,
                          );
                        })
                      }
                    >
                      Approve community
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy || !notes[r.id]?.trim()}
                      onClick={() =>
                        act(async () => {
                          await serverRequest(
                            `/api/server-requests/${r.id}`,
                            "POST",
                            { decision: "rejected", note: notes[r.id] },
                          );
                          setNotice(
                            `${r.name} request rejected with your note.`,
                          );
                        })
                      }
                    >
                      Reject request
                    </Button>
                    <a
                      className="px-2 py-3 text-sm text-forest-700 underline"
                      href="/api/servers/install"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Bot installation ↗
                    </a>
                  </div>
                </div>
              )}
              {r.status === "approved" && r.serverId && (
                <a
                  href={`/servers/${r.serverId}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest-700"
                >
                  Open community settings
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              {r.status === "rejected" && tab === "requests" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setGuildId(r.guildId);
                    setMessage(r.message);
                    setTab("new");
                  }}
                >
                  Prepare a new request
                </Button>
              )}
            </article>
          ))}
          {!(
            tab === "review"
              ? requests.filter((r) => filter === "all" || r.status === filter)
              : mine
          ).length && (
            <p className="rounded-3xl border border-dashed border-forest-200 bg-white/60 p-10 text-center text-sm text-ink-soft">
              {tab === "review"
                ? "No requests in this view. You’re all caught up."
                : "Your requests will appear here after you submit one."}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
