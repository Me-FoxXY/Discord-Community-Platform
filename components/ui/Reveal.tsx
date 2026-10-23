"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeInUp, inViewport, staggerContainer } from "@/lib/motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
};

/** Fades + rises content into view once, respecting reduced-motion. */
export function Reveal({ children, className, variants = fadeInUp, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial={false}
      whileInView="visible"
      viewport={inViewport}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers its <StaggerItem/> children into view. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.09,
  delayChildren = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerContainer(stagger, delayChildren)}
      initial={false}
      whileInView="visible"
      viewport={inViewport}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variants = fadeInUp,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
