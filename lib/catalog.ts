import { currentServerId, currentServer } from "@/lib/servers/context";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@/config/plans";

export type CatalogPlan = Plan & { roleId: string | null; enabled: boolean };
export const listProducts = cache(
  async (includeDisabled = false): Promise<CatalogPlan[]> => {
    if (!includeDisabled && (await currentServer()).status !== "active")
      return [];
    const rows = await prisma.product.findMany({
      where: {
        serverId: await currentServerId(),
        ...(includeDisabled ? {} : { enabled: true }),
      },
      orderBy: { slug: "asc" },
    });
    return rows
      .map((row) => ({
        ...(row.data as unknown as Plan),
        slug: row.slug,
        enabled: row.enabled,
        roleId: row.roleId,
      }))
      .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
  },
);
export async function getPlan(slug: string) {
  return (await listProducts()).find((plan) => plan.slug === slug);
}
