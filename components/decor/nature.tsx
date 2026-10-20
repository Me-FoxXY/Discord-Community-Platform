import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";

/** Soft drifting aurora blobs — the signature ambient glow. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <div className="animate-aurora absolute -left-24 -top-28 h-[26rem] w-[26rem] rounded-full bg-mint-300/45 blur-3xl" />
      <div className="animate-aurora absolute right-[-6rem] top-6 h-[30rem] w-[30rem] rounded-full bg-sky-300/35 blur-3xl [animation-delay:-6s]" />
      <div className="animate-aurora absolute bottom-[-8rem] left-1/3 h-[24rem] w-[24rem] rounded-full bg-forest-300/35 blur-3xl [animation-delay:-12s]" />
    </div>
  );
}

/** Decorative blurred gradient orbs to accent a section. */
export function GradientBlobs({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      <div className="absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-teal-300/30 blur-2xl" />
      <div className="absolute right-[10%] top-[40%] h-56 w-56 rounded-full bg-mint-300/30 blur-2xl" />
      <div className="absolute bottom-[8%] left-[40%] h-44 w-44 rounded-full bg-sky-200/40 blur-2xl" />
    </div>
  );
}

/** A warm sun-glow gradient, top-right by default. */
export function SunRays({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 bg-[var(--grad-sun)]", className)}
    />
  );
}

/** Floating leaves that gently bob. */
export function FloatingLeaves({ className }: { className?: string }) {
  const leaves = [
    { top: "12%", left: "6%", size: 26, rot: -20, delay: "0s", color: "text-forest-400/40" },
    { top: "24%", left: "88%", size: 34, rot: 30, delay: "-2s", color: "text-mint-500/40" },
    { top: "68%", left: "12%", size: 22, rot: 12, delay: "-4s", color: "text-sage-500/40" },
    { top: "78%", left: "82%", size: 30, rot: -35, delay: "-1.5s", color: "text-teal-400/40" },
    { top: "48%", left: "48%", size: 18, rot: 8, delay: "-3.5s", color: "text-forest-300/40" },
  ];
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {leaves.map((l, i) => (
        <Leaf
          key={i}
          className={cn("animate-float absolute", l.color)}
          style={{
            top: l.top,
            left: l.left,
            width: l.size,
            height: l.size,
            transform: `rotate(${l.rot}deg)`,
            animationDelay: l.delay,
          }}
        />
      ))}
    </div>
  );
}

/** Subtle topographic contour lines evoking a landscape map. */
export function TopographyLines({ className }: { className?: string }) {
  const lines = 10;
  const width = 1200;
  const gap = 34;
  const height = 40 + lines * gap;
  const seg = 6;

  const paths = Array.from({ length: lines }, (_, i) => {
    const y = 30 + i * gap;
    const amp = 10 + (i % 4) * 5;
    let d = `M0 ${y}`;
    for (let s = 1; s <= seg; s++) {
      const x = (width / seg) * s;
      const cx = x - width / seg / 2;
      const cy = y + (s % 2 === 0 ? amp : -amp);
      d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)}, ${x.toFixed(1)} ${y}`;
    }
    return d;
  });

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-0 -z-10 h-full w-full text-forest-300/30", className)}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth={1.2} />
      ))}
    </svg>
  );
}

/** Composite full-page nature backdrop used behind hero / page sections. */
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-mist">
      <AuroraBackground />
      <SunRays />
      <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-60">
        <TopographyLines />
      </div>
    </div>
  );
}
