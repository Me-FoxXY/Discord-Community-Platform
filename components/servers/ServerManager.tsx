"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  ServerHub,
  ServerAvatar,
  ServerBadge,
  serverRequest as request,
} from "./ServerHub";
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
  "w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-forest-950 focus:outline-2 focus:outline-forest-400";
export function ServerManager({
  initialServerId,
}: {
  initialServerId?: string;
}) {
  return initialServerId ? (
    <ServerSettings key={initialServerId} initialServerId={initialServerId} />
  ) : (
    <ServerHub />
  );
}
function ServerSettings({ initialServerId }: { initialServerId: string }) {
  const { status } = useSession();
  const [servers, setServers] = useState<Server[]>([]),
    [selected, setSelected] = useState<Server | null>(null),
    [role, setRole] = useState("viewer");
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<Audit[]>([]),
    [staff, setStaff] = useState<{ userId: string; role: string }[]>([]),
    [staffId, setStaffId] = useState(""),
    [staffRole, setStaffRole] = useState("reviewer");
  async function load() {
    const data = await request("/api/servers");
    setServers(data.servers);
  }
  async function open(id: string) {
    const data = await request("/api/servers/" + id);
    setSelected(data.server);
    setRole(data.role);
    setAudit(data.audit);
    setStaff(
      data.role === "manager"
        ? await request("/api/servers/" + id + "/access")
        : [],
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
      setLoading(true);
      Promise.all([load(), open(initialServerId)])
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") setLoading(false);
  }, [status, initialServerId]);
  if (status === "unauthenticated") return <ServerHub />;
  if (loading || status === "loading")
    return (
      <p
        role="status"
        className="animate-pulse rounded-3xl bg-white/80 p-8 text-ink-soft"
      >
        Opening your community workspace…
      </p>
    );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href="/servers"
          className="text-sm font-semibold text-forest-700 hover:underline"
        >
          ← All communities
        </a>
        <div className="w-full sm:w-72">
          <Select
            aria-label="Switch community"
            value={selected?.id || ""}
            onChange={(id) => {
              window.location.href = "/servers/" + id;
            }}
            className={inputClass}
          >
            <option value="">Choose a community</option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          {message}
        </p>
      )}
      {selected && (
        <section className="rounded-4xl border border-forest-100 bg-white/90 p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <ServerAvatar {...selected} />
                <ServerBadge status={selected.status} />
              </div>
              <h2 className="font-display text-3xl">{selected.name}</h2>
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
                className="grid gap-5 rounded-3xl border border-forest-100 bg-forest-50/40 p-5 sm:grid-cols-2"
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
              <h3 className="mt-10 font-display text-2xl">
                People & permissions
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                Give your team the access they need within this community.
              </p>
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
              <h3 className="mt-10 font-display text-2xl">Activity trail</h3>
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
