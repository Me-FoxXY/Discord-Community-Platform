import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { showcaseTiles } from "@/config/content";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function spanClass(span?: "tall" | "wide") {
  if (span === "tall") return "row-span-2";
  if (span === "wide") return "sm:col-span-2";
  return "";
}

export function ShowcaseSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={
            <>
              <ImageIcon className="h-3.5 w-3.5" /> Community showcase
            </>
          }
          title="Peek inside the forest"
          subtitle="Game nights, art drops, voice lounges, and seasonal events — there's always something growing."
        />

        <StaggerGroup className="mt-14 grid grid-cols-2 gap-4 sm:auto-rows-[190px] lg:grid-cols-4">
          {showcaseTiles.map((t) => (
            <StaggerItem key={t.title} className={cn("group", spanClass(t.span))}>
              <div className={cn("relative h-full min-h-[190px] overflow-hidden rounded-4xl p-5 shadow-card", t.gradient)}>
                {/* legibility scrim */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,rgba(15,42,29,0.05)_0%,rgba(15,42,29,0.55)_100%)]"
                />
                <div className="relative flex h-full flex-col justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/25 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                    <Icon name={t.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white drop-shadow">{t.title}</h3>
                    <p className="mt-1 text-sm text-white/85 drop-shadow">{t.caption}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
