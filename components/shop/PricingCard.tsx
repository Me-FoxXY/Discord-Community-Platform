import { CommunityLink as Link } from "@/components/servers/Community";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import type { Plan, PlanAccent } from "@/config/plans";
import { Button } from "@/components/ui/Button";
import { Ribbon } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { formatINR, cn } from "@/lib/utils";

const accents: Record<
  PlanAccent,
  {
    grad: string;
    chip: string;
    icon: string;
    btn: "primary" | "river" | "gold";
  }
> = {
  mint: {
    grad: "from-mint-400 to-forest-500",
    chip: "bg-mint-100 text-mint-700",
    icon: "text-mint-600",
    btn: "primary",
  },
  sky: {
    grad: "from-sky-400 via-teal-400 to-forest-500",
    chip: "bg-sky-100 text-sky-700",
    icon: "text-sky-600",
    btn: "river",
  },
  violet: {
    grad: "from-violet-400 via-sky-400 to-teal-400",
    chip: "bg-violet-100 text-violet-700",
    icon: "text-violet-600",
    btn: "primary",
  },
};

export function PricingCard({
  plan,
  featured,
}: {
  plan: Plan;
  featured?: boolean;
}) {
  const a = accents[plan.accent];

  return (
    <div
      className={cn(
        "group relative h-full transition-transform duration-500 hover:-translate-y-1.5",
        featured ? "lg:-mt-6 lg:mb-0" : "",
      )}
    >
      {/* Glow / gradient border wrapper */}
      <div
        className={cn(
          "relative h-full rounded-5xl p-[1.5px] transition-all duration-500",
          featured
            ? `bg-gradient-to-b ${a.grad} shadow-glow`
            : "bg-forest-100/70 group-hover:bg-forest-200",
        )}
      >
        {featured && (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-b opacity-30 blur-2xl",
              a.grad,
            )}
          />
        )}

        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(2.75rem-1.5px)] bg-white/90 p-7 backdrop-blur sm:p-8">
          {plan.popular && <Ribbon>Most Popular</Ribbon>}

          {/* Header */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid h-12 w-12 place-items-center rounded-2xl text-2xl",
                a.chip,
              )}
              aria-hidden
            >
              {plan.emoji}
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold text-forest-950">
                {plan.name}
              </h3>
              <p className="text-sm text-ink-soft">{plan.tagline}</p>
            </div>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-end gap-1.5">
            <span className="font-display text-5xl font-semibold text-forest-950">
              {formatINR(plan.price)}
            </span>
            <span className="mb-1.5 text-sm text-ink-soft">
              / {plan.durationLabel}
            </span>
          </div>

          {plan.flagship && (
            <span
              className={cn(
                "mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                a.chip,
              )}
            >
              <Sparkles className="h-3.5 w-3.5" /> Flagship experience
            </span>
          )}

          {/* Features */}
          <ul className="mt-7 space-y-3.5">
            {plan.features.map((f) => (
              <li key={f.label} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg",
                    f.highlight ? a.chip : "bg-forest-50 text-forest-500",
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span
                  className={cn(
                    "text-sm leading-snug",
                    f.highlight
                      ? "font-semibold text-forest-900"
                      : "text-ink-soft",
                  )}
                >
                  <Icon
                    name={f.icon}
                    className={cn(
                      "mr-1.5 inline h-4 w-4 -translate-y-0.5",
                      a.icon,
                    )}
                  />
                  {f.label}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="mt-8 flex flex-col gap-2 pt-2">
            <Button
              href={`/checkout?plan=${plan.slug}`}
              variant={featured ? a.btn : "outline"}
              size="lg"
              className="w-full"
            >
              Get {plan.name}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Link
              href={`/shop/${plan.slug}`}
              className="text-center text-sm font-medium text-forest-600 transition-colors hover:text-forest-800"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
