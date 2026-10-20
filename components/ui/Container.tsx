import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export function Container({ className, children, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("container-px mx-auto w-full max-w-7xl", className)} {...props}>
      {children}
    </div>
  );
}
