import { Hero } from "@/components/sections/Hero";
import { AboutSection } from "@/components/sections/AboutSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { WhyJoinSection } from "@/components/sections/WhyJoinSection";
import { PricingPreview } from "@/components/sections/PricingPreview";
import { ShowcaseSection } from "@/components/sections/ShowcaseSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { site } from "@/config/site";
import { listProducts } from "@/lib/catalog";
export const dynamic = "force-dynamic";

export default async function Home() {
  const plans = await listProducts();
  // Organization + Product structured data for SEO.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    description: site.description,
    url: site.url,
    sameAs: site.socials.map((s) => s.href),
    makesOffer: plans.map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: p.price,
      priceCurrency: "INR",
      url: `${site.url}/shop/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <AboutSection />
      <StatsSection />
      <WhyJoinSection />
      <PricingPreview plans={plans} />
      <ShowcaseSection />
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
