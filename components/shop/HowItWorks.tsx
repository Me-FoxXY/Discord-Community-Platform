import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { LogIn, QrCode, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: LogIn,
    title: "Log in with Discord",
    desc: "Sign in so we can link your purchase to your Discord account and deliver perks to the right person.",
  },
  {
    icon: QrCode,
    title: "Pay via UPI",
    desc: "Scan the QR or use our UPI ID, then submit your 12-digit UTR reference and a screenshot of the payment.",
  },
  {
    icon: PartyPopper,
    title: "Get your perks",
    desc: "Our team verifies your payment and grants your perks — usually within a few hours, always within 24.",
  },
];

export function HowItWorks({ heading = true }: { heading?: boolean }) {
  return (
    <div>
      {heading && (
        <SectionHeading
          eyebrow="How it works"
          title="From cart to perks in three steps"
          subtitle="A simple, secure flow — no card details, no fuss."
        />
      )}
      <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <StaggerItem key={s.title}>
            <div className="relative h-full rounded-4xl border border-forest-100/70 bg-white/80 p-6 shadow-soft">
              <span className="absolute right-5 top-5 font-display text-4xl font-semibold text-forest-100">
                {i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-grad text-white shadow-soft">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-forest-950">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
