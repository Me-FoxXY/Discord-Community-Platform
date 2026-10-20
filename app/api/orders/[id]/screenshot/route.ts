import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { auth } from "@/lib/auth";
import { getOrder } from "@/lib/orders/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

// Screenshots are private: only the order owner or an admin may view them.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const order = await getOrder(id);
  if (!order?.screenshotPath) return new NextResponse("Not found", { status: 404 });

  const isOwner = session?.user?.discordId === order.discordUserId;
  if (!isOwner && !session?.user?.isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Extract the Base64 data and mime type from the data URI
  const match = order.screenshotPath.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!match) return new NextResponse("Not found", { status: 404 });

  const contentType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
