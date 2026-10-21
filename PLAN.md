# Discord Community Platform — simple build plan

## Decisions

- This is a separate repository based on Discord-Package.
- Keep UPI payments, UTR submission, screenshots, and manual admin approval.
- Only an authorized admin can approve a payment. No payment gateway or automatic payment verification is planned.
- Automatic perk delivery may happen after manual approval.
- Host the application on Vercel.
- Build and verify the product first. Add the deployed URL and repository to the portfolio last.
- Current code is still single-server. Step 1 implementation is in progress; later steps are planned.

## 1. Finish the current purchase flow

- Let an admin approve or reject a submitted payment.
- Prevent repeated approvals or conflicting review decisions.
- After approval, grant the purchased Discord role.
- Show payment approval and perk delivery separately.
- Let an admin retry delivery if Discord is unavailable.
- Let admins create discount coupons and let members apply one at checkout.
- Show the original price, discount, and final UPI payment amount to members and reviewers.

Done when: a manually approved purchase delivers its role, and retrying does not duplicate benefits.

Implementation added: conditional payment reviews, separate role delivery status,
Discord role assignment, recoverable delivery leases, admin retries, and buyer status messages.
Live validation needs a PostgreSQL database and real Discord bot/member/role configuration.
Update: an isolated local PostgreSQL database is configured and all three migrations
have been applied. Database-backed purchase and concurrency tests pass; Discord calls
and authentication are simulated in those tests. Real Discord delivery remains to be verified.
Only the plan role is automated in this milestone; other benefits still need staff setup.

## 2. Track memberships

- Save when each benefit starts and ends.
- Show the member their active plan and remaining time.
- Remove expired benefits safely.
- Let members renew through the same manual payment process.
- Define what happens when a member renews before expiry.

Done when: a member can buy, view, renew, and expire a membership correctly.

## 3. Support multiple servers

- Let an authorized owner connect a Discord server.
- Give each server its own storefront, plans, payment details, and staff.
- Keep orders and payment screenshots private to the buyer and that server's authorized staff.
- Check bot permissions before a server starts selling.

Done when: two servers operate independently, and neither server's admins can access the other's private data.

## 4. Add customization and useful admin tools

- Let owners edit branding, plans, prices, durations, and role rewards.
- Add order search, review history, rejection reasons, and delivery retry controls.
- Keep a record of important staff actions.
- Support only benefits that the application can actually deliver.

Done when: an owner can configure and operate a community without changing code.

## 5. Prepare and deploy on Vercel

- Use hosted PostgreSQL for persistent data.
- Use private object storage for payment screenshots.
- Use versioned database migrations separately from application builds.
- Store credentials in environment settings.
- Keep development login disabled in production.
- Use short, authenticated scheduled requests to process saved delivery jobs and expiries.
- Save job progress in the database; do not rely on a continuously running process inside Vercel.
- Make repeated job runs safe and prevent two runs from claiming the same work.
- Check the chosen Vercel plan's current scheduling and execution limits before setting the schedule.
- Test manual checkout, access controls, expiry, and delivery recovery before launch.

Done when: the hosted application survives retries and restarts, protects each server's data, and completes the purchase lifecycle.

## 6. Add to the portfolio — last

- Add the working Vercel URL and GitHub repository.
- Briefly explain the problem, features, and technical decisions.
- Add screenshots or a short demo only after the product is ready.

## Repository status

The local repository has been created. GitHub publication and Vercel deployment have not happened yet.
The original GitHub Pages workflow is intentionally excluded from this new repository because the target is a server-backed Vercel application.
