"use client";
import { communityFetch } from "@/components/servers/Community";

import { useCommunitySWR as useSWR } from "@/components/servers/Community";
import { CommunityLink as Link } from "@/components/servers/Community";
import {
  CheckCircle2,
  Clock,
  Hourglass,
  XCircle,
  PartyPopper,
} from "lucide-react";
import { DiscordIcon } from "@/components/icons/brands";
import { Button } from "@/components/ui/Button";
import { site } from "@/config/site";
import { formatINR, cn } from "@/lib/utils";

export type OrderDTO = {
  id: string;
  status: "awaiting_payment" | "pending_review" | "approved" | "rejected";
  deliveryStatus: string;
  planName: string;
  amount: number;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  note: string;
  utr: string | null;
  reviewNote: string | null;
  createdAt: string;
};

const fetcher = async (url: string) => {
  const response = await communityFetch(url);
  if (!response.ok) throw new Error("Could not refresh this order.");
  return response.json();
};

const config = {
  awaiting_payment: {
    icon: Clock,
    tone: "bg-amber-100 text-amber-600",
    title: "Awaiting payment",
    desc: "We haven't received your payment proof yet. Return to checkout to complete your purchase.",
  },
  pending_review: {
    icon: Hourglass,
    tone: "bg-sky-100 text-sky-600",
    title: "Payment under review",
    desc: "Thanks! We're verifying your payment. This usually takes a few hours and always less than 24. This page updates automatically.",
  },
  approved: {
    icon: PartyPopper,
    tone: "bg-mint-100 text-mint-600",
    title: "Payment approved",
    desc: "An admin has verified your payment. Your Discord role delivery is tracked below.",
  },
  rejected: {
    icon: XCircle,
    tone: "bg-red-100 text-red-600",
    title: "Payment couldn't be verified",
    desc: "We weren't able to verify this payment. If you believe this is a mistake, reach out to support with your details.",
  },
} as const;

const steps = ["Payment submitted", "Payment approved", "Role delivered"];

export function OrderStatusView({ initial }: { initial: OrderDTO }) {
  const { data } = useSWR<OrderDTO>(`/api/orders/${initial.id}`, fetcher, {
    fallbackData: initial,
    refreshInterval: (d) =>
      d && (d.deliveryStatus === "delivered" || d.status === "rejected")
        ? 0
        : 8000,
    revalidateOnFocus: true,
  });

  const order = data ?? initial;
  const c = config[order.status];
  const StatusIcon = c.icon;
  const activeStep =
    order.deliveryStatus === "delivered"
      ? 2
      : order.status === "approved"
        ? 1
        : 0;

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-5xl border border-forest-100/70 bg-white/85 p-8 text-center shadow-card backdrop-blur sm:p-10">
        <span
          className={cn(
            "mx-auto grid h-20 w-20 place-items-center rounded-4xl",
            c.tone,
          )}
        >
          <StatusIcon className="h-9 w-9" />
        </span>
        <h1 className="mt-6 font-display text-3xl text-forest-950">
          {c.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-ink-soft">
          {c.desc}
        </p>
        {order.status === "approved" && (
          <p className="mt-4 rounded-2xl bg-mist p-4 text-sm" role="status">
            {order.deliveryStatus === "delivered"
              ? "Your plan role has been added. Other benefits may require staff setup."
              : order.deliveryStatus === "failed"
                ? "Your payment is approved, but role delivery needs staff attention. You do not need to pay again."
                : "Your payment is approved. Your role is waiting for delivery."}
          </p>
        )}

        {order.status === "rejected" && order.reviewNote && (
          <p className="mx-auto mt-4 max-w-md rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            Note from our team: {order.reviewNote}
          </p>
        )}

        {/* Timeline */}
        {order.status !== "rejected" && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-colors",
                      i <= activeStep
                        ? "bg-forest-500 text-white"
                        : "bg-forest-100 text-forest-400",
                    )}
                  >
                    {i < activeStep || order.deliveryStatus === "delivered" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="mt-2 text-xs text-ink-soft">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "h-0.5 w-8 rounded-full",
                      i < activeStep ? "bg-forest-400" : "bg-forest-100",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Order meta */}
        <dl className="mt-8 grid grid-cols-2 gap-3 rounded-3xl bg-mist p-5 text-left text-sm">
          <div>
            <dt className="text-ink-soft">Plan</dt>
            <dd className="font-semibold text-forest-900">{order.planName}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Amount</dt>
            <dd className="font-semibold text-forest-900">
              {formatINR(order.amount)}
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">Order note</dt>
            <dd className="font-mono font-semibold text-forest-900">
              {order.note}
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">UTR</dt>
            <dd className="font-mono font-semibold text-forest-900">
              {order.utr ?? "—"}
            </dd>
          </div>
        </dl>
        {order.couponCode && (
          <p className="mt-3 text-sm text-forest-700">
            Coupon {order.couponCode}: {formatINR(order.subtotal)} −{" "}
            {formatINR(order.discountAmount)} = {formatINR(order.amount)}{" "}
            payable.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {order.status === "approved" && (
            <Button href={site.discordInvite} variant="primary" size="lg">
              <DiscordIcon className="h-5 w-5" /> Open Discord
            </Button>
          )}
          {order.status === "rejected" && (
            <Button href="/shop" variant="primary" size="lg">
              Try again
            </Button>
          )}
          {order.status === "awaiting_payment" && (
            <Button href="/shop" variant="primary" size="lg">
              Back to shop
            </Button>
          )}
          <Button href="/" variant="outline" size="lg">
            Back home
          </Button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-ink-soft">
        Need help? Ask in{" "}
        <Link
          href={site.discordInvite}
          className="font-medium text-forest-600 underline"
        >
          our Discord
        </Link>
        .
      </p>
    </div>
  );
}
