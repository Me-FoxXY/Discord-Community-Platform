/**
 * Single source of truth for branding & contact.
 * Swap these placeholder values for your real server details.
 */

export type SocialPlatform = "discord" | "x" | "youtube" | "instagram";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
};

export const site = {
  name: "Verdanta",
  tagline: "Where the community grows wild & free.",
  shortPitch:
    "A cozy, nature-loving Discord home for gamers, creators, and friends — with premium perks that help you stand out.",
  description:
    "Verdanta is a nature-inspired premium storefront for Discord perks and memberships. Join a thriving, friendly community and unlock personal roles, extra XP, voice channels, and more.",
  // Deployed URL (used for SEO / OpenGraph). Update on deploy.
  url: "https://verdanta.example.com",

  // Brand assets (placeholders live in /public).
  logo: "/logo.svg",
  ogImage: "/og.png",
  heroGif: "/verdanta-default.gif",
  heroPoster: "/verdanta-default.png",

  // Discord
  discordInvite: process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/your-invite",
  guildId: process.env.DISCORD_GUILD_ID ?? "",

  // Contact & legal
  contactEmail: "support@verdanta.example.com",
  supportChannel: "#support",

  // Manual UPI payment details (public, safe to expose).
  upi: {
    id: process.env.NEXT_PUBLIC_UPI_ID ?? "yourname@upi",
    payeeName: process.env.NEXT_PUBLIC_UPI_PAYEE_NAME ?? "Verdanta Perks",
  },

  socials: [
    { platform: "discord", label: "Discord", href: process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/your-invite" },
    { platform: "x", label: "X / Twitter", href: "https://x.com/" },
    { platform: "youtube", label: "YouTube", href: "https://youtube.com/" },
    { platform: "instagram", label: "Instagram", href: "https://instagram.com/" },
  ] satisfies SocialLink[],
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Community", href: "/community" },
] as const;
