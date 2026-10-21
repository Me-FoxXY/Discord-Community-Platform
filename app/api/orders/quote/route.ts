import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkoutSchema, quoteOrder } from "@/lib/coupons/quote";
import { CouponError } from "@/lib/coupons/pricing";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.discordId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid coupon request." }, { status: 400 });
  try {
    const { plan: _plan, ...price } = await quoteOrder(parsed.data);
    return NextResponse.json(price);
  } catch (error) {
    if (error instanceof CouponError) return NextResponse.json({ error: error.message }, { status: 400 });
    throw error;
  }
}
