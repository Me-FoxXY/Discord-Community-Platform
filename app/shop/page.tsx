import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricingCard } from "@/components/shop/PricingCard";
import { ComparisonTable } from "@/components/shop/ComparisonTable";
import { HowItWorks } from "@/components/shop/HowItWorks";
import { FaqSection } from "@/components/sections/FaqSection";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { plans } from "@/config/plans";
import { site } from "@/config/site";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Premium Shop",
  description: "Browse Verdanta premium Discord perks — personal roles, bonus XP, soundboard, and voice channels.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: plans.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `${site.name} ${p.name}`,
        description: p.description,
        offers: { "@type": "Offer", price: p.price, priceCurrency: "INR", url: `${site.url}/shop/${p.slug}` },
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader
        eyebrow={
          <>
            <ShoppingBag className="h-3.5 w-3.5" /> Premium shop
          </>
        }
        title={
          <>
            Choose your <span className="text-gradient">Verdanta</span> perk
          </>
        }
        subtitle="Three tiers, one goal — help you stand out and level up in the community you love."
      />

      <section className="relative pb-8">
        <Container>
          <StaggerGroup className="grid items-stretch gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <StaggerItem key={p.slug} className="h-full">
                <PricingCard plan={p} featured={p.popular} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading title="Compare every plan" subtitle="See exactly what you get at each tier." />
          <div className="mt-12">
            <ComparisonTable />
          </div>
        </Container>
      </section>

      <section className="py-4">
        <Container>
          <HowItWorks />
        </Container>
      </section>

      <FaqSection />
    </>
  );
}
