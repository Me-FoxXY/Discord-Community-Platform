"use client";
import { Select } from "@/components/ui/Select";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
type Server = {
  id: string;
  name: string;
  guildId: string | null;
  icon: string | null;
  status: string;
  version: number;
  inviteUrl: string;
  upiId: string;
  payeeName: string;
};
type Audit = {
  id: string;
  action: string;
  outcome: string;
  createdAt: string;
  actorId: string;
};
const inputClass =
  "w-full rounded-xl border border-forest-200 bg-white p-3 text-forest-950";
async function request(url: string, method = "GET", body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || "Unable to complete this request.");
  return data;
}
export function ServerManager({
  initialServerId,
}: {
  initialServerId?: string;
}) {
  const router = useRouter();
  const { status } = useSession();
  const [servers, setServers] = useState<Server[]>([]),
    [selected, setSelected] = useState<Server | null>(null),
    [role, setRole] = useState("viewer");
  const [platformAdmin, setPlatformAdmin] = useState(false),
    [registrarId, setRegistrarId] = useState("");
  const [canRegister, setCanRegister] = useState(false),
    [guildId, setGuildId] = useState(""),
    [choices, setChoices] = useState<{ id: string; name: string }[]>([]);
  const [discoveryError, setDiscoveryError] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  async function discover() {
    setDiscovering(true);
    setDiscoveryError("");
    try {
      setChoices(await request("/api/discord/manageable-guilds"));
      setDiscovered(true);
    } catch (error) {
      setDiscoveryError(
        error instanceof Error
          ? error.message
          : "Could not load Discord servers.",
      );
    } finally {
      setDiscovering(false);
    }
  }
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(status !== "unauthenticated");
  const [audit, setAudit] = useState<Audit[]>([]),
    [staff, setStaff] = useState<{ userId: string; role: string }[]>([]),
    [staffId, setStaffId] = useState(""),
    [staffRole, setStaffRole] = useState("reviewer");
  async function load() {
    const data = await request("/api/servers");
    setServers(data.servers);
    setCanRegister(data.canRegister);
    setPlatformAdmin(data.platformAdmin);
  }
  async function open(id: string) {
    const data = await request(`/api/servers/${id}`);
    setSelected(data.server);
    setRole(data.role);
    setAudit(data.audit);
    setStaff(
      data.role === "manager" ? await request(`/api/servers/${id}/access`) : [],
    );
  }
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (status === "authenticated") {
      void discover();
      setLoading(true);
      load()
        .then(() => (initialServerId ? open(initialServerId) : undefined))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") setLoading(false);
  }, [status, initialServerId]);
  if (status === "loading" || loading)
    return (
      <p role="status" className="p-8">
        Loading your servers…
      </p>
    );
  if (status === "unauthenticated")
    return (
      <div className="rounded-3xl bg-white/90 p-8">
        <h2 className="text-2xl">Sign in to manage your communities</h2>
        <Button
          onClick={() => signIn("discord", { callbackUrl: "/servers" })}
          className="mt-5"
        >
          Continue with Discord
        </Button>
      </div>
    );
  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-xl bg-green-50 p-4 text-green-900">
          {message}
        </p>
      )}
      <section className="rounded-3xl border border-forest-200 bg-white/90 p-6">
        <label htmlFor="server-select" className="mb-2 block font-semibold">
          Your connected communities
        </label>
        <Select
          id="server-select"
          className={inputClass}
          value={selected?.id || ""}
          disabled={busy}
          onChange={(value) => {
            const id = value;
            if (id) router.push("/servers/" + id);
            else router.push("/servers");
          }}
        >
          <option value="">Select a server</option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {choices.find((g) => g.id === s.guildId)?.name || s.name} ·{" "}
              {s.status}
            </option>
          ))}
        </Select>
        {!servers.length && (
          <p className="mt-3">
            No communities are connected to your website account yet. Your
            Discord servers appear below.
          </p>
        )}
      </section>
      {!selected && (
        <section className="rounded-3xl border border-forest-200 bg-white/90 p-6">
          <h2 className="text-xl font-semibold">
            Servers you manage on Discord
          </h2>
          <p className="my-3 text-ink-soft">
            Servers you own or have permission to manage appear here. Connecting
            a server also requires website registration permission and the
            platform bot.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy || discovering}
              variant="outline"
              onClick={() => discover()}
            >
              {discovering
                ? "Finding your servers…"
                : "Refresh Discord servers"}
            </Button>
            {canRegister && (
              <Link
                className="rounded-full border px-5 py-3"
                href="/api/servers/install"
                target="_blank"
                rel="noreferrer"
              >
                Install bot in Discord ↗
              </Link>
            )}
          </div>
          {discoveryError && (
            <div
              role="alert"
              className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-950"
            >
              <p>{discoveryError}</p>
              <button
                type="button"
                className="mt-2 font-semibold underline"
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
          {!discovering && discovered && choices.length === 0 && (
            <p className="mt-4 text-sm text-ink-soft">
              No servers with ownership or Manage Server permission were found
              for this Discord account. Try reconnecting with the account that
              owns your servers.
            </p>
          )}
          {!canRegister && (
            <p className="mt-4 text-sm text-ink-soft">
              You can browse your Discord servers here. Ask a website
              administrator for permission to connect one.
            </p>
          )}
          {choices.length > 0 && (
            <Select
              aria-label="Discord servers"
              className={`${inputClass} mt-4`}
              onChange={(value) => setGuildId(value)}
              value={guildId}
            >
              <option value="">Choose a server</option>
              {choices.map((g) => (
                <option value={g.id} key={g.id}>
                  {g.name}
                  {choices.filter((other) => other.name === g.name).length > 1
                    ? ` · …${g.id.slice(-6)}`
                    : ""}
                </option>
              ))}
            </Select>
          )}
          {canRegister && (
            <form
              className="mt-4 flex flex-wrap gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void action(async () => {
                  const result = await request("/api/servers", "POST", {
                    guildId,
                  });
                  await load();
                  await open(result.id);
                  setMessage(
                    "Server added. Configure payment details and products before selling.",
                  );
                });
              }}
            >
              <input
                aria-label="Discord server ID"
                placeholder="Discord server ID"
                value={guildId}
                onChange={(e) => setGuildId(e.target.value)}
                className={`${inputClass} max-w-md`}
                required
                pattern="[1-9][0-9]{16,19}"
              />
              <Button disabled={busy}>Validate and add</Button>
            </form>
          )}
        </section>
      )}
      {platformAdmin && !selected && (
        <section className="rounded-3xl border border-forest-200 bg-white/90 p-6">
          <h2 className="text-xl">Who can register servers?</h2>
          <p className="my-3 text-ink-soft">
            Registration permission does not grant access to other communities.
            Discord management permissions are still required.
          </p>
          <input
            aria-label="Registration user ID"
            className={inputClass}
            placeholder="Discord user ID"
            value={registrarId}
            onChange={(e) => setRegistrarId(e.target.value)}
          />
          <div className="mt-3 flex gap-3">
            <Button
              disabled={busy}
              onClick={() =>
                action(async () => {
                  await request("/api/servers/platform-access", "PUT", {
                    userId: registrarId,
                    role: "registrar",
                  });
                  setMessage("Registration permission granted.");
                })
              }
            >
              Allow registration
            </Button>
            <Button
              disabled={busy}
              variant="outline"
              onClick={() =>
                action(async () => {
                  if (
                    !window.confirm(
                      "Remove this user’s permission to register new servers?",
                    )
                  )
                    return;
                  await request("/api/servers/platform-access", "PUT", {
                    userId: registrarId,
                    role: "remove",
                  });
                  setMessage("Registration permission removed.");
                })
              }
            >
              Remove permission
            </Button>
          </div>
        </section>
      )}
      {selected && (
        <section className="rounded-3xl border border-forest-200 bg-white/90 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl">{selected.name}</h2>
              <p className="text-sm text-ink-soft">
                Guild {selected.guildId || "not imported"} · {role} ·{" "}
                {selected.status}
              </p>
            </div>
            <div className="flex gap-3">
              <a className="underline" href={`/s/${selected.id}`}>
                Open storefront
              </a>
              {role !== "viewer" && (
                <a className="underline" href={`/s/${selected.id}/admin`}>
                  Orders & products
                </a>
              )}
            </div>
          </div>
          <Button
            disabled={busy}
            variant="outline"
            className="my-5"
            onClick={() =>
              action(async () => {
                const data = await request(
                  `/api/servers/${selected.id}/validate`,
                  "POST",
                );
                setMessage(
                  `${data.message} Checked ${new Date(data.checkedAt).toLocaleString()}. This checks HTTP access, not Gateway presence.`,
                );
              })
            }
          >
            Check bot access
          </Button>
          {role === "manager" && (
            <>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void action(async () => {
                    const previous = servers.find((s) => s.id === selected.id);
                    if (
                      previous?.status !== selected.status &&
                      selected.status !== "active" &&
                      !window.confirm(
                        "Disable or archive this store? New purchases and role delivery will pause. Existing records are retained.",
                      )
                    )
                      return;
                    await request(
                      `/api/servers/${selected.id}`,
                      "PATCH",
                      selected,
                    );
                    await load();
                    await open(selected.id);
                    setMessage("Server settings saved.");
                  });
                }}
              >
                {(["name", "inviteUrl", "upiId", "payeeName"] as const).map(
                  (key) => (
                    <label key={key} className="text-sm">
                      {
                        {
                          name: "Server display name",
                          inviteUrl: "Discord invite URL",
                          upiId: "UPI recipient ID",
                          payeeName: "UPI payee name",
                        }[key]
                      }
                      <input
                        className={`${inputClass} mt-1`}
                        value={selected[key]}
                        onChange={(e) =>
                          setSelected({ ...selected, [key]: e.target.value })
                        }
                        required={key === "name"}
                      />
                    </label>
                  ),
                )}
                <label>
                  Status
                  <Select
                    aria-label="Status"
                    className={inputClass}
                    value={selected.status}
                    onChange={(value) =>
                      setSelected({ ...selected, status: value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                    <option value="archived">Archived (retain records)</option>
                  </Select>
                </label>
                <div className="self-end">
                  <Button disabled={busy}>Save settings</Button>
                </div>
              </form>
              <h3 className="mt-8 text-xl">Server staff</h3>
              <ul className="my-3 space-y-2">
                {staff.map((s) => (
                  <li key={s.userId}>
                    {s.userId} · {s.role}
                  </li>
                ))}
              </ul>
              <form
                className="flex flex-wrap gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void action(async () => {
                    if (
                      staffRole === "remove" &&
                      !window.confirm("Remove this user’s website access?")
                    )
                      return;
                    await request(`/api/servers/${selected.id}/access`, "PUT", {
                      userId: staffId,
                      role: staffRole,
                    });
                    await open(selected.id);
                    setMessage("Staff access updated.");
                  });
                }}
              >
                <input
                  className={`${inputClass} max-w-xs`}
                  aria-label="Staff Discord user ID"
                  placeholder="Discord user ID"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  required
                  pattern="[1-9][0-9]{16,19}"
                />
                <Select
                  aria-label="Staff role"
                  value={staffRole}
                  onChange={(value) => setStaffRole(value)}
                  className="rounded-xl border p-3"
                >
                  <option value="reviewer">Payment reviewer</option>
                  <option value="viewer">Viewer</option>
                  <option value="manager">Server manager</option>
                  <option value="remove">Remove access</option>
                </Select>
                <Button disabled={busy}>Update access</Button>
              </form>
              <h3 className="mt-8 text-xl">Recent administrative activity</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {audit.map((a) => (
                  <li key={a.id}>
                    {new Date(a.createdAt).toLocaleString()} · {a.action} ·{" "}
                    {a.outcome} · {a.actorId}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
}
