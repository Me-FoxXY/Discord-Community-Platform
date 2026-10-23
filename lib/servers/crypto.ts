import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
function key() {
  const value = process.env.CONFIG_ENCRYPTION_KEY || "";
  if (!/^[a-fA-F0-9]{64}$/.test(value))
    throw new Error("Configure a 32-byte hexadecimal CONFIG_ENCRYPTION_KEY.");
  return Buffer.from(value, "hex");
}
export function encryptCredential(value: string, userId: string) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(userId));
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}
export function decryptCredential(value: string, userId: string) {
  const [version, iv, tag, content] = value.split(".");
  if (version !== "v1") throw new Error("Unsupported credential version");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(iv, "base64"),
  );
  decipher.setAAD(Buffer.from(userId));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(content, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
