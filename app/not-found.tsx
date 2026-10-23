import { CommunityLink as Link } from "@/components/servers/Community";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FloatingLeaves } from "@/components/decor/nature";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden py-24">
      <FloatingLeaves />
      <Container className="max-w-xl text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-4xl bg-forest-grad text-white shadow-glow">
          <Compass className="h-9 w-9" />
        </span>
        <p className="mt-8 font-display text-7xl font-semibold text-forest-950">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl text-forest-900">
          Lost in the woods
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">
          This trail doesn&apos;t lead anywhere. Let&apos;s get you back to
          familiar ground.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="primary" size="lg">
            Back home
          </Button>
          <Button href="/shop" variant="outline" size="lg">
            Browse plans
          </Button>
        </div>
      </Container>
    </main>
  );
}
