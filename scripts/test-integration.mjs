import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const password = readFileSync(new URL('../.local/postgres-password.txt', import.meta.url), 'utf8').trim();
// Deliberately never reads DATABASE_URL from .env: these tests only use our isolated test DB.
const env = { ...process.env, DATABASE_URL: `postgresql://community_dev:${password}@127.0.0.1:55432/discord_community_test` };
for (const args of [
  ['node_modules/prisma/build/index.js', 'migrate', 'deploy'],
  ['node_modules/vitest/vitest.mjs', 'run', '--config', 'vitest.integration.config.ts'],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
