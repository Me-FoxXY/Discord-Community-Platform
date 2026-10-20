import NextAuth, { type NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { isAdminId } from "@/lib/auth/admin";

const hasDiscord = Boolean(process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET);
const enableDevLogin =
  process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_LOGIN === "true";

const DEV_USER_ID = "000000000000000000";

const providers: NextAuthConfig["providers"] = [];

if (hasDiscord) {
  providers.push(
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
      authorization: { params: { scope: "identify" } },
    }),
  );
}

if (enableDevLogin) {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev Login",
      credentials: {
        username: { label: "Display name", type: "text" },
      },
      // Dev-only mock sign-in so the login-gated flows are testable without
      // real Discord credentials. Never trusted in production unless explicitly enabled.
      authorize: async (creds) => {
        const username =
          typeof creds?.username === "string" && creds.username.trim()
            ? creds.username.trim()
            : "Test Member";
        return { id: DEV_USER_ID, name: username, image: null };
      },
    }),
  );
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account, user }) {
      // Auth.js v5 can sometimes generate a UUID for user.id without a database.
      // This ensures we always grab the real Discord Snowflake ID (providerAccountId).
      if (account && user) {
        token.sub = account.type === "credentials" ? user.id : account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.discordId = token.sub;
        session.user.isAdmin = isAdminId(token.sub);
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/** Whether real Discord OAuth is configured (used by the login UI). */
export const discordConfigured = hasDiscord;
export const devLoginEnabled = enableDevLogin;
