import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "mint" | "forest" | "sky" | "gold" | "glass" | "violet";

const tones: Record<Tone, string> = {
  mint: "bg-mint-100 text-mint-800 border-mint-200",
  forest: "bg-forest-100 text-forest-800 border-forest-200",
  sky: "bg-sky-100 text-sky-800 border-sky-200",
  gold: "bg-amber-100 text-amber-800 border-amber-200",
  violet: "bg-violet-100 text-violet-800 border-violet-200",
  glass: "glass text-forest-800",
};

export function Badge({
  children,
  tone = "mint",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Diagonal corner ribbon used on the featured plan. */
export function Ribbon({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute -right-12 top-6 z-20 rotate-45">
      <div className="bg-forest-grad px-12 py-1.5 text-center text-xs font-bold uppercase tracking-widest text-white shadow-soft">
        {children}
      </div>
    </div>
  );
}
