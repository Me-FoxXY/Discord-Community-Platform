import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export function Card({ className, children, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-4xl border border-forest-100/70 bg-white/80 p-6 shadow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCard({ className, children, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("glass rounded-4xl p-6 shadow-soft", className)} {...props}>
      {children}
    </div>
  );
}
