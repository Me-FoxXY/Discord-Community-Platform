import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { AboutSection } from "@/components/sections/AboutSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { StaffSection } from "@/components/sections/StaffSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { ShowcaseSection } from "@/components/sections/ShowcaseSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { DiscordIcon } from "@/components/icons/brands";
import { site } from "@/config/site";
import { Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "Community",
  description: `Meet the ${site.name} community — our team, events, highlights, and the members who make it home.`,
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Leaf className="h-3.5 w-3.5" /> Community
          </>
        }
        title={
          <>
            The heart of <span className="text-gradient">Verdanta</span>
          </>
        }
        subtitle="A welcoming forest of gamers, creators, and friends. Get to know the people, the events, and the culture."
      >
        <Button href={site.discordInvite} variant="primary" size="lg">
          <DiscordIcon className="h-5 w-5" /> Join the community
        </Button>
      </PageHeader>

      <AboutSection />
      <AchievementsSection />
      <StaffSection />
      <EventsSection />
      <ShowcaseSection />
      <TestimonialsSection />
    </>
  );
}
