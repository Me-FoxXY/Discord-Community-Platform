import type { FaqItem } from "@/components/ui/Accordion";

/** All mock marketing content. Swap for real numbers/copy any time. */

export type Stat = {
  key: string;
  icon: string;
  label: string;
  value: number;
  suffix?: string;
  compact?: boolean;
};

export const stats: Stat[] = [
  { key: "members", icon: "members", label: "Total Members", value: 24800, compact: true },
  { key: "online", icon: "online", label: "Online Now", value: 3100, compact: true },
  { key: "daily", icon: "daily", label: "Active Daily Users", value: 5200, compact: true },
  { key: "years", icon: "calendar", label: "Years Active", value: 4, suffix: "+" },
  { key: "events", icon: "events", label: "Events Hosted", value: 640, suffix: "+" },
  { key: "tickets", icon: "tickets", label: "Tickets Resolved", value: 18900, compact: true },
  { key: "happy", icon: "heart", label: "Happy Members", value: 99, suffix: "%" },
];

/** The compact set featured in the hero. */
export const heroStats: Stat[] = [
  stats[0], // members
  stats[1], // online
  stats[4], // events
];

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
  "Verdanta started as a tiny circle of friends who wanted a calmer, kinder corner of Discord — somewhere that felt more like a walk through a forest than a crowded arcade.",
  "Years later, we're a thriving community of gamers, artists, and night-owls who show up for each other. We host events, run giveaways, share art, and spend far too long in voice chat.",
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

export const testimonials: Testimonial[] = [
  { name: "Aarav", handle: "@aarav", role: "Premium Pro member", quote: "Best community I've been part of. The voice channel perk is unreal — my friends basically live in mine now.", rating: 5, initials: "AA", accent: "sky" },
  { name: "Meera", handle: "@meera", role: "Verified member", quote: "Staff actually care. I opened a ticket at 2am and got help in minutes. That never happens anywhere else.", rating: 5, initials: "ME", accent: "mint" },
  { name: "Kabir", handle: "@kabir", role: "Premium Plus member", quote: "The 80% XP boost got me to the top of the leaderboard in a week. Worth every rupee.", rating: 5, initials: "KA", accent: "violet" },
  { name: "Zoya", handle: "@zoya", role: "Artist", quote: "Wholesome, welcoming, and gorgeous vibes. Feels less like a server and more like a treehouse.", rating: 5, initials: "ZO", accent: "forest" },
  { name: "Ishaan", handle: "@ishaan", role: "Premium member", quote: "Personal role + nickname freedom is such a small thing but it makes the server feel like home.", rating: 5, initials: "IS", accent: "sky" },
  { name: "Diya", handle: "@diya", role: "Event regular", quote: "Movie nights and tournaments every week. There's always something happening.", rating: 5, initials: "DI", accent: "mint" },
];

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

export const staff: StaffMember[] = [
  { name: "Sky", role: "Founder", initials: "SK", blurb: "Planted the first seed. Keeps the vibes green.", accent: "forest" },
  { name: "Wren", role: "Community Lead", initials: "WR", blurb: "Runs events and keeps everyone smiling.", accent: "mint" },
  { name: "Ash", role: "Head Moderator", initials: "AS", blurb: "The calm in every storm. Fair and fast.", accent: "sky" },
  { name: "Ivy", role: "Support Lead", initials: "IV", blurb: "Answers tickets before you finish typing.", accent: "violet" },
  { name: "Cove", role: "Events Host", initials: "CO", blurb: "Movie nights, tournaments, chaos — the fun kind.", accent: "mint" },
  { name: "Fern", role: "Design", initials: "FE", blurb: "Makes everything look this good.", accent: "forest" },
];

export type CommunityEvent = { title: string; when: string; desc: string; icon: string; accent: "mint" | "sky" | "violet" | "forest" };

export const events: CommunityEvent[] = [
  { title: "Friday Game Night", when: "Every Friday · 8 PM IST", desc: "Rotating titles, casual lobbies, and prizes for the winners.", icon: "gamepad", accent: "sky" },
  { title: "Movie Marathon", when: "Every Saturday · 9 PM IST", desc: "Vote for the film, grab popcorn, and watch together.", icon: "events", accent: "violet" },
  { title: "Art Jam", when: "1st of each month", desc: "A themed prompt, a cozy voice call, and a gallery of creations.", icon: "palette", accent: "mint" },
  { title: "Seasonal Festival", when: "Every season", desc: "Limited-time events with exclusive roles and rewards.", icon: "leaf", accent: "forest" },
];

export type Achievement = { value: number; suffix?: string; compact?: boolean; label: string; icon: string };

export const achievements: Achievement[] = [
  { value: 24800, compact: true, label: "Members grown", icon: "members" },
  { value: 640, suffix: "+", label: "Events hosted", icon: "events" },
  { value: 18900, compact: true, label: "Tickets resolved", icon: "tickets" },
  { value: 120, suffix: "+", label: "Giveaways run", icon: "gift" },
];

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
