import type { FaqItem } from "@/components/ui/Accordion";

/** Community copy. Publish statistics and testimonials only from verified sources. */

export type Stat = {
  key: string;
  icon: string;
  label: string;
  value: number;
  suffix?: string;
  compact?: boolean;
};

export const stats: Stat[] = [];

/** The compact set featured in the hero. */
export const heroStats: Stat[] = [];

export type Feature = { icon: string; title: string; desc: string };

export const whyJoin: Feature[] = [
  { icon: "friends", title: "Friendly Community", desc: "A welcoming, drama-free space where new faces become fast friends." },
  { icon: "shield", title: "Active Staff", desc: "A dedicated team keeping things safe, fair, and fun around the clock." },
  { icon: "gift", title: "Giveaways", desc: "Regular giveaways for games, gift cards, Nitro, and premium perks." },
  { icon: "gamepad", title: "Gaming Sessions", desc: "Squad up for game nights across all your favourite titles." },
  { icon: "mic", title: "Voice Chats", desc: "Cozy voice lounges buzzing day and night — always someone to talk to." },
  { icon: "zap", title: "Fast Support", desc: "Friendly support that actually replies — most tickets solved in minutes." },
  { icon: "crown", title: "Premium Perks", desc: "Stand out with personal roles, bonus XP, soundboard, and voice channels." },
  { icon: "events", title: "Exclusive Events", desc: "Tournaments, movie nights, AMAs, and members-only happenings." },
  { icon: "leaf", title: "Seasonal Rewards", desc: "Fresh themed rewards and drops every season of the year." },
];

export const aboutValues = [
  "Kindness first — everyone belongs here",
  "Play hard, stay humble",
  "Zero tolerance for toxicity",
  "Give more than you take",
];

export const aboutParagraphs = [
  "Verdanta is a place to connect with your Discord community and find the perks that suit you.",
  "Visit the server for current conversations, community activities, and support.",
];

export type Testimonial = {
  name: string;
  handle: string;
  role: string;
  quote: string;
  rating: number;
  initials: string;
  accent: "mint" | "sky" | "violet" | "forest";
};

export const testimonials: Testimonial[] = [];

export type ShowcaseTile = {
  title: string;
  caption: string;
  gradient: string;
  icon: string;
  span?: "tall" | "wide";
};

export const showcaseTiles: ShowcaseTile[] = [
  { title: "Weekly Game Nights", caption: "Squads forming in #looking-for-group", gradient: "bg-river", icon: "gamepad", span: "tall" },
  { title: "Community Art Wall", caption: "Fresh drops in #showcase", gradient: "bg-meadow", icon: "palette" },
  { title: "Voice Lounges", caption: "Always someone to talk to", gradient: "bg-forest-grad", icon: "mic" },
  { title: "Seasonal Events", caption: "Themed rewards all year", gradient: "bg-[var(--grad-gold)]", icon: "leaf", span: "wide" },
  { title: "Giveaways", caption: "Nitro, games & gift cards", gradient: "bg-[var(--grad-violet)]", icon: "gift" },
];

export type StaffMember = {
  name: string;
  role: string;
  initials: string;
  blurb: string;
  accent: "mint" | "sky" | "violet" | "forest";
};

export const staff: StaffMember[] = [];

export type CommunityEvent = { title: string; when: string; desc: string; icon: string; accent: "mint" | "sky" | "violet" | "forest" };

export const events: CommunityEvent[] = [];

export type Achievement = { value: number; suffix?: string; compact?: boolean; label: string; icon: string };

export const achievements: Achievement[] = [];

export const faqs: FaqItem[] = [
  {
    q: "How does purchasing work?",
    a: "Pick a plan, log in with Discord, and pay via UPI. After you submit your payment reference (UTR) and screenshot, our team verifies it and your perks are granted to your Discord account.",
  },
  {
    q: "How fast is delivery?",
    a: "Once your payment is verified, perks are usually granted within a few hours — and always within 24 hours. You'll see your order flip to 'Approved' on your order page.",
  },
  {
    q: "What's your refund policy?",
    a: "Because perks are delivered digitally to your account, purchases are generally non-refundable. If something goes wrong or a payment can't be verified, reach out and we'll make it right.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We currently accept UPI. Scan the QR or use the UPI ID shown at checkout, then submit your 12-digit UTR reference and a screenshot so we can verify the payment.",
  },
  {
    q: "How long do premium perks last?",
    a: "Every plan lasts 30+ days from activation. Renew any time to keep your role, XP boost, and other perks active.",
  },
  {
    q: "How do I contact support?",
    a: "Open a ticket in our Discord server (#support) or email us. Our support team is famously fast and friendly.",
  },
];
