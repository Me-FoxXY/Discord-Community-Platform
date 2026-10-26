import { ServerManager } from "@/components/servers/ServerManager";
import { Container } from "@/components/ui/Container";
export const dynamic = "force-dynamic";
export default function ServersPage() {
  return (
    <main className="pb-16 pt-32 sm:pt-36">
      <Container>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-forest-600">
          Your community workspace
        </p>
        <h1 className="font-display text-4xl sm:text-5xl">
          A place for your people.
        </h1>
        <p className="mb-10 mt-4 max-w-2xl text-ink-soft">
          Bring your Discord community to Verdanta. Request a storefront, follow
          its approval, and make it your own.
        </p>
        <ServerManager />
      </Container>
    </main>
  );
}
