import { ServerManager } from "@/components/servers/ServerManager";
import { Container } from "@/components/ui/Container";
export const dynamic = "force-dynamic";
export default function ServersPage() {
  return (
    <main className="pb-12 pt-32">
      <Container>
        <h1 className="text-4xl">Manage your communities</h1>
        <p className="mb-8 mt-3 text-ink-soft">
          Choose a server to configure its storefront, staff, and Discord
          access.
        </p>
        <ServerManager />
      </Container>
    </main>
  );
}
