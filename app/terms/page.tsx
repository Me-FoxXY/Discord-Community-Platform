import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms for using ${site.name} and purchasing perks.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms of Service" subtitle="The basics of buying and using Verdanta perks." />
      <section className="pb-24">
        <Container className="max-w-3xl">
          <Prose>
            <p className="text-sm">Last updated: this is placeholder legal copy — review with a professional before launch.</p>

            <h2>Purchases &amp; delivery</h2>
            <p>
              Perks are digital and delivered to your Discord account after your payment is manually verified —
              usually within a few hours and always within 24 hours. You must be a member of our Discord server and
              in good standing to receive perks.
            </p>

            <h2>Payments</h2>
            <p>
              Payments are made via UPI. You are responsible for submitting an accurate 12-digit UTR reference and a
              genuine payment screenshot. Submitting a fake, edited, or re-used payment proof is prohibited and will
              result in the order being rejected and may lead to a ban.
            </p>

            <h2>Refunds</h2>
            <p>
              Because perks are delivered digitally, purchases are generally <strong>non-refundable</strong>. If a
              payment can&apos;t be verified or something goes wrong on our side, contact us and we&apos;ll make it right.
            </p>

            <h2>Duration</h2>
            <p>
              Each plan is active for 30+ days from delivery. Perks expire at the end of the period unless renewed.
            </p>

            <h2>Fair use &amp; conduct</h2>
            <ul>
              <li>Follow the Discord Community Guidelines and our server rules.</li>
              <li>Don&apos;t abuse perks, exploit bugs, or attempt to defraud the store.</li>
              <li>We may revoke perks without refund for serious rule violations.</li>
            </ul>

            <h2>Contact</h2>
            <p>
              Questions about these terms? Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or
              reach out in our Discord.
            </p>
          </Prose>
        </Container>
      </section>
    </>
  );
}
