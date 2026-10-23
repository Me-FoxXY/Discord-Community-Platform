import { ServerError } from "./errors";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Middleware always overwrites this header from the URL; never accept a client-selected header.
export async function currentServerId() {
  return (await headers()).get("x-community-id") || "default";
}
export async function currentServer() {
  const server = await prisma.server.findUnique({
    where: { id: await currentServerId() },
  });
  if (!server) throw new ServerError("Server not found.", 404);
  return server;
}
export async function serverPath(path: string) {
  const id = await currentServerId();
  return id === "default" ? path : `/s/${id}${path === "/" ? "" : path}`;
}
