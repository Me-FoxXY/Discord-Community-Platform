# Contributing

## Start with the current behavior

Read the README and multi-server operations guide. Use Node.js 22 and `npm ci`; keep the lockfile committed. Store local credentials in ignored `.env`, never in source or screenshots.

Create a descriptive branch from the appropriate base, such as `fix/server-selector-loading` or `feature/membership-renewal`. After a PR is opened, put unrelated follow-up changes on another branch. If work depends on an unmerged PR, state that dependency explicitly.

## Keep changes focused

- Preserve manual payment verification, historical prices and saved role targets.
- Enforce authorization on backend operations and scope private queries to the server.
- Reuse existing UI components, custom dropdowns, theme variables and loading/error patterns.
- Keep schema changes in a new migration; never rewrite an applied migration.
- Avoid dependency upgrades or repository-wide formatting unrelated to the change.
- Update documentation when setup, routes, permissions or behavior change.

## Verify before requesting review

Run `npm test`, `npm run typecheck`, and `npm run build`. For database, authorization, onboarding or order changes, also run `npm run test:integration` using the isolated local test database described in the README. Never point tests at production.

Check modified pages at desktop and mobile sizes, keyboard navigation, empty/error/loading states and the current community context. Report what was actually checked and any limits; simulated Discord tests do not prove live role delivery.

## Pull requests

Use the PR template. Describe the user-visible problem and final behavior, include migration/deployment instructions, and record validation. Include redacted screenshots for visual changes when practical. Keep credentials, payment evidence and local database files out of commits.

Maintainers decide software licensing separately. Do not add or change a license without the repository owner's approval. Keep existing media attribution intact.
