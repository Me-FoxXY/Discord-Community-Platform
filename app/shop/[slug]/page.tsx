import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlan, listProducts } from "@/lib/catalog";
export const dynamic = "force-dynamic";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Accordion } from "@/components/ui/Accordion";
import { PricingCard } from "@/components/shop/PricingCard";
import { HowItWorks } from "@/components/shop/HowItWorks";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GradientBlobs } from "@/components/decor/nature";
import { formatINR } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, Clock, ShieldCheck, Sparkles } from "lucide-react";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const plan = await getPlan(slug);
  if (!plan) return { title: "Plan not found" };
  return {
    title: `${plan.name} — ${formatINR(plan.price)} / ${plan.durationLabel}`,
    description: plan.description,
    alternates: { canonical: `/shop/${plan.slug}` },
    openGraph: {
      title: `${plan.name} · ${site.name}`,
      description: plan.description,
      url: `${site.url}/shop/${plan.slug}`,
    },
  };
}

export default async function PlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = await getPlan(slug);
  if (!plan) notFound();

  const related = (await listProducts()).filter((p) => p.slug !== slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${site.name} ${plan.name}`,
    description: plan.description,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: plan.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${site.url}/shop/${plan.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <section className="relative overflow-hidden pb-12 pt-32 sm:pt-40">
        <GradientBlobs />
        <Container>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-600 transition-colors hover:text-forest-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to shop
          </Link>

          <div className="mt-6 grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/80 text-3xl shadow-soft">
                  {plan.emoji}
                </span>
                {plan.popular && <Badge tone="forest">⭐ Most Popular</Badge>}
                {plan.flagship && <Badge tone="violet">Flagship</Badge>}
              </div>

              <h1 className="mt-5 text-4xl leading-tight text-forest-950 sm:text-5xl">{plan.name}</h1>
              <p className="mt-3 text-lg text-ink-soft">{plan.tagline}</p>

              <div className="mt-6 flex items-end gap-2">
                <span className="font-display text-5xl font-semibold text-forest-950">
                  {formatINR(plan.price)}
                </span>
                <span className="mb-1.5 text-ink-soft">/ {plan.durationLabel}</span>
              </div>

              <p className="mt-6 max-w-xl text-pretty leading-relaxed text-ink-soft">{plan.description}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={`/checkout?plan=${plan.slug}`} variant="primary" size="lg">
                  Get {plan.name} <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/shop" variant="outline" size="lg">
                  Compare plans
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-forest-500" /> Secure checkout
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-forest-500" /> Delivered within 24h
                </span>
              </div>
            </Reveal>

            {/* Card */}
            <Reveal delay={0.1}>
              <div className="lg:sticky lg:top-28">
                <PricingCard plan={plan} featured={plan.popular || plan.flagship} />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Benefits & features */}
      <section className="py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeading align="left" eyebrow="What you get" title="Benefits" />
              <ul className="mt-6 space-y-4">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-mint-100 text-mint-600">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="leading-relaxed text-forest-800">{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.05}>
              <SectionHeading align="left" eyebrow="Included" title="Features" />
              <StaggerGroup className="mt-6 grid gap-3">
                {plan.features.map((f) => (
                  <StaggerItem key={f.label}>
                    <div className="flex items-center gap-3 rounded-2xl border border-forest-100/70 bg-white/70 p-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-600">
                        <Icon name={f.icon} className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-medium text-forest-900">{f.label}</span>
                      {f.highlight && <Sparkles className="ml-auto h-4 w-4 text-amber-400" />}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Eligibility & delivery */}
      <section className="py-8">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <Card className="h-full">
                <h3 className="font-display text-xl font-semibold text-forest-950">Eligibility</h3>
                <ul className="mt-4 space-y-3">
                  {plan.eligibility.map((e) => (
                    <li key={e} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" strokeWidth={3} />
                      {e}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
            <Reveal delay={0.05}>
              <Card className="h-full bg-mist">
                <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-forest-950">
                  <Clock className="h-5 w-5 text-forest-500" /> Delivery timeline
                </h3>
                <p className="mt-4 leading-relaxed text-ink-soft">{plan.deliveryTimeline}</p>
              </Card>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Purchase flow */}
      <section className="py-16">
        <Container>
          <HowItWorks />
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-8">
        <Container className="max-w-3xl">
          <SectionHeading title={`${plan.name} — FAQ`} />
          <Reveal className="mt-10">
            <div className="rounded-5xl border border-forest-100/70 bg-white/80 px-6 py-2 shadow-soft sm:px-8">
              <Accordion items={plan.faq} />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Related plans */}
      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="Keep exploring" title="Related plans" />
          <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-6 sm:grid-cols-2">
            {related.map((p) => (
              <PricingCard key={p.slug} plan={p} featured={p.popular} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
