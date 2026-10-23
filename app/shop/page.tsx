import type { Metadata } from "next";
import { currentServer, serverPath } from "@/lib/servers/context";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricingCard } from "@/components/shop/PricingCard";
import { ComparisonTable } from "@/components/shop/ComparisonTable";
import { HowItWorks } from "@/components/shop/HowItWorks";
import { FaqSection } from "@/components/sections/FaqSection";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { listProducts } from "@/lib/catalog";
export const dynamic = "force-dynamic";
import { site } from "@/config/site";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Premium Shop",
  description:
    "Browse Verdanta premium Discord perks — personal roles, bonus XP, soundboard, and voice channels.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const community = await currentServer();
  const shopPath = await serverPath("/shop");
  const plans = await listProducts();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: plans.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `${community.name} ${p.name}`,
        description: p.description,
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "INR",
          url: `${site.url}${shopPath}/${p.slug}`,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <PageHeader
        eyebrow={
          <>
            <ShoppingBag className="h-3.5 w-3.5" /> Premium shop
          </>
        }
        title={
          <>
            Choose your <span className="text-gradient">{community.name}</span>{" "}
            perk
          </>
        }
        subtitle="Explore the products and perks available for your community."
      />

      <section className="relative pb-8">
        <Container>
          <StaggerGroup className="grid items-stretch gap-6 lg:grid-cols-3">
            {plans.length === 0 && (
              <p
                role="status"
                className="col-span-full rounded-2xl bg-white/80 p-8 text-center text-ink-soft"
              >
                No products are available right now. Please check back soon.
              </p>
            )}
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
          <SectionHeading
            title="Compare every plan"
            subtitle="See exactly what you get at each tier."
          />
          <div className="mt-12">
            <ComparisonTable plans={plans} />
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
