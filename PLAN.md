# Roadmap

This repository evolves Discord-Package into a reusable Discord community storefront. Payments remain manually verified. Vercel is the hosting target; adding the live project to the portfolio is the final milestone.

## 1. Purchase workflow — implemented, live validation required

- UPI payment, UTR and private screenshot submission.
- Staff approval/rejection with separate Discord delivery status.
- Coupons, saved order prices, concurrency protection and delivery retries.
- Before launch: verify real payment review and role assignment in a test guild.

## 2. Membership lifecycle — planned

- Track activation and expiry; show remaining time.
- Define renewal and overlapping-purchase rules.
- Remove expired benefits safely with repeatable background jobs.
- Product duration currently describes the offer; it does not schedule expiry.

## 3. Multiple communities — implemented, live validation required

- Discord managers request onboarding; website administrators approve or reject.
- Separate storefronts, products, payment settings, staff and purchase history.
- Backend permission checks, encrypted discovery grants and audit records.
- Before launch: exercise two real guilds, revoked access, bot removal and recovery.

## 4. Management experience — implemented foundations

- Editable catalogs, role mappings, colors, coupons and community settings.
- Named community selector, request history, review queue and custom dropdowns.
- Follow-ups: paginate request history/review queues, improve operational reporting, and add focused usability improvements from real testing.

## 5. Deployment and operations — planned

- Hosted PostgreSQL with pooling, verified backups and controlled migrations.
- Private object storage for evidence; authenticated scheduled delivery/expiry jobs.
- Operational alerts and retry/recovery checks under Vercel execution limits.
- Revalidate live OAuth, permissions and the purchase lifecycle before public sales.

## 6. Portfolio presentation — last

- Publish a verified Vercel URL alongside this GitHub repository.
- Add current screenshots or a short demo with no private customer data.
- Explain the problem, design choices, tradeoffs and test evidence honestly.

GitHub publication is established. A verified live deployment is not yet documented. Use [README.md](README.md) for setup and [MULTI_SERVER.md](MULTI_SERVER.md) for upgrades and operations.
