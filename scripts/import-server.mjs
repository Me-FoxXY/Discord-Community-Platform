import { createRequire } from "node:module";
import { PrismaClient } from "@prisma/client";
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const db = new PrismaClient();
try {
  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  if (!guildId || !/^[1-9]\d{16,19}$/.test(guildId))
    throw Error("Set the original DISCORD_GUILD_ID before importing.");
  const mismatch = await db.order.count({
    where: { serverId: "default", deliveryGuildId: { not: guildId } },
  });
  if (mismatch)
    throw Error(
      "Historical orders reference another guild. Review them before importing.",
    );
  await db.$transaction(async (tx) => {
    const server = await tx.server.findUniqueOrThrow({
      where: { id: "default" },
    });
    if (server.guildId) {
      if (server.guildId !== guildId)
        throw Error("The original server has a different guild ID.");
      return;
    }
    await tx.server.update({
      where: { id: "default" },
      data: {
        guildId,
        inviteUrl: process.env.NEXT_PUBLIC_DISCORD_INVITE || "",
        upiId: process.env.NEXT_PUBLIC_UPI_ID || "",
        payeeName: process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "",
        updatedBy: "migration",
      },
    });
    for (const [slug, key] of [
      ["premium", "DISCORD_ROLE_PREMIUM"],
      ["premium-pro", "DISCORD_ROLE_PREMIUM_PRO"],
      ["premium-plus", "DISCORD_ROLE_PREMIUM_PLUS"],
    ]) {
      const role = process.env[key];
      if (role)
        await tx.product.updateMany({
          where: { serverId: "default", slug, roleId: null },
          data: { roleId: role },
        });
    }
    await tx.order.updateMany({
      where: { serverId: "default", deliveryGuildId: null },
      data: { deliveryGuildId: guildId },
    });
    for (const p of await tx.product.findMany({
      where: { serverId: "default" },
    }))
      if (p.roleId)
        await tx.order.updateMany({
          where: {
            serverId: "default",
            planSlug: p.slug,
            deliveryRoleId: null,
            deliveredAt: null,
          },
          data: { deliveryRoleId: p.roleId },
        });
    for (const userId of (process.env.ADMIN_DISCORD_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean))
      await tx.platformAccess.upsert({
        where: { userId },
        create: { userId, role: "administrator" },
        update: {},
      });
    await tx.auditEvent.create({
      data: {
        serverId: "default",
        actorId: "migration",
        action: "server.import",
        outcome: "success",
      },
    });
  });
  console.log(
    "Original community imported. Credentials were not copied into server settings.",
  );
} finally {
  await db.$disconnect();
}
