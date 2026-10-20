import {
  Users,
  Wifi,
  Activity,
  CalendarDays,
  PartyPopper,
  LifeBuoy,
  Heart,
  Shield,
  Gift,
  Gamepad2,
  Mic,
  Zap,
  Crown,
  Sparkles,
  Leaf,
  Trophy,
  Palette,
  Pencil,
  TrendingUp,
  CalendarClock,
  Radio,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

/** Maps string keys used across config into lucide icons. */
const registry: Record<string, LucideIcon> = {
  // stats / content
  members: Users,
  online: Wifi,
  daily: Activity,
  calendar: CalendarDays,
  events: PartyPopper,
  tickets: LifeBuoy,
  heart: Heart,
  friends: Users,
  shield: Shield,
  gift: Gift,
  gamepad: Gamepad2,
  mic: Mic,
  zap: Zap,
  crown: Crown,
  leaf: Leaf,
  trophy: Trophy,
  palette: Palette,
  discord: MessageCircle,
  // plan feature icons
  role: Palette,
  nickname: Pencil,
  xp: TrendingUp,
  validity: CalendarClock,
  soundboard: Radio,
  voice: Mic,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = registry[name] ?? Sparkles;
  return <Cmp className={className} aria-hidden />;
}
