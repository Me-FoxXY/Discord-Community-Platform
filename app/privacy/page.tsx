import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles your data.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" subtitle="A plain-English summary of what we collect and why." />
      <section className="pb-24">
        <Container className="max-w-3xl">
          <Prose>
            <p className="text-sm">Last updated: this is placeholder legal copy — review with a professional before launch.</p>

            <h2>What we collect</h2>
            <p>
              When you sign in with Discord, we receive your basic profile: your Discord user id, username, and
              avatar. When you make a purchase, we store your order details, the UPI reference (UTR) you submit, and
              your payment screenshot so our team can verify the payment.
            </p>

            <h2>How we use it</h2>
            <ul>
              <li>To link your purchase to your Discord account and deliver perks to the right person.</li>
              <li>To verify payments and prevent fraud (for example, detecting re-used payment references).</li>
              <li>To provide support and respond to your questions.</li>
            </ul>

            <h2>What we don&apos;t do</h2>
            <p>
              We never see or store your card, bank, or UPI PIN details — payment happens entirely inside your own
              UPI app. We don&apos;t sell your data.
            </p>

            <h2>Data retention</h2>
            <p>
              Payment screenshots and order records are kept only as long as needed to verify payments and provide
              support, then removed on a routine basis.
            </p>

            <h2>Your choices</h2>
            <p>
              You can request deletion of your account data or ask a question any time by contacting us at{" "}
              <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or in our Discord server.
            </p>
          </Prose>
        </Container>
      </section>
    </>
  );
}
