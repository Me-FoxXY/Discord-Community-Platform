import { NextRequest, NextResponse } from "next/server";

// Tenant identity comes only from a validated URL, never from caller-supplied headers.
export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.delete("x-community-id");
  const path = req.nextUrl.pathname;
  const match = path.match(/^\/(api\/)?s\/([a-zA-Z0-9_-]{1,64})(\/.*)?$/);
  if (match) {
    headers.set("x-community-id", match[2]);
    const url = new URL(req.url);
    // Keep rewrites on the incoming origin (Next can normalize loopback to localhost).
    url.host = req.headers.get("host") || url.host;
    url.pathname = (match[1] ? "/api" : "") + (match[3] || "/");
    if (
      url.pathname.startsWith("/api/auth") ||
      url.pathname.startsWith("/api/servers") ||
      url.pathname.startsWith("/s/")
    )
      return new NextResponse("Not found", { status: 404 });
    return NextResponse.rewrite(url, { request: { headers } });
  }
  headers.set("x-community-id", "default");
  return NextResponse.next({ request: { headers } });
}
export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:gif|mp4|webm|webp|png|svg|jpg|woff2)$).*)",
  ],
};
