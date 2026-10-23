import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { PricingCard } from "@/components/shop/PricingCard";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GradientBlobs } from "@/components/decor/nature";
import type { Plan } from "@/config/plans";
import { Crown, ShieldCheck, Clock } from "lucide-react";

export function PricingPreview({ plans }: { plans: Plan[] }) {
  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <GradientBlobs />
      <Container>
        <SectionHeading
          eyebrow={
            <>
              <Crown className="h-3.5 w-3.5" /> Premium plans
            </>
          }
          title="Stand out with premium perks"
          subtitle="Personal roles, bonus XP, soundboard powers, and your own voice channel. Pick the plan that fits your vibe."
        />

        <StaggerGroup className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.length === 0 && <p role="status" className="col-span-full rounded-2xl bg-white/80 p-8 text-center text-ink-soft">No products are available right now. Please check back soon.</p>}
          {plans.map((p) => (
            <StaggerItem key={p.slug} className="h-full">
              <PricingCard plan={p} featured={p.popular} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-12 flex flex-col items-center gap-5">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-forest-500" /> Duration shown on each product
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-forest-500" /> Verified & secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-forest-500" /> Instant support
            </span>
          </div>
          <Button href="/shop" variant="outline" size="lg">
            Compare all plans
          </Button>
        </div>
      </Container>
    </section>
  );
}
