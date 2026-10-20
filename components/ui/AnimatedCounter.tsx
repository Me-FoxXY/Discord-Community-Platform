"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  /** Render "12.5K" style compact form for large numbers. */
  compact?: boolean;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

function format(n: number, compact: boolean, decimals: number) {
  if (compact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(n);
}

/** Counts up to `value` the first time it scrolls into view. */
export function AnimatedCounter({
  value,
  compact = false,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(() => format(0, compact, decimals));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(format(value, compact, decimals));
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(format(latest, compact, decimals)),
    });
    return () => controls.stop();
  }, [inView, value, compact, decimals, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
