import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { testimonials, type Testimonial } from "@/config/content";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const avatarBg: Record<Testimonial["accent"], string> = {
  mint: "bg-mint-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  forest: "bg-forest-500",
};

export function TestimonialsSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={
            <>
              <Star className="h-3.5 w-3.5" /> Member love
            </>
          }
          title="Kind words from the community"
          subtitle="We asked members what keeps them coming back. Here's what they told us."
        />

        <StaggerGroup className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.name} className="h-full">
              <figure className="flex h-full flex-col rounded-4xl border border-forest-100/70 bg-white/80 p-6 shadow-soft backdrop-blur transition-shadow duration-300 hover:shadow-card">
                <Quote className="h-7 w-7 text-mint-300" />
                <div className="mt-3 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("h-4 w-4", i < t.rating ? "fill-amber-400 text-amber-400" : "text-forest-200")}
                    />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-pretty leading-relaxed text-forest-800">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-forest-100 pt-4">
                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white",
                      avatarBg[t.accent],
                    )}
                  >
                    {t.initials}
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-forest-900">{t.name}</div>
                    <div className="text-xs text-ink-soft">
                      {t.handle} · {t.role}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
