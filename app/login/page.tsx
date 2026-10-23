import { auth, discordConfigured, devLoginEnabled } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CommunityLink as Link } from "@/components/servers/Community";
import { LoginForm } from "@/components/auth/LoginForm";
import { Container } from "@/components/ui/Container";
import { GradientBlobs } from "@/components/decor/nature";
import { site } from "@/config/site";
import { Leaf, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Sign in",
  description: "Log in with Discord to purchase perks.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const callbackUrl =
    sp.callbackUrl?.startsWith("/") &&
    !sp.callbackUrl.startsWith("//") &&
    !sp.callbackUrl.includes("\\")
      ? sp.callbackUrl
      : "/";
  const session = await auth();
  if (session?.user) redirect(callbackUrl);

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden py-24">
      <GradientBlobs />
      <Container className="max-w-md">
        <div className="rounded-5xl border border-forest-100/70 bg-white/80 p-6 shadow-card backdrop-blur sm:p-8">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest-grad text-white shadow-soft">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold text-forest-950">
              {site.name}
            </span>
          </Link>

          <h1 className="text-3xl text-forest-950">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Sign in with Discord to buy perks — your order is linked to your
            account so rewards reach the right person.
          </p>

          <div className="mt-8">
            <LoginForm
              discordConfigured={discordConfigured}
              devLoginEnabled={devLoginEnabled}
              callbackUrl={callbackUrl}
            />
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-soft">
            <ShieldCheck className="h-4 w-4 text-forest-500" />
            We only request your basic Discord profile.
          </p>
        </div>
      </Container>
    </main>
  );
}
