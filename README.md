# JanSeva

JanSeva is an independent public-grievance portal prototype with a static citizen interface, a Cloudflare Worker API, and persistent D1 storage. It is not affiliated with a government department.

## Production architecture

- Cloudflare Workers serves the API and static application as one deployment.
- Cloudflare D1 stores grievances and status history.
- Officer routes require a signed, HTTP-only session cookie.
- Public submissions use strict validation, a honeypot, same-origin enforcement, body limits, and privacy-preserving rate limits.
- Public tracking returns case details and status history but never returns citizen contact fields.
- Security headers are defined in `janseva-premium/_headers`.

## Local development

1. Install dependencies with `npm ci`.
2. Copy `.dev.vars.example` to `.dev.vars` and replace every example secret.
3. Apply the local database migration with `npm run db:migrate:local`.
4. Start the application with `npm run dev`.
5. Open the local URL printed by Wrangler.

Run `npm test` and `npm run check` before deployment.

## Cloudflare deployment

1. Create the D1 database: `npx wrangler d1 create janseva-production`.
2. Put the returned database ID in `wrangler.jsonc`.
3. Apply migrations: `npm run db:migrate:remote`.
4. Store `ADMIN_PASSWORD`, `SESSION_SECRET`, and `RATE_LIMIT_SALT` as encrypted Worker secrets.
5. Deploy with `npm run deploy`.

Never commit `.dev.vars`, production passwords, tokens, or generated deployment credentials.

## Operational notes

- The officer dashboard is protected by one shared password and should be upgraded to named identities and role-based access before use by a real department.
- The free Cloudflare plan has usage limits. Monitor D1 and Worker analytics before inviting broad public traffic.
- Limit submissions to non-sensitive civic issue information. The optional name and phone fields are visible only to authenticated officers.
