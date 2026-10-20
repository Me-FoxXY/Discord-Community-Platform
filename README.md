# Discord Community Platform

A separate successor to Discord-Package, planned for multiple Discord communities and Vercel hosting.

**Status:** this repository currently contains the original single-server application as a starting point. Multi-server features and Vercel deployment are not complete.

**Payments stay manual:** buyers pay through UPI and submit their UTR and screenshot. An authorized admin verifies and approves or rejects the payment.

See [PLAN.md](PLAN.md) for the simple build order. Portfolio presentation is the final step.

The inherited documentation below describes the original project and needs updating during implementation: the current schema uses PostgreSQL and payment screenshots are stored as Base64 in the database, despite the older SQLite and disk-upload descriptions.

---

## Original project: Verdanta — Premium Discord Perks Store

A premium, **nature-inspired** storefront for selling Discord perks and memberships, built with Next.js. Bright, fresh, and elegant — a modern SaaS feel rather than a dark neon gaming shop.

- 🌿 Nature-premium design system (emerald / forest / sage / mint / teal / sky) with glassmorphism, soft shadows, and rich motion
- 🎬 GIF hero banner + animated ambient backdrop (aurora, floating leaves, topography)
- 🔐 **Real Discord OAuth** (Auth.js) — login required to purchase; orders tied to the buyer's Discord account
- 💳 Manual **UPI checkout**: QR + UTR + screenshot, with an **admin approval queue** and **UTR de-duplication** anti-fraud
- 🛒 Landing, Shop, per-plan product pages, Community, Checkout, Order status, Admin dashboard
- ♿ Accessible (keyboard nav, focus rings, `prefers-reduced-motion`) and SEO-ready (metadata, sitemap, robots, JSON-LD, OG image)

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Auth.js (NextAuth v5) · Prisma + SQLite · lucide-react · SWR · Zod.

## Getting started

```bash
npm install          # installs deps + generates Prisma client
cp .env.example .env  # then fill in values (see below)
npm run db:push       # creates the SQLite database
npm run dev           # http://localhost:3000
```

### Environment (`.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite path, e.g. `file:./dev.db` |
| `AUTH_SECRET` | Session secret — generate with `npx auth secret` |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` | Discord OAuth app credentials (leave blank to use Dev Login locally) |
| `DISCORD_GUILD_ID` | Enables the live member count (requires Server Widget enabled) |
| `NEXT_PUBLIC_DISCORD_INVITE` | Invite link for "Join Discord" buttons |
| `ADMIN_DISCORD_IDS` | Comma-separated Discord user ids allowed into `/admin` |
| `NEXT_PUBLIC_UPI_ID` / `NEXT_PUBLIC_UPI_PAYEE_NAME` | UPI payee details for the QR / intent |

### Discord OAuth setup

1. Create an app at <https://discord.com/developers/applications>.
2. **OAuth2 → Redirects**, add: `http://localhost:3000/api/auth/callback/discord`.
3. Copy the Client ID / Secret into `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET`.
4. Put your own Discord user id in `ADMIN_DISCORD_IDS` to access `/admin`.

**Dev Login:** with no Discord credentials set (and in development), a mock "Dev Login" is available on `/login` so you can test the login-gated checkout and admin flows immediately. Its user id is `000000000000000000` (already in the sample `ADMIN_DISCORD_IDS`).

## How the payment flow works

1. A logged-in buyer picks a plan → an order is created, tied to their Discord id (from the server session — not client input).
2. They pay via UPI (QR / UPI ID) and submit their **12-digit UTR** + a **screenshot**.
3. The order enters **`pending_review`** and appears in **`/admin`**.
4. An admin views the screenshot and **approves/rejects**. Only on approval are perks granted (see the `onOrderApproved` hook in `lib/orders/store.ts`).

**Anti-fraud:** the `utr` column is unique, so a payment reference can never be re-used across orders; a re-used screenshot (same hash) flags the order. Manual screenshot flows can't be made 100% fraud-proof — for full elimination, wire the `RazorpayProvider` (`lib/payments/provider.ts`) for server-verified confirmation.

## Project structure

```
app/            routes: landing, shop, shop/[slug], community, checkout, order/[id], admin, login, legal, api/*
components/     ui/ (primitives) · sections/ · layout/ · shop/ · admin/ · order/ · decor/ · icons/
config/         site.ts · plans.ts · content.ts   ← single source of truth for branding/content
lib/            auth · orders/store · payments/provider · qr · motion · utils · prisma
prisma/         schema.prisma (Order model)
```

## Going to production

- **Database:** swap the Prisma datasource from SQLite to Postgres.
- **Uploads:** screenshots are stored on local disk under `./uploads` and served via a gated route. Move to object storage (S3/R2) with signed URLs.
- **Payments:** implement `RazorpayProvider` for server-verified UPI/card payments to remove manual verification.
- **Perks:** implement the `onOrderApproved` hook to call your Discord bot and assign roles/perks.
- Replace placeholder branding in `config/*` and the hero GIF in `public/hero-banner.gif`.

## Scripts

`npm run dev` · `npm run build` · `npm run start` · `npm run db:push` · `npm run db:studio`
