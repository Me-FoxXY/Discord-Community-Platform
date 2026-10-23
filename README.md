# Discord Community Platform

A separate successor to Discord-Package. Payments remain manual: members pay through UPI, submit their UTR and screenshot, and an admin approves or rejects the payment.

## Current milestone

The single-server purchase flow now separates payment approval from Discord role delivery:

- Only orders with submitted proof awaiting review can be approved or rejected.
- An approved order saves pending delivery before contacting Discord.
- Role delivery uses Discord's role-add PUT endpoint. Repeating delivery does not create duplicate roles.
- A database lease prevents simultaneous attempts on the same order. An interrupted attempt can be retried after 60 seconds.
- Failed deliveries retain the approved payment and show an admin retry action with a cooldown.
- The buyer sees role delivery separately from payment status.

Only the configured plan role is automated. XP boosts, personal roles/channels, membership expiry, multi-server support, and scheduled processing are future milestones. Existing plan descriptions are inherited product content; do not launch sales until the advertised benefits are supported or fulfilled by staff.

See [PLAN.md](PLAN.md) for the build order. Vercel is the hosting target; portfolio presentation comes last.

## Coupons and payment discounts

In `/admin`, use **Coupons & discounts** to create a percentage or fixed-rupee coupon.
Choose all plans or one plan, an optional minimum price, and an optional expiry time.
Disable a code to stop it being used on new orders.

At checkout, members enter a code and select **Apply**. The summary shows the original
price, savings, and final payable amount. The UPI link and QR use that final amount.
The order and admin review screen retain the same price breakdown.
Payment verification remains manual.

- Codes are case-insensitive and reusable, with no redemption limit.
- One coupon per order; discounts cannot be combined.
- Prices currently use whole rupees. Percentage savings round down: 10% off ₹49 saves ₹4, leaving ₹45.
- A coupon must leave at least ₹1 payable; free orders are not supported.
- Coupons are checked again when the order is created. Disabling or expiring a coupon
  does not change the price of an order already created.
- Existing orders keep their original amounts when the coupon migration is applied.
- Apply the new database migration with `npm run db:migrate` before using this feature.

## Local setup

On this Windows workstation, run `npm run db:local` to start the isolated development
database using the installed PostgreSQL 18 binaries. It listens only on
`127.0.0.1:55432` and updates only `DATABASE_URL` in `.env`. Existing database services
are not changed. Database files, generated credentials, and the original environment
backup stay in the ignored `.local/` folder. Use `npm run db:local:stop` to stop it.
This is a development helper; Vercel still needs a hosted PostgreSQL connection.

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env` and supply a PostgreSQL database URL and Auth.js secret.
3. On a **new, empty database**, run `npm run db:migrate`.
4. Run `npm run dev`.

For an existing database created with `db push`, first back it up and check that it matches the baseline migration. Mark only that baseline as applied with `npx prisma migrate resolve --applied 202610200001_baseline`, then run `npm run db:migrate`. Do not run the baseline CREATE TABLE statements against an existing Order table.

Builds no longer change the database. Run migrations explicitly as a deployment step.

## Discord configuration

- Set `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET` for member sign-in.
- Add `/api/auth/callback/discord` on your local or deployed origin to the OAuth redirect URLs.
- Set `ADMIN_DISCORD_IDS` to the IDs of trusted reviewers.
- Set `DISCORD_GUILD_ID`, `DISCORD_BOT_TOKEN`, and each plan's `DISCORD_ROLE_*` variable.
- Install the bot in that server with Manage Roles. Its highest role must be above the roles it grants.
- The buyer must already be a member of the server.
- Keep the bot token private; never use a NEXT_PUBLIC variable for it.

Development login works only with `NODE_ENV=development`. Its mock identity cannot receive real Discord roles. Use a real Discord login for an end-to-end role delivery test.

Role targets are saved on the first configured delivery attempt and reused on retries. Changing the environment afterwards does not silently redirect an existing attempt to a different role or server.

## Verification checklist

Run `npm test` for automated tests, `npm run typecheck` for TypeScript checks, and `npm run build` for the production build. The build downloads Google Fonts and needs network access. No database migration runs during the build.

- Submit proof, approve once, and verify the role in Discord.
- Try reviewing the same order again: expect HTTP 409.
- Reject a different order: no role delivery should happen.
- Remove bot permissions: payment stays approved, delivery fails visibly.
- Restore permissions and retry after cooldown: role delivery succeeds.
- Confirm that another buyer cannot view the order or screenshot.

`npm test` runs the fast mocked tests. `npm run test:integration` applies migrations
to the isolated `discord_community_test` database and tests real database writes,
discounted checkout, manual proof review, concurrent approvals, delivery leases,
and UTR uniqueness. The integration runner never uses the application database URL
from `.env`, and removes only records created by that test run. Discord calls and
authentication are simulated; actual Discord OAuth and role delivery still require
configured credentials and a live test.

The role integration follows Discord's [Add Guild Member Role](https://docs.discord.com/developers/resources/guild#add-guild-member-role) endpoint and [rate-limit responses](https://docs.discord.com/developers/topics/rate-limits).

## Hosting and remaining work

Use a Vercel server deployment and hosted PostgreSQL, not GitHub Pages. Current payment screenshots are Base64 data in PostgreSQL behind an authenticated route; private object storage is planned. Current retries are admin-triggered, not a scheduled worker. Cross-order/global Discord throttling is still needed before scaling delivery to multiple communities.

No GitHub publication or Vercel deployment has happened yet.

## Products, colors, and the server banner

1. Apply migrations with `npm run db:migrate`. The original three plans are copied into the product catalog automatically.
2. Sign in with a Discord account listed in `ADMIN_DISCORD_IDS`, then open `/admin`.
3. Under **Products & appearance**, choose an existing product to edit or choose **Add a new product**. Set its price, duration, description, benefits, and Discord role ID. Publish it when ready.
4. Uncheck **Published in shop** to stop new purchases. Existing orders keep their saved price and configured role target. New products require a role ID before publication; original plans can still use their environment role settings.
5. Choose primary and accent colors and click **Save colors**. Visitors receive the saved theme. Bright colors are darkened for readable button labels.
6. Set `DISCORD_GUILD_ID` and `DISCORD_BOT_TOKEN` and install the bot in that server. The homepage reads its Discord banner, including animated GIF banners, automatically. Missing banners or Discord errors show a themed placeholder. Updates may take about five minutes.

Payments still require manual verification. Product duration describes the offer; automatic role expiry is not implemented. This version remains one configured server per deployment; shared multi-server tenancy is future work.

For local admin UI testing only, run PowerShell with `$env:ADMIN_DISCORD_IDS='000000000000000000'` before `npm run dev`, then use Dev login. This override lasts for that terminal process. Never add this mock ID to production settings. Stop that process and use a fresh terminal afterwards.

### Banner troubleshooting

A server ID alone is not enough for the authenticated banner lookup. Set `DISCORD_BOT_TOKEN` to the token of a bot installed in the server identified by `DISCORD_GUILD_ID`. Restart `npm run dev` after editing `.env`, or redeploy after changing Vercel environment variables. The server must have an actual Discord server banner; an icon or invite background is a different image.

Open Admin → Products & appearance → Discord connection to see whether the bot is missing, invalid, cannot access the server, or the server has no banner. The default is a bundled Verdanta animated GIF, with a still poster for reduced motion. Member counts are fetched from Discord approximately once a minute; unknown counts display a dash instead of sample numbers. Demo statistics, ratings, staff, testimonials, and event entries are no longer presented as real data.
