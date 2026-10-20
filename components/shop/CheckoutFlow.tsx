"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  ShieldCheck,
  Upload,
  AlertCircle,
  QrCode,
} from "lucide-react";
import type { Plan } from "@/config/plans";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatINR, cn } from "@/lib/utils";

type OrderData = {
  orderId: string;
  amount: number;
  note: string;
  upiId: string;
  payeeName: string;
  upiIntent: string;
  qrSvg: string;
};

export function CheckoutFlow({ plan, username }: { plan: Plan; username: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"review" | "pay">("review");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utr, setUtr] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function createOrder() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: plan.slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start your order.");
      setOrder(data);
      setStep("pay");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  async function submitProof(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setError(null);
    if (!/^\d{12}$/.test(utr.trim())) {
      setError("Enter a valid 12-digit UTR reference.");
      return;
    }
    if (!file) {
      setError("Attach a screenshot of your payment.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("utr", utr.trim());
      fd.append("screenshot", file);
      const res = await fetch(`/api/orders/${order.orderId}/proof`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit your proof.");
      router.push(`/order/${order.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      {/* Main */}
      <div className="order-2 lg:order-1">
        {/* Steps indicator */}
        <div className="mb-8 flex items-center gap-3 text-sm">
          <StepPill n={1} label="Review" active={step === "review"} done={step === "pay"} />
          <div className="h-px flex-1 bg-forest-100" />
          <StepPill n={2} label="Pay & confirm" active={step === "pay"} done={false} />
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "review" ? (
          <div className="rounded-4xl border border-forest-100/70 bg-white/80 p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-2xl text-forest-950">Review your order</h2>
            <p className="mt-2 text-sm text-ink-soft">
              You&apos;re buying <strong className="text-forest-800">{plan.name}</strong>. Perks are delivered
              to your Discord account after we verify your payment.
            </p>
            <div className="mt-6 rounded-2xl bg-mist p-4 text-sm text-ink-soft">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-forest-500" />
                Delivering to <strong className="text-forest-800">{username}</strong>
              </div>
            </div>
            <Button className="mt-8 w-full" size="lg" onClick={createOrder} disabled={creating}>
              {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Continue to payment
              {!creating && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Payment */}
            <div className="rounded-4xl border border-forest-100/70 bg-white/80 p-6 shadow-soft sm:p-8">
              <h2 className="flex items-center gap-2 font-display text-2xl text-forest-950">
                <QrCode className="h-6 w-6 text-forest-500" /> Pay {formatINR(order.amount)} via UPI
              </h2>
              <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div
                  className="h-52 w-52 shrink-0 rounded-2xl border border-forest-100 bg-white p-3 shadow-soft [&_svg]:h-full [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: order.qrSvg }}
                  aria-label="UPI payment QR code"
                />
                <div className="w-full space-y-3 text-sm">
                  <CopyRow label="UPI ID" value={order.upiId} copied={copied === "upi"} onCopy={() => copy(order.upiId, "upi")} />
                  <CopyRow label="Amount" value={formatINR(order.amount)} copied={copied === "amt"} onCopy={() => copy(String(order.amount), "amt")} />
                  <CopyRow label="Payment note" value={order.note} copied={copied === "note"} onCopy={() => copy(order.note, "note")} />
                  <p className="text-xs text-ink-soft">
                    Scan the QR in any UPI app (GPay, PhonePe, Paytm), or pay the UPI ID above. Please include the
                    payment note so we can match your order.
                  </p>
                </div>
              </div>
            </div>

            {/* Proof */}
            <form
              onSubmit={submitProof}
              className="rounded-4xl border border-forest-100/70 bg-white/80 p-6 shadow-soft sm:p-8"
            >
              <h2 className="font-display text-xl text-forest-950">Confirm your payment</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Enter the 12-digit UTR reference from your UPI app and upload a screenshot. Our team verifies it
                before granting perks.
              </p>

              <label className="mt-6 block text-sm font-medium text-forest-800">
                UTR / UPI reference number
                <input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  inputMode="numeric"
                  placeholder="12-digit reference"
                  className="mt-2 h-12 w-full rounded-2xl border border-forest-200 bg-white px-4 font-mono text-base outline-none focus:border-forest-400"
                />
              </label>

              <label className="mt-5 block text-sm font-medium text-forest-800">
                Payment screenshot
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-forest-200 bg-mist p-4">
                  <Upload className="h-5 w-5 text-forest-500" />
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="flex-1 text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-forest-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-forest-700"
                  />
                </div>
                {file && <span className="mt-1 block text-xs text-forest-600">Selected: {file.name}</span>}
              </label>

              <Button type="submit" className="mt-7 w-full" size="lg" disabled={submitting}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                Submit for verification
              </Button>
              <p className="mt-3 text-center text-xs text-ink-soft">
                Each UTR can only be used once. Faked or reused references are rejected.
              </p>
            </form>
          </div>
        ) : null}
      </div>

      {/* Summary */}
      <aside className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-28">
          <div className="rounded-4xl border border-forest-100/70 bg-white/80 p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-50 text-2xl">{plan.emoji}</span>
              <div>
                <h3 className="font-display text-lg font-semibold text-forest-950">{plan.name}</h3>
                <p className="text-xs text-ink-soft">{plan.tagline}</p>
              </div>
            </div>
            <div className="mt-5 flex items-end gap-1.5 border-b border-forest-100 pb-5">
              <span className="font-display text-3xl font-semibold text-forest-950">{formatINR(plan.price)}</span>
              <span className="mb-1 text-sm text-ink-soft">/ {plan.durationLabel}</span>
            </div>
            <ul className="mt-5 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f.label} className="flex items-start gap-2 text-sm text-ink-soft">
                  <Icon name={f.icon} className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" />
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

function StepPill({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
          done ? "bg-forest-500 text-white" : active ? "bg-forest-grad text-white" : "bg-forest-100 text-forest-500",
        )}
      >
        {done ? <Check className="h-4 w-4" /> : n}
      </span>
      <span className={cn("font-medium", active || done ? "text-forest-900" : "text-ink-soft")}>{label}</span>
    </div>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-mist px-3 py-2">
      <div className="min-w-0">
        <div className="text-xs text-ink-soft">{label}</div>
        <div className="truncate font-mono text-sm font-medium text-forest-900">{value}</div>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-forest-500 transition-colors hover:bg-white"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="h-4 w-4 text-forest-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
