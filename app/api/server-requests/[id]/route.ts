import { apiHandler } from "@/lib/servers/errors";
import { reviewServerRequest } from "@/lib/servers/requests";
export const POST = apiHandler(
  async (req: Request, context: { params: Promise<{ id: string }> }) =>
    reviewServerRequest(req, (await context.params).id),
);
