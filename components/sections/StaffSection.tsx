import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { staff, type StaffMember } from "@/config/content";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

const accentBg: Record<StaffMember["accent"], string> = {
  mint: "bg-mint-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  forest: "bg-forest-500",
};

export function StaffSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={
            <>
              <Users className="h-3.5 w-3.5" /> The team
            </>
          }
          title="Meet the folks who keep it green"
          subtitle="A friendly, dedicated crew making sure Verdanta stays welcoming, safe, and fun."
        />

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((m) => (
            <StaggerItem key={m.name}>
              <div className="group flex h-full items-start gap-4 rounded-4xl border border-forest-100/70 bg-white/80 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <span
                  className={cn(
                    "grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white shadow-soft transition-transform duration-300 group-hover:scale-105",
                    accentBg[m.accent],
                  )}
                >
                  {m.initials}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-forest-950">{m.name}</h3>
                  <p className="text-sm font-medium text-forest-600">{m.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.blurb}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
