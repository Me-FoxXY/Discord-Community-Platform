/** Discord user ids allowed into the admin dashboard. */
export function adminIds(): string[] {
  return (process.env.ADMIN_DISCORD_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminId(id?: string | null): boolean {
  if (!id) return false;
  return adminIds().includes(id);
}
