/** Premium plans — the exact catalogue from the brief. */

export type FeatureIcon =
  | "role"
  | "nickname"
  | "xp"
  | "validity"
  | "soundboard"
  | "voice";

export type PlanFeature = {
  icon: FeatureIcon;
  label: string;
  /** Only in this tier and above — used to visually highlight upgrades. */
  highlight?: boolean;
};

export type PlanAccent = "mint" | "sky" | "violet";

export type Plan = {
  slug: string;
  name: string;
  emoji: string;
  price: number; // whole rupees
  durationDays: number;
  durationLabel: string;
  tagline: string;
  popular?: boolean;
  flagship?: boolean;
  accent: PlanAccent;
  features: PlanFeature[];
  description: string;
  benefits: string[];
  eligibility: string[];
  deliveryTimeline: string;
  faq: { q: string; a: string }[];
};

export const plans: Plan[] = [
  {
    slug: "premium",
    name: "Premium",
    emoji: "🟢",
    price: 19,
    durationDays: 30,
    durationLabel: "30 Days",
    tagline: "Perfect for getting started",
    accent: "mint",
    features: [
      { icon: "role", label: "Personal Role" },
      { icon: "nickname", label: "Nickname Change Permission" },
      { icon: "xp", label: "60% Extra XP" },
      { icon: "validity", label: "30+ Days Validity" },
    ],
    description:
      "Your first step into the Verdanta premium experience. Claim a personal role, level up faster with bonus XP, and personalise how the community sees you — all for the price of a coffee.",
    benefits: [
      "A personal, colour-customisable role that sits proudly in the member list",
      "Freedom to change your own nickname whenever the mood strikes",
      "60% bonus XP so you climb the leaderboard noticeably faster",
      "Full perks for a complete 30-day cycle",
    ],
    eligibility: [
      "You must be a member of the Verdanta Discord server",
      "Your Discord account must be in good standing (no active moderation actions)",
    ],
    deliveryTimeline:
      "Perks are granted after your payment is verified — usually within a few hours, and always within 24 hours.",
    faq: [
      {
        q: "Can I upgrade to Premium Pro later?",
        a: "Absolutely. You can purchase a higher tier any time; the new perks are applied on top of your account.",
      },
      {
        q: "What happens when the 30 days end?",
        a: "Your premium role and perks gently expire. Renew any time to keep them active.",
      },
    ],
  },
  {
    slug: "premium-pro",
    name: "Premium Pro",
    emoji: "🔵",
    price: 49,
    durationDays: 30,
    durationLabel: "30 Days",
    tagline: "Best value for active members",
    popular: true,
    accent: "sky",
    features: [
      { icon: "role", label: "Personal Role" },
      { icon: "soundboard", label: "Soundboard Permission", highlight: true },
      { icon: "nickname", label: "Nickname Change Permission" },
      { icon: "xp", label: "70% Extra XP" },
      { icon: "voice", label: "Personal Voice Channel (up to 1 month)", highlight: true },
      { icon: "validity", label: "30+ Days Validity" },
    ],
    description:
      "The community favourite. Everything in Premium, plus your own personal voice channel, soundboard powers, and a bigger XP boost. The sweet spot for members who show up every day.",
    benefits: [
      "Your very own personal voice channel to hang out in (available for up to 1 month)",
      "Soundboard permission to bring the energy to voice chats",
      "A generous 70% bonus XP",
      "A personal role and nickname freedom, just like Premium",
    ],
    eligibility: [
      "You must be a member of the Verdanta Discord server",
      "Your Discord account must be in good standing (no active moderation actions)",
    ],
    deliveryTimeline:
      "Perks are granted after your payment is verified — usually within a few hours, and always within 24 hours. Your personal voice channel is created on request in #support.",
    faq: [
      {
        q: "How long does the personal voice channel last?",
        a: "Your voice channel stays available for up to 1 month with Premium Pro. Choose Premium Plus for up to 2 months.",
      },
      {
        q: "Why is Premium Pro the most popular?",
        a: "It's the best balance of price and perks — the voice channel and soundboard make it a favourite for members who are active in voice.",
      },
    ],
  },
  {
    slug: "premium-plus",
    name: "Premium Plus",
    emoji: "🟣",
    price: 79,
    durationDays: 30,
    durationLabel: "30 Days",
    tagline: "The ultimate premium experience",
    flagship: true,
    accent: "violet",
    features: [
      { icon: "role", label: "Personal Role" },
      { icon: "soundboard", label: "Soundboard Permission" },
      { icon: "nickname", label: "Nickname Change Permission" },
      { icon: "xp", label: "80% Extra XP", highlight: true },
      { icon: "voice", label: "Personal Voice Channel (up to 2 months)", highlight: true },
      { icon: "validity", label: "30+ Days Validity" },
    ],
    description:
      "Our flagship. The complete Verdanta experience with the highest XP boost, soundboard powers, and a personal voice channel that stays with you for up to two months. Treat yourself.",
    benefits: [
      "The biggest XP boost we offer — a full 80% bonus",
      "A personal voice channel available for up to 2 months",
      "Soundboard permission and a personal role",
      "Everything in Premium Pro, turned up to eleven",
    ],
    eligibility: [
      "You must be a member of the Verdanta Discord server",
      "Your Discord account must be in good standing (no active moderation actions)",
    ],
    deliveryTimeline:
      "Perks are granted after your payment is verified — usually within a few hours, and always within 24 hours. Your personal voice channel is created on request in #support.",
    faq: [
      {
        q: "What makes Premium Plus the flagship?",
        a: "It's the most complete tier: the highest XP boost and the longest-lasting personal voice channel (up to 2 months).",
      },
      {
        q: "Is this the best value?",
        a: "If you're a power user who lives in voice chat and wants to level up fastest, yes. For most members, Premium Pro is the sweet spot.",
      },
    ],
  },
];

export const plansBySlug = Object.fromEntries(plans.map((p) => [p.slug, p])) as Record<string, Plan>;

export function getPlan(slug: string): Plan | undefined {
  return Object.hasOwn(plansBySlug, slug) ? plansBySlug[slug] : undefined;
}

export function relatedPlans(slug: string): Plan[] {
  return plans.filter((p) => p.slug !== slug);
}
