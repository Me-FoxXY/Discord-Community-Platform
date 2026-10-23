export class ServerError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function apiHandler<A extends unknown[]>(
  handler: (request: Request, ...args: A) => Promise<Response>,
) {
  return async (request: Request, ...args: A): Promise<Response> => {
    try {
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
        const origin = request.headers.get("origin");
        if (
          (origin && origin !== new URL(request.url).origin) ||
          request.headers.get("sec-fetch-site") === "cross-site"
        ) {
          throw new ServerError("Request origin is not allowed.", 403);
        }
      }
      return await handler(request, ...args);
    } catch (error) {
      if (error instanceof ServerError)
        return Response.json(
          { error: error.message },
          { status: error.status },
        );
      if (
        typeof error === "object" &&
        error &&
        "code" in error &&
        error.code === "P2002"
      )
        return Response.json(
          { error: "This record already exists." },
          { status: 409 },
        );
      // Do not log ORM arguments, upstream headers, or credential-bearing errors.
      return Response.json(
        { error: "The operation could not be completed. Please retry." },
        { status: 503 },
      );
    }
  };
}
