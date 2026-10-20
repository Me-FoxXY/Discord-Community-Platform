import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { whyJoin } from "@/config/content";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const chips = [
  "bg-mint-100 text-mint-600",
  "bg-sky-100 text-sky-600",
  "bg-teal-100 text-teal-600",
  "bg-violet-100 text-violet-600",
  "bg-forest-100 text-forest-600",
  "bg-amber-100 text-amber-600",
];

export function WhyJoinSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={
            <>
              <Heart className="h-3.5 w-3.5" /> Why join us
            </>
          }
          title="Everything you'd want in a community"
          subtitle="A friendly crowd, an active team, and a calendar full of things to do — all in one welcoming place."
        />

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyJoin.map((f, i) => (
            <StaggerItem key={f.title}>
              <div className="group h-full rounded-4xl border border-forest-100/70 bg-white/80 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <div
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
                    chips[i % chips.length],
                  )}
                >
                  <Icon name={f.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-forest-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
