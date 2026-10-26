# Security

## Reporting a vulnerability

Do not post credentials, payment screenshots, OAuth grants, or exploit details in public issues. Use the repository's GitHub **Security → Report a vulnerability** option if available. If it is unavailable, contact the maintainer through an existing private channel to arrange a secure report; this repository does not publish a dedicated security email or response-time guarantee.

Include the affected commit, reproduction steps using synthetic data, expected versus actual authorization behavior, and impact. Never test against another community's data without permission.

## Security model

Website administrators have broad platform access; Discord owners/managers must request onboarding. Server-scoped staff access is checked in backend handlers. A selected server or a hidden button is not proof of permission.

The shared bot token, database credentials and application keys belong in deployment secrets. OAuth access grants are encrypted in the database with a separately stored key. They are not returned to the browser. Key rotation requires Discord reconnection; bot-token rotation affects all communities using that bot.

Manual payment review remains mandatory. Payment evidence currently resides in PostgreSQL and is exposed only through authorized routes. Restrict database and backup access accordingly.

## Operational boundaries

Only the current development line is maintained; there is no formal long-term security support policy. Automated tests simulate Discord and do not replace live permission/recovery checks. See MULTI_SERVER.md for migration, backup and credential-rotation procedures.
