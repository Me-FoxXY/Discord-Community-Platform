"use client";

import { useState } from "react";
import {
  Check,
  X,
  Loader2,
  Eye,
  AlertTriangle,
  Inbox,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatINR, cn } from "@/lib/utils";

export type AdminOrderDTO = {
  id: string;
  status: string;
  planName: string;
  amount: number;
  note: string;
  utr: string | null;
  duplicateFlag: boolean;
  discordUsername: string;
  discordUserId: string;
  hasScreenshot: boolean;
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  pending_review: "bg-sky-100 text-sky-700",
  approved: "bg-mint-100 text-mint-700",
  rejected: "bg-red-100 text-red-700",
  awaiting_payment: "bg-amber-100 text-amber-700",
};

export function AdminBoard({
  initialPending,
  initialRecent,
}: {
  initialPending: AdminOrderDTO[];
  initialRecent: AdminOrderDTO[];
}) {
  const [tab, setTab] = useState<"pending" | "recent">("pending");
  const [pending, setPending] = useState(initialPending);
  const [recent, setRecent] = useState(initialRecent);
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminOrderDTO | null>(null);
  const [rejecting, setRejecting] = useState<AdminOrderDTO | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function act(order: AdminOrderDTO, action: "approve" | "reject", note?: string) {
    setBusy(order.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed.");
      const newStatus = action === "approve" ? "approved" : "rejected";
      setPending((list) => list.filter((o) => o.id !== order.id));
      setRecent((list) => list.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
      setRejecting(null);
      setRejectNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  const list = tab === "pending" ? pending : recent;

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-full border border-forest-100 bg-white/70 p-1">
        <TabBtn active={tab === "pending"} onClick={() => setTab("pending")}>
          Pending review
          <span className="ml-2 rounded-full bg-forest-100 px-2 text-xs font-bold text-forest-700">
            {pending.length}
          </span>
        </TabBtn>
        <TabBtn active={tab === "recent"} onClick={() => setTab("recent")}>
          All recent
        </TabBtn>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {list.length === 0 ? (
        <EmptyState pending={tab === "pending"} />
      ) : (
        <div className="grid gap-4">
          {list.map((o) => (
            <div
              key={o.id}
              className="rounded-4xl border border-forest-100/70 bg-white/80 p-5 shadow-soft sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-forest-grad text-xs font-bold text-white">
                      {o.discordUsername.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-semibold text-forest-900">{o.discordUsername}</span>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", statusStyles[o.status])}>
                      {o.status.replace("_", " ")}
                    </span>
                    {o.duplicateFlag && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        <AlertTriangle className="h-3 w-3" /> Duplicate screenshot
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-xs text-ink-soft">ID {o.discordUserId}</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-mist p-4 text-sm sm:grid-cols-4">
                <Meta label="Plan" value={o.planName} />
                <Meta label="Amount" value={formatINR(o.amount)} />
                <Meta label="Note" value={o.note} mono />
                <Meta label="UTR" value={o.utr ?? "—"} mono />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreview(o)}
                  disabled={!o.hasScreenshot}
                >
                  <Eye className="h-4 w-4" /> View screenshot
                </Button>
                {o.status === "pending_review" && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => act(o, "approve")}
                      disabled={busy === o.id}
                    >
                      {busy === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setRejecting(o)}
                      disabled={busy === o.id}
                    >
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screenshot preview */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Payment screenshot" className="max-w-2xl">
        {preview && (
          <div>
            <div className="mb-3 text-sm text-ink-soft">
              {preview.discordUsername} · {preview.note} · UTR {preview.utr ?? "—"}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/orders/${preview.id}/screenshot`}
              alt="Payment screenshot"
              className="max-h-[60vh] w-full rounded-2xl border border-forest-100 object-contain"
            />
          </div>
        )}
      </Modal>

      {/* Reject with note */}
      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject this order?">
        {rejecting && (
          <div>
            <p className="text-sm text-ink-soft">
              Optionally add a note explaining why. The buyer will see this on their order page.
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="e.g. Payment not received / amount mismatch"
              className="mt-3 w-full rounded-2xl border border-forest-200 bg-white p-3 text-sm outline-none focus:border-forest-400"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRejecting(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-500 bg-none hover:bg-red-600"
                onClick={() => act(rejecting, "reject", rejectNote.trim() || undefined)}
                disabled={busy === rejecting.id}
              >
                {busy === rejecting.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Confirm reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-forest-grad text-white shadow-soft" : "text-ink-soft hover:text-forest-800",
      )}
    >
      {children}
    </button>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className={cn("truncate font-semibold text-forest-900", mono && "font-mono text-sm")}>{value}</div>
    </div>
  );
}

function EmptyState({ pending }: { pending: boolean }) {
  return (
    <div className="rounded-5xl border border-dashed border-forest-200 bg-white/60 p-12 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-4xl bg-mint-100 text-mint-600">
        <Inbox className="h-8 w-8" />
      </span>
      <h3 className="mt-5 font-display text-xl text-forest-950">
        {pending ? "All caught up!" : "No orders yet"}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
        {pending
          ? "There are no payments waiting for review right now. New submissions will appear here."
          : "Orders will show up here once members start purchasing."}
      </p>
    </div>
  );
}
