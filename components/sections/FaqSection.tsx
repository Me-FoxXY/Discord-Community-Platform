import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { faqs } from "@/config/content";
import { site } from "@/config/site";
import { HelpCircle, LifeBuoy } from "lucide-react";

export function FaqSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow={
            <>
              <HelpCircle className="h-3.5 w-3.5" /> FAQ
            </>
          }
          title="Questions, answered"
          subtitle="Everything you need to know about purchasing, delivery, and support."
        />

        <Reveal className="mt-12">
          <div className="rounded-5xl border border-forest-100/70 bg-white/80 px-6 py-2 shadow-soft backdrop-blur sm:px-8">
            <Accordion items={faqs} />
          </div>
        </Reveal>

        <Reveal className="mt-8" delay={0.05}>
          <div className="flex flex-col items-center justify-between gap-4 rounded-4xl bg-mist p-6 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-grad text-white">
                <LifeBuoy className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-forest-900">Still have a question?</p>
                <p className="text-sm text-ink-soft">Our support team replies fast — usually within minutes.</p>
              </div>
            </div>
            <Button href={site.discordInvite} variant="primary">
              Ask in Discord
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
