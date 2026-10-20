import { site } from "@/config/site";

/**
 * Payment abstraction. The manual UPI flow is live now; the Razorpay provider
 * is a stub so switching to a server-verified gateway is a config change.
 */
export interface PaymentProvider {
  id: string;
}

export type UpiIntentInput = { amount: number; note: string };

/** Build a `upi://pay` deep link / QR payload. */
export function buildUpiIntent({ amount, note }: UpiIntentInput): string {
  const params = new URLSearchParams({
    pa: site.upi.id,
    pn: site.upi.payeeName,
    am: String(amount),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export const ManualUpiProvider = {
  id: "manual-upi",
  buildIntent: buildUpiIntent,
} satisfies PaymentProvider & { buildIntent: (i: UpiIntentInput) => string };

/**
 * Razorpay (server-verified) — prepared, not wired.
 * Implement createOrder() + verifyWebhook() with the Razorpay SDK, add keys to
 * env, and point checkout at this provider to eliminate manual verification.
 */
export const RazorpayProvider = {
  id: "razorpay",
  async createOrder(): Promise<never> {
    throw new Error("RazorpayProvider is not configured yet.");
  },
  async verifyWebhook(): Promise<never> {
    throw new Error("RazorpayProvider is not configured yet.");
  },
} satisfies PaymentProvider & Record<string, unknown>;

/** The provider currently powering checkout. */
export const activeProvider = ManualUpiProvider;
