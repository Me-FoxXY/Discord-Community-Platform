import { apiHandler } from "@/lib/servers/errors";
import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { auth } from "@/lib/auth";
import {
  getOrder,
  submitProof,
  DuplicateUtrError,
  OrderConflictError,
} from "@/lib/orders/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function handlePOST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.discordId) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }

  const order = await getOrder(id);
  if (!order)
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.discordUserId !== session.user.discordId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (order.status !== "awaiting_payment") {
    return NextResponse.json(
      { error: "Payment proof was already submitted for this order." },
      { status: 409 },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form)
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });

  const utr = String(form.get("utr") ?? "").trim();
  const file = form.get("screenshot");

  if (!/^\d{12}$/.test(utr)) {
    return NextResponse.json(
      { error: "Enter a valid 12-digit UPI reference (UTR)." },
      { status: 400 },
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A payment screenshot is required." },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Screenshot must be a non-empty image under 3MB." },
      { status: 400 },
    );
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Upload a PNG, JPG, WebP, or GIF image." },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const hash = createHash("sha256").update(buf).digest("hex");

  // Convert image to a Base64 Data URI so it can be stored in the database
  const dataUri = `data:${file.type};base64,${buf.toString("base64")}`;

  try {
    await submitProof({
      orderId: order.id,
      utr,
      screenshotPath: dataUri,
      screenshotHash: hash,
    });
  } catch (err) {
    if (err instanceof OrderConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof DuplicateUtrError) {
      return NextResponse.json(
        {
          error:
            "This UPI reference (UTR) has already been used. Each payment can only be submitted once.",
        },
        { status: 409 },
      );
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}

export const POST = apiHandler(handlePOST);
