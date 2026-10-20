import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** Discord snowflake id of the signed-in user. */
      discordId?: string;
      /** True when the user's id is in ADMIN_DISCORD_IDS. */
      isAdmin?: boolean;
    } & DefaultSession["user"];
  }
}
