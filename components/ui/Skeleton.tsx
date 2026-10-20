import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-forest-100/60", className)}>
      <div className="shimmer absolute inset-0" />
    </div>
  );
}
