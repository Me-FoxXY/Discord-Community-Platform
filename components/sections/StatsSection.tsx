import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { stats } from "@/config/content";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const chips = [
  "bg-mint-100 text-mint-600",
  "bg-sky-100 text-sky-600",
  "bg-teal-100 text-teal-600",
  "bg-violet-100 text-violet-600",
  "bg-forest-100 text-forest-600",
  "bg-amber-100 text-amber-600",
];

export function StatsSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={
            <>
              <BarChart3 className="h-3.5 w-3.5" /> By the numbers
            </>
          }
          title="A thriving, living community"
          subtitle="Real momentum, real people. Here's how the Verdanta forest has grown."
        />

        <StaggerGroup className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StaggerItem key={s.key}>
              <Card className="h-full text-center transition-shadow duration-300 hover:shadow-card">
                <div
                  className={cn(
                    "mx-auto grid h-12 w-12 place-items-center rounded-2xl",
                    chips[i % chips.length],
                  )}
                >
                  <Icon name={s.icon} className="h-6 w-6" />
                </div>
                <div className="mt-4 font-display text-3xl font-semibold text-forest-950 sm:text-4xl">
                  <AnimatedCounter value={s.value} compact={s.compact} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-sm text-ink-soft">{s.label}</div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
