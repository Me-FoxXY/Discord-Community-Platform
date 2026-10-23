import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LiveMemberCount } from "@/components/community/LiveMemberCount";
import { TopographyLines } from "@/components/decor/nature";
import { aboutParagraphs, aboutValues } from "@/config/content";
import { Check, Leaf, Sparkles, Users } from "lucide-react";

export function AboutSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-forest-600">
              <Leaf className="h-3.5 w-3.5" /> Our community
            </span>
            <h2 className="mt-4 text-balance text-3xl leading-tight text-forest-950 sm:text-4xl md:text-5xl">
              More than a server — a little wilderness of our own.
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-soft">
              {aboutParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {aboutValues.map((v) => (
                <li key={v} className="flex items-center gap-2.5 text-sm font-medium text-forest-800">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-mint-100 text-mint-600">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {v}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Visual */}
          <Reveal delay={0.1}>
            <div className="relative">
              <div aria-hidden className="absolute -inset-4 -z-10 rounded-[3rem] bg-meadow opacity-70 blur-2xl" />
              <div className="relative overflow-hidden rounded-5xl bg-meadow p-8 shadow-card sm:p-10">
                <TopographyLines className="opacity-40" />
                <div className="relative flex h-full flex-col items-center justify-center py-10 text-center">
                  <span className="grid h-20 w-20 place-items-center rounded-4xl bg-white/70 text-4xl shadow-soft backdrop-blur">
                    🌿
                  </span>
                  <p className="mt-6 max-w-xs font-display text-2xl text-forest-900">
                    &ldquo;It feels less like a server and more like a treehouse.&rdquo;
                  </p>
                  <p className="mt-2 text-sm text-forest-700">A space to make your own</p>
                </div>
              </div>

              {/* Floating stat pills */}
              <div className="absolute -left-3 top-6 flex items-center gap-2 rounded-2xl bg-white/85 px-3.5 py-2.5 shadow-card backdrop-blur sm:-left-6">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-grad text-white">
                  <Users className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-bold text-forest-900">
                    <LiveMemberCount />
                  </div>
                  <div className="text-xs text-ink-soft">On Discord</div>
                </div>
              </div>
              <div className="absolute -right-2 bottom-8 flex items-center gap-2 rounded-2xl bg-white/85 px-3.5 py-2.5 shadow-card backdrop-blur sm:-right-5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--grad-gold)] text-forest-950">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-bold text-forest-900">
                    A place to belong
                  </div>
                  <div className="text-xs text-ink-soft">growing strong</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
