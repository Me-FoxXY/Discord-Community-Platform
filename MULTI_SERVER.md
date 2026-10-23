# Multi-server setup and operations

The storefront now isolates products, coupons, settings, orders, payment proofs, and role delivery by server. Manual UPI verification is unchanged. One shared Discord bot serves all registered communities. Multiple bot identities, Gateway presence, scheduled role expiry, and automatic OAuth refresh are not implemented.

## First deployment / upgrade

1. Back up PostgreSQL and verify a restore into an isolated database. Never run migrations against production without a recoverable backup.
2. Keep `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`, and `DISCORD_BOT_TOKEN` in deployment secrets. The OAuth application and installed bot must be the same application.
3. Set `CONFIG_ENCRYPTION_KEY` to 32 cryptographically random bytes encoded as 64 hexadecimal characters. Generate and store this privately; do not commit it. This encrypts OAuth access grants using AES-256-GCM with the Discord user ID as authenticated context.
4. Run `npm ci` and `npm run db:migrate`. The additive migrations attach existing records to the `default` server; they do not delete orders or change prices.
5. Before removing the original community environment settings, run `node scripts/import-server.mjs`. It copies its guild, invite, payment recipient, and product-role configuration into PostgreSQL and imports the trusted bootstrap administrator IDs. Conflicting historical guild targets abort the import. Existing non-null role snapshots are preserved. Missing role snapshots are filled only from their corresponding existing product mapping. Review those mappings before import.
6. Build and deploy the application. New-server registration must remain restricted to trusted operators until live tests have passed.
7. Sign in again with Discord to grant `identify guilds`. Existing identity-only sessions still identify users, but server discovery requires a new authorization. OAuth grants are encrypted server-side and never included in sessions. On expiry, revocation, or encryption-key rotation, reconnect Discord; refresh tokens are deliberately not stored.
8. Open `/servers`. Platform administrators can allow a specific Discord user to register servers. Registrars still need Discord ownership, Administrator, or Manage Server privileges in each server they register.

After import, `DISCORD_GUILD_ID`, `DISCORD_ROLE_*`, and the original `NEXT_PUBLIC_*` community values are legacy import inputs. Runtime server configuration comes from PostgreSQL. Keep `ADMIN_DISCORD_IDS` only as a tightly controlled bootstrap / recovery administrator allowlist; IDs in it retain global access even if a database role is removed. Removing a database-imported administrator also requires an operator to remove that row. Ordinary server managers cannot promote themselves to platform administrator.

## Using the interface

- Add a server: choose a Discord server or enter its Guild ID, install the shared bot, and select **Validate and add**. Discord installation itself never grants website access.
- Configure the community name, invite, manual UPI recipient, and payee. Add products with explicit role mappings and set colors under **Orders & products**.
- Add staff by Discord user ID: manager, payment reviewer, or viewer. Managers must retain Discord management privileges; all delegated staff must retain guild membership. Platform administrators have an explicit global override.
- Public storefronts use `/s/{internalId}`. The Guild ID remains unique and immutable. Duplicate names are allowed; the interface displays the Guild ID.
- Server switching uses full document navigation to avoid retaining a previous server's root theme or session-local UI state. Product links, checkout, order views, banner/member requests, and proof previews retain the URL's server context.
- Disable/archive requires confirmation and retains purchase history. New purchases and role delivery pause. Existing buyers can still submit evidence or read their orders, and reviewers can settle pending payment reviews. Re-enable explicitly before retrying role delivery. Archiving does not remove the bot from Discord.
- **Check bot access** reports HTTP access, Manage Roles and published-role validity, plus the check timestamp. It does not claim that a Gateway process is online.

## Security boundaries

All restricted handlers use `requireAccess`; middleware only supplies URL-derived context and overwrites spoofed tenant headers. Never use the selector, a session's cached role, or a caller-provided `serverId` payload as authorization. Queries use the current server ID. Global UTR/screenshot duplicate detection intentionally crosses tenant boundaries without returning another tenant's data.

Configuration/staff updates and successful audits commit together. Version checks reject conflicting server updates with HTTP 409. Product, theme, coupon, and payment decisions are audited. Denied assigned-scope access is recorded without request bodies or secrets. Upstream outages can prevent an audit write; errors do not imply that Discord side effects rolled back. Role delivery uses persisted state, leases, idempotent PUTs, and explicit retries.

Credentials stay outside browser responses, URL parameters, and logs. The shared bot credential remains in deployment secrets, not in `Server`. Its rotation affects every registered guild and requires deployment-secret rotation/redeployment. Rotating the OAuth encryption key invalidates stored grants and requires reconnecting. Database backups contain encrypted grants and sensitive payment evidence; restrict access and keep encryption keys separate.

Published roles must belong to the selected guild, be below the bot, and must not be managed/everyone or carry administrative permissions. Validation runs again at checkout and delivery. Discord state can still change after validation; failures leave payment approval intact and report failed delivery.

PostgreSQL coordinates conservative per-credential/per-route request spacing and Discord 429 cooldowns across application instances. No process-local background loop or Gateway client is required. Private proof uploads are limited to 3 MB to leave room below Vercel's request limit; private object storage remains a future improvement.

## Verification and recovery

Run `npm test`, `npm run typecheck`, `npm run test:integration`, and `npm run build`. Integration tests use only the isolated local test database and simulate Discord; they cannot prove real OAuth installation or live role delivery.

Before production launch, use two real test guilds to verify registration, role hierarchy, lost user permissions, bot removal, server switching, manual proof review, and role delivery. Confirm encrypted grants persist after restart and that no credential appears in network responses or logs. Configure database pooling and backups for the hosted database.

The local development migration backup is stored under ignored `.local/`. Do not restore it over a database with newer payments. For recovery, restore into a separate database and reconcile writes before cutover. Once multiple communities have data, rolling back to the old globally scoped application is unsafe; prefer a forward fix or a compatible release.
