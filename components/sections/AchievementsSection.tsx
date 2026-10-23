import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { TopographyLines } from "@/components/decor/nature";
import { achievements } from "@/config/content";

export function AchievementsSection() {
  if (!achievements.length) return null;
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-5xl bg-forest-grad p-8 shadow-card sm:p-12">
          <TopographyLines className="text-white/10" />
          <div className="relative">
            <h2 className="max-w-lg text-3xl text-white sm:text-4xl">
              Four years of growing, together
            </h2>
            <p className="mt-3 max-w-xl text-mint-50/80">
              Milestones we&apos;ve reached as a community — every number is a real person who showed up.
            </p>
            <StaggerGroup className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {achievements.map((a) => (
                <StaggerItem key={a.label}>
                  <div className="text-center sm:text-left">
                    <span className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-white">
                      <Icon name={a.icon} className="h-5 w-5" />
                    </span>
                    <div className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                      <AnimatedCounter value={a.value} compact={a.compact} suffix={a.suffix} />
                    </div>
                    <div className="mt-1 text-sm text-mint-50/70">{a.label}</div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </Container>
    </section>
  );
}
