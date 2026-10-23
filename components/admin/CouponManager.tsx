"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Plan } from "@/config/plans";
import { formatINR } from "@/lib/utils";

export type CouponDTO = {
  id: string; code: string; kind: string; value: number; active: boolean;
  minAmount: number; planSlug: string | null; expiresAt: string | null;
};
const inputClass = "mt-1 w-full rounded-xl border border-forest-200 bg-white p-3 text-forest-950";

export function CouponManager({ initial, plans }: { initial: CouponDTO[]; plans: Plan[] }) {
  const [coupons, setCoupons] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const expiry = String(values.get("expiresAt") ?? "");
      const response = await fetch("/api/admin/coupons", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: values.get("code"), kind: values.get("kind"),
          value: Number(values.get("value")), minAmount: Number(values.get("minAmount")),
          planSlug: values.get("planSlug") || null,
          expiresAt: expiry ? new Date(expiry).toISOString() : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create coupon.");
      setCoupons((current) => [data, ...current]);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon.");
    } finally { setBusy(false); }
  }

  async function toggle(coupon: CouponDTO) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      if (!response.ok) throw new Error("Could not update coupon.");
      setCoupons((current) => current.map((item) => item.id === coupon.id ? { ...item, active: !item.active } : item));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update coupon."); }
    finally { setBusy(false); }
  }

  return (
    <section className="mt-12 rounded-4xl border border-forest-100 bg-white/80 p-6 sm:p-8">
      <h2 className="font-display text-2xl text-forest-950">Coupons & discounts</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Create reusable codes for one plan or all plans. Members still submit UPI payment proof for manual review.
      </p>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <form onSubmit={create} className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <label>Coupon code<input name="code" required minLength={3} maxLength={32} pattern="[A-Za-z0-9_-]{3,32}" placeholder="e.g. WELCOME10" className={inputClass} /></label>
        <label>Discount type<select name="kind" className={inputClass}><option value="percent">Percentage (%)</option><option value="fixed">Fixed amount (₹)</option></select></label>
        <label>Discount value<input name="value" type="number" required min={1} max={100000} step={1} className={inputClass} /></label>
        <label>Minimum plan price (₹)<input name="minAmount" type="number" required min={0} max={100000} step={1} defaultValue={0} className={inputClass} /></label>
        <label>Applies to<select name="planSlug" className={inputClass}><option value="">All plans</option>{plans.map((plan) => <option key={plan.slug} value={plan.slug}>{plan.name}</option>)}</select></label>
        <label>Expires at (optional, your local time)<input name="expiresAt" type="datetime-local" className={inputClass} /></label>
        <p className="text-xs text-ink-soft sm:col-span-2">Percentage savings round down to whole rupees. A coupon must leave at least ₹1 payable. Codes do not stack and have no usage limit.</p>
        <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Create coupon"}</Button>
      </form>
      <div className="mt-8 space-y-3">
        {coupons.length === 0 && <p className="text-sm text-ink-soft">No coupons yet. Create your first discount above.</p>}
        {coupons.map((coupon) => (
          <div key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mist p-4">
            <div className="text-sm">
              <strong className="font-mono text-forest-950">{coupon.code}</strong>
              <p>{coupon.kind === "percent" ? `${coupon.value}%` : formatINR(coupon.value)} off · {coupon.planSlug ?? "All plans"} · {coupon.active ? "Enabled" : "Disabled"}</p>
              <p className="text-xs text-ink-soft">Minimum {formatINR(coupon.minAmount)}{coupon.expiresAt ? ` · Expires ${new Date(coupon.expiresAt).toLocaleString()}` : " · No expiry"}</p>
            </div>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => toggle(coupon)}>{coupon.active ? "Disable" : "Enable"}</Button>
          </div>
        ))}
      </div>
    </section>
  );
}
