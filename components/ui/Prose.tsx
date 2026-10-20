import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Lightweight typography wrapper for legal / long-form content. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 leading-relaxed text-ink-soft",
        "[&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-forest-900",
        "[&_p]:text-pretty",
        "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
        "[&_a]:font-medium [&_a]:text-forest-600 [&_a]:underline",
        "[&_strong]:text-forest-800",
        className,
      )}
    >
      {children}
    </div>
  );
}
