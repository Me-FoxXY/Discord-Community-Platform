import type { Metadata } from "next";
import { listPending, listRecent } from "@/lib/orders/store";
import { Container } from "@/components/ui/Container";
import { GradientBlobs } from "@/components/decor/nature";
import { AdminBoard, type AdminOrderDTO } from "@/components/admin/AdminBoard";
import { ShieldCheck } from "lucide-react";
import type { Order } from "@prisma/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/CouponManager";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function toDTO(o: Order): AdminOrderDTO {
  return {
    id: o.id,
    status: o.status,
    deliveryStatus: o.deliveryStatus,
    deliveryError: o.deliveryError,
    planName: o.planName,
    amount: o.amount,
    subtotal: o.subtotal,
    discountAmount: o.discountAmount,
    couponCode: o.couponCode,
    note: o.note,
    utr: o.utr,
    duplicateFlag: o.duplicateFlag,
    discordUsername: o.discordUsername,
    discordUserId: o.discordUserId,
    hasScreenshot: Boolean(o.screenshotPath),
    createdAt: o.createdAt.toISOString(),
  };
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/login");
  const [pending, recent] = await Promise.all([listPending(), listRecent(50)]);
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="relative min-h-dvh overflow-hidden pb-24 pt-32 sm:pt-36">
      <GradientBlobs />
      <Container className="max-w-4xl">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-grad text-white shadow-soft">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl text-forest-950">Verification dashboard</h1>
            <p className="text-sm text-ink-soft">Review payments and grant perks. Approve only what you can verify.</p>
          </div>
        </div>

        <div className="mt-10">
          <AdminBoard initialPending={pending.map(toDTO)} initialRecent={recent.map(toDTO)} />
          <CouponManager initial={coupons.map((coupon) => ({ ...coupon, expiresAt: coupon.expiresAt?.toISOString() ?? null, createdAt: undefined }))} />
        </div>
      </Container>
    </main>
  );
}
