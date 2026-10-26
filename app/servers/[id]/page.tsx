import { ServerManager } from "@/components/servers/ServerManager";
import { Container } from "@/components/ui/Container";
export const dynamic = "force-dynamic";
export default async function ServerDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="pb-12 pt-32">
      <Container>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-forest-600">
          Community settings
        </p>
        <h1 className="font-display text-4xl sm:text-5xl">Make it your own.</h1>
        <p className="mb-8 mt-4 text-ink-soft">
          Shape your storefront, manage your team, and keep everything running
          smoothly.
        </p>
        <ServerManager key={id} initialServerId={id} />
      </Container>
    </main>
  );
}
