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
        <h1 className="mb-8 text-4xl">Server configuration</h1>
        <ServerManager key={id} initialServerId={id} />
      </Container>
    </main>
  );
}
