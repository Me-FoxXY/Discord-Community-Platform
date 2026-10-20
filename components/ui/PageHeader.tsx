import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { GradientBlobs } from "@/components/decor/nature";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-8 pt-32 sm:pt-40">
      <GradientBlobs />
      <Container className="max-w-3xl text-center">
        <Reveal>
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest-600 shadow-soft">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="mt-5 text-balance text-4xl leading-tight text-forest-950 sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft">
              {subtitle}
            </p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </Reveal>
      </Container>
    </section>
  );
}
