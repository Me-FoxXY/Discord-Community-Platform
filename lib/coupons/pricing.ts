export type CouponRule = {
  code: string;
  kind: string;
  value: number;
  active: boolean;
  minAmount: number;
  planSlug: string | null;
  expiresAt: Date | null;
};

export class CouponError extends Error {}

export function calculatePrice(
  plan: { slug: string; price: number },
  coupon: CouponRule | null,
  now = new Date(),
) {
  const subtotal = plan.price;
  if (!coupon) return { subtotal, discountAmount: 0, amount: subtotal, couponCode: null };
  if (!coupon.active || (coupon.expiresAt && coupon.expiresAt <= now)) {
    throw new CouponError("This coupon is inactive or has expired.");
  }
  if (coupon.planSlug && coupon.planSlug !== plan.slug) {
    throw new CouponError("This coupon does not apply to this plan.");
  }
  if (subtotal < coupon.minAmount) {
    throw new CouponError(`This coupon requires a minimum order of ₹${coupon.minAmount}.`);
  }
  // This application currently charges whole rupees. Round savings down consistently.
  const discountAmount = coupon.kind === "percent"
    ? Math.floor(subtotal * coupon.value / 100) : coupon.value;
  if (!Number.isSafeInteger(discountAmount) || discountAmount <= 0 || discountAmount >= subtotal) {
    throw new CouponError("This coupon cannot be used for this amount. At least ₹1 must remain payable.");
  }
  return { subtotal, discountAmount, amount: subtotal - discountAmount, couponCode: coupon.code };
}
