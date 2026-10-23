import { CommunityLink as Link } from "@/components/servers/Community";
import { Check, Minus } from "lucide-react";
import type { Plan } from "@/config/plans";
import { formatINR, cn } from "@/lib/utils";

type Cell = boolean | string;

function CellView({ value }: { value: Cell }) {
  if (value === true)
    return (
      <span className="inline-grid h-6 w-6 place-items-center rounded-lg bg-mint-100 text-mint-600">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  if (value === false)
    return (
      <span className="inline-grid h-6 w-6 place-items-center rounded-lg bg-forest-50 text-forest-300">
        <Minus className="h-4 w-4" />
      </span>
    );
  return <span className="text-sm font-medium text-forest-800">{value}</span>;
}

export function ComparisonTable({ plans }: { plans: Plan[] }) {
  const labels = [
    ...new Set(plans.flatMap((p) => p.features.map((f) => f.label))),
  ];
  const rows = labels.map((label) => ({
    label,
    values: plans.map((p) => p.features.some((f) => f.label === label)),
  }));
  return (
    <div className="overflow-x-auto rounded-4xl border border-forest-100/70 bg-white/80 shadow-soft">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-forest-100">
            <th className="p-5 text-sm font-semibold text-ink-soft">
              Features
            </th>
            {plans.map((p) => (
              <th key={p.slug} className="p-5">
                <div className="flex items-center gap-2">
                  <span aria-hidden>{p.emoji}</span>
                  <span className="font-display text-base font-semibold text-forest-950">
                    {p.name}
                  </span>
                  {p.popular && (
                    <span className="rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest-700">
                      Popular
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.label}
              className="border-b border-forest-50 last:border-0"
            >
              <td className="p-5 text-sm font-medium text-forest-900">
                {r.label}
              </td>
              {r.values.map((v, i) => (
                <td key={i} className="p-5">
                  <CellView value={v} />
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-forest-50/40">
            <td className="p-5 text-sm font-semibold text-forest-900">Price</td>
            {plans.map((p) => (
              <td key={p.slug} className="p-5">
                <div className="font-display text-xl font-semibold text-forest-950">
                  {formatINR(p.price)}
                </div>
                <div className="text-xs text-ink-soft">/ {p.durationLabel}</div>
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-5" />
            {plans.map((p) => (
              <td key={p.slug} className="p-5">
                <Link
                  href={`/checkout?plan=${p.slug}`}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                    p.popular
                      ? "bg-forest-grad text-white hover:shadow-glow"
                      : "border border-forest-200 text-forest-800 hover:bg-forest-50",
                  )}
                >
                  Choose
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
