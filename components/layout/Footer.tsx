import { currentServer } from "@/lib/servers/context";
import { CommunityLink as Link } from "@/components/servers/Community";
import { Leaf } from "lucide-react";
import {
  DiscordIcon,
  XIcon,
  YoutubeIcon,
  InstagramIcon,
} from "@/components/icons/brands";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { site as defaults, navLinks } from "@/config/site";
import { listProducts } from "@/lib/catalog";
import type { SocialPlatform } from "@/config/site";
import type { ComponentType, SVGProps } from "react";

const socialIcon: Record<
  SocialPlatform,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  discord: DiscordIcon,
  x: XIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
};

export async function Footer() {
  const community = await currentServer();
  const site = {
    ...defaults,
    name: community.name,
    discordInvite: community.inviteUrl || "/servers",
    socials: [
      {
        platform: "discord" as const,
        label: "Discord",
        href: community.inviteUrl || "/servers",
      },
    ],
  };
  const plans = await listProducts();
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-forest-100 bg-white/50">
      <Container className="py-16">
        {/* CTA band */}
        <div className="relative overflow-hidden rounded-5xl bg-forest-grad px-6 py-12 text-center shadow-card sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(60%_120%_at_50%_-10%,white,transparent)]"
          />
          <h2 className="relative text-3xl text-white sm:text-4xl">
            Ready to grow with us?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-mint-50/90">
            Join our community in the friendliest corner of Discord — then make
            it yours with premium perks.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button href={site.discordInvite} variant="glass" size="lg">
              <DiscordIcon className="h-5 w-5" /> Join Discord
            </Button>
            <Button href="/shop" variant="gold" size="lg">
              Browse Premium Plans
            </Button>
          </div>
        </div>

        {/* Columns */}
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-grad text-white shadow-soft">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-semibold text-forest-950">
                {site.name}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              {site.shortPitch}
            </p>
            <div className="mt-5 flex gap-2">
              {site.socials.map((s) => {
                const SocialIcon = socialIcon[s.platform];
                return (
                  <a
                    key={s.platform}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-forest-100 bg-white/70 text-forest-600 transition-colors hover:border-forest-300 hover:text-forest-800"
                  >
                    <SocialIcon className="h-[1.15rem] w-[1.15rem]" />
                  </a>
                );
              })}
            </div>
          </div>

          <FooterCol
            title="Explore"
            links={navLinks.map((l) => ({ label: l.label, href: l.href }))}
          />
          <FooterCol
            title="Plans"
            links={plans.map((p) => ({
              label: p.name,
              href: `/shop/${p.slug}`,
            }))}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "Community", href: "/community" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Contact", href: `mailto:${site.contactEmail}` },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-forest-100 pt-6 text-sm text-ink-soft sm:flex-row">
          <p>
            © {year} {site.name}. Crafted with care & chlorophyll.
          </p>
          <p className="flex items-center gap-1.5">
            <Leaf className="h-4 w-4 text-forest-400" /> A nature-inspired
            Discord community.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="font-display text-base font-semibold text-forest-900">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-ink-soft transition-colors hover:text-forest-700"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
