import { CommunityLink as Link } from "@/components/servers/Community";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "river" | "glass" | "outline" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest-grad text-white shadow-soft hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0",
  river:
    "bg-river text-white shadow-soft hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0",
  gold: "bg-[var(--grad-gold)] text-forest-950 shadow-soft hover:shadow-glow hover:-translate-y-0.5",
  glass:
    "glass text-forest-800 shadow-soft hover:bg-white/85 hover:-translate-y-0.5",
  outline:
    "border border-forest-200 bg-white/60 text-forest-800 hover:border-forest-400 hover:bg-white hover:-translate-y-0.5",
  ghost: "text-forest-700 hover:bg-forest-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = BaseProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };
type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<"a">, "href"> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const {
      variant: _v,
      size: _s,
      className: _c,
      children: _ch,
      href,
      ...rest
    } = props;
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    ...rest
  } = props;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
