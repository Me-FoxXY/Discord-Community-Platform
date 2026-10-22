import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPlan } from "@/lib/catalog";
import { Container } from "@/components/ui/Container";
import { CheckoutFlow } from "@/components/shop/CheckoutFlow";
import { GradientBlobs } from "@/components/decor/nature";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: slug } = await searchParams;
  const plan = slug ? await getPlan(slug) : undefined;
  if (!plan) redirect("/shop");

  // Middleware already guards this route, but re-check for safety.
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/checkout?plan=${plan.slug}`);

  return (
    <main className="relative min-h-dvh overflow-hidden pb-24 pt-32 sm:pt-36">
      <GradientBlobs />
      <Container className="max-w-5xl">
        <h1 className="text-3xl text-forest-950 sm:text-4xl">Checkout</h1>
        <p className="mt-2 text-ink-soft">Secure UPI payment — perks delivered after verification.</p>
        <div className="mt-10">
          <CheckoutFlow plan={plan} username={session.user.name ?? "your account"} />
        </div>
      </Container>
    </main>
  );
}
