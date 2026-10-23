import { z } from 'zod';
import type { Plan } from '@/config/plans';

export const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(64),
  name: z.string().trim().min(2).max(80),
  price: z.number().int().min(1).max(100000),
  durationDays: z.number().int().min(1).max(3650),
  tagline: z.string().trim().max(160),
  description: z.string().trim().min(1).max(3000),
  benefits: z.array(z.string().trim().min(1).max(250)).min(1).max(20),
  roleId: z.string().regex(/^[1-9]\d{16,19}$/).nullable(),
  enabled: z.boolean(),
}).refine((p) => !p.enabled || p.roleId || ['premium', 'premium-pro', 'premium-plus'].includes(p.slug), {
  message: 'Set a Discord role ID before publishing a new product.',
});

export function productPlan(input: z.infer<typeof productSchema>, previous?: Plan): Plan {
  return {
    ...previous,
    slug: input.slug, name: input.name, price: input.price,
    durationDays: input.durationDays, durationLabel: `${input.durationDays} days`,
    tagline: input.tagline, description: input.description, benefits: input.benefits,
    features: input.benefits.map((label) => ({ icon: 'role', label })),
    emoji: previous?.emoji ?? '✨', accent: previous?.accent ?? 'mint',
    eligibility: previous?.eligibility ?? ['You must be a member of this Discord server.'],
    deliveryTimeline: previous?.deliveryTimeline ?? 'Your role is delivered after an admin verifies your payment.',
    faq: previous?.faq ?? [],
  };
}
