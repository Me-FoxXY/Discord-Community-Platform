"use client";

import useSWR from "swr";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { DiscordIcon } from "@/components/icons/brands";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { LiveMemberCount } from "@/components/community/LiveMemberCount";
import { FloatingLeaves } from "@/components/decor/nature";
import { heroStats } from "@/config/content";
import { site } from "@/config/site";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-16 pt-32 sm:pt-40">
      <FloatingLeaves />
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <motion.div
            variants={staggerContainer(0.12, 0.05)}
            initial={false}
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white/70 px-4 py-1.5 text-sm shadow-soft backdrop-blur">
                <LiveMemberCount />
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mt-6 text-balance text-5xl leading-[1.03] text-forest-950 sm:text-6xl lg:text-7xl"
            >
              A greener place to <span className="text-gradient">belong</span> on Discord.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft"
            >
              {site.shortPitch}
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-3">
              <Button href={site.discordInvite} variant="primary" size="lg">
                <DiscordIcon className="h-5 w-5" /> Join Discord
              </Button>
              <Button href="/shop" variant="glass" size="lg">
                Browse Premium Plans
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {heroStats.map((s) => (
                <div key={s.key}>
                  <div className="font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
                    <AnimatedCounter value={s.value} compact={s.compact} suffix={s.suffix ?? "+"} />
                  </div>
                  <div className="mt-1 text-sm text-ink-soft">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Media — the provided GIF banner */}
          <HeroBanner reduce={!!reduce} />
        </div>
      </Container>
    </section>
  );
}

function HeroBanner({ reduce }: { reduce: boolean }) {
  const { data } = useSWR<{url: string | null; staticUrl?: string | null}>("/api/discord/banner", async url => { const response = await fetch(url); if (!response.ok) throw new Error("Banner unavailable"); return response.json(); }, { refreshInterval: 300000, revalidateOnFocus: false, shouldRetryOnError: false });
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const source = (reduce ? data?.staticUrl : data?.url) ?? null;
  const floatA = reduce
    ? {}
    : { animate: { y: [0, -10, 0] }, transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const } };
  const floatB = reduce
    ? {}
    : { animate: { y: [0, 12, 0] }, transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div aria-hidden className="absolute -inset-6 -z-10 rounded-[3rem] bg-river opacity-25 blur-3xl" />

      <div className="relative overflow-hidden rounded-5xl border border-white/60 bg-white/40 p-2.5 shadow-glow backdrop-blur">
        {!source || failedUrl === source ? (
          <div className="grid aspect-[4/3] w-full place-items-center rounded-[2rem] bg-river p-8 text-center"><span className="font-display text-3xl font-semibold text-white drop-shadow">Your community, your space.</span></div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={source}
            onError={() => setFailedUrl(source)}
            fetchPriority="high"
            alt=""
            aria-hidden
            className="aspect-[4/3] w-full rounded-[2rem] object-cover"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-2.5 rounded-[2rem] ring-1 ring-inset ring-white/30 [background:linear-gradient(180deg,transparent_55%,rgba(15,42,29,0.28))]"
        />
      </div>

      <motion.div
        {...floatA}
        className="absolute -left-4 top-8 flex items-center gap-2 rounded-2xl glass px-3.5 py-2.5 shadow-card sm:-left-6"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-grad text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-bold text-forest-900">
            <AnimatedCounter value={24800} compact suffix="+" />
          </div>
          <div className="text-xs text-ink-soft">happy members</div>
        </div>
      </motion.div>

      <motion.div
        {...floatB}
        className="absolute -right-3 bottom-8 flex items-center gap-2 rounded-2xl glass px-3.5 py-2.5 shadow-card sm:-right-5"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--grad-gold)] text-forest-950">
          <Star className="h-4 w-4 fill-current" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-bold text-forest-900">4.9 / 5</div>
          <div className="text-xs text-ink-soft">member rating</div>
        </div>
      </motion.div>
    </div>
  );
}
