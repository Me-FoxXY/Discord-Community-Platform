import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { events, type CommunityEvent } from "@/config/content";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const accentChip: Record<CommunityEvent["accent"], string> = {
  mint: "bg-mint-100 text-mint-600",
  sky: "bg-sky-100 text-sky-600",
  violet: "bg-violet-100 text-violet-600",
  forest: "bg-forest-100 text-forest-600",
};

export function EventsSection() {
  if (!events.length) return null;
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={
            <>
              <CalendarDays className="h-3.5 w-3.5" /> What&apos;s happening
            </>
          }
          title="A calendar that's always full"
          subtitle="From game nights to seasonal festivals, there's always a reason to hop in."
        />

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2">
          {events.map((e) => (
            <StaggerItem key={e.title}>
              <div className="flex h-full items-start gap-4 rounded-4xl border border-forest-100/70 bg-white/80 p-6 shadow-soft transition-shadow duration-300 hover:shadow-card">
                <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", accentChip[e.accent])}>
                  <Icon name={e.icon} className="h-6 w-6" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-forest-950">{e.title}</h3>
                    <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-600">
                      {e.when}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{e.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
