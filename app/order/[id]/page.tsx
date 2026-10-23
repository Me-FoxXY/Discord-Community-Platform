import { requireAccess } from "@/lib/servers/access";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrder } from "@/lib/orders/store";
import { Container } from "@/components/ui/Container";
import { GradientBlobs } from "@/components/decor/nature";
import {
  OrderStatusView,
  type OrderDTO,
} from "@/components/order/OrderStatusView";

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const order = await getOrder(id);

  if (!order) notFound();
  const isOwner = session?.user?.discordId === order.discordUserId;
  if (!isOwner) {
    try {
      await requireAccess("review", order.serverId, true);
    } catch {
      notFound();
    }
  }

  const dto: OrderDTO = {
    id: order.id,
    status: order.status as OrderDTO["status"],
    deliveryStatus: order.deliveryStatus,
    planName: order.planName,
    amount: order.amount,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    couponCode: order.couponCode,
    note: order.note,
    utr: order.utr,
    reviewNote: order.reviewNote,
    createdAt: order.createdAt.toISOString(),
  };

  return (
    <main className="relative min-h-dvh overflow-hidden pb-24 pt-32 sm:pt-40">
      <GradientBlobs />
      <Container>
        <OrderStatusView initial={dto} />
      </Container>
    </main>
  );
}
