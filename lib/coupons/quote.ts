import { currentServerId } from "@/lib/servers/context";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/catalog";
import { calculatePrice, CouponError } from "./pricing";

export const checkoutSchema = z.object({
  planSlug: z.string().min(1).max(80),
  couponCode: z.string().trim().max(32).optional(),
});

export async function quoteOrder(input: z.infer<typeof checkoutSchema>) {
  const plan = await getPlan(input.planSlug);
  if (!plan) throw new CouponError("Unknown plan.");
  const code = input.couponCode?.trim().toUpperCase();
  const coupon = code
    ? await prisma.coupon.findUnique({
        where: { serverId_code: { serverId: await currentServerId(), code } },
      })
    : null;
  if (code && !coupon) throw new CouponError("Coupon code not found.");
  return { plan, ...calculatePrice(plan, coupon) };
}
