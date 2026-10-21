import { describe, expect, it } from "vitest";
import { calculatePrice, type CouponRule } from "@/lib/coupons/pricing";

const plan = { slug: "premium-pro", price: 49 };
const coupon: CouponRule = {
  code: "SAVE10", kind: "percent", value: 10, active: true,
  minAmount: 0, planSlug: null, expiresAt: null,
};
describe("coupon pricing", () => {
  it("keeps the regular price without a coupon", () => {
    expect(calculatePrice(plan, null)).toEqual({ subtotal: 49, amount: 49, discountAmount: 0, couponCode: null });
  });
  it("rounds percentage savings down to whole rupees", () => {
    expect(calculatePrice(plan, coupon)).toEqual({ subtotal: 49, amount: 45, discountAmount: 4, couponCode: "SAVE10" });
  });
  it("supports fixed-rupee discounts", () => {
    expect(calculatePrice(plan, { ...coupon, kind: "fixed", value: 9 }).amount).toBe(40);
  });
  it("rejects disabled and expired codes, including the exact expiry time", () => {
    expect(() => calculatePrice(plan, { ...coupon, active: false })).toThrow("inactive");
    const now = new Date("2026-10-20T12:00:00Z");
    expect(() => calculatePrice(plan, { ...coupon, expiresAt: now }, now)).toThrow("expired");
  });
  it("enforces plan eligibility and minimum price", () => {
    expect(() => calculatePrice(plan, { ...coupon, planSlug: "premium" })).toThrow("this plan");
    expect(() => calculatePrice(plan, { ...coupon, minAmount: 50 })).toThrow("minimum");
    expect(calculatePrice(plan, { ...coupon, minAmount: 49 }).amount).toBe(45);
  });
  it("rejects free, negative, and rounded-to-zero discounts", () => {
    for (const value of [49, 50, -1, 0]) {
      expect(() => calculatePrice(plan, { ...coupon, kind: "fixed", value })).toThrow();
    }
    expect(() => calculatePrice({ ...plan, price: 19 }, { ...coupon, value: 1 })).toThrow();
  });
});
