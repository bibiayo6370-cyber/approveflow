# Render G1 readiness

## Backend environment

Set these service environment variables in Render; do not commit values:

- `NODE_ENV=production`
- `PORT` (Render normally supplies this)
- `DATABASE_URL` (the Render PostgreSQL connection string)
- `DB_SSL=true` only when using a TLS-required external connection
- `DB_SSL_REJECT_UNAUTHORIZED=true` when the provider chain is publicly trusted; set `false` only after reviewing Render's certificate guidance
- `JWT_SECRET` (a unique, high-entropy secret of at least 32 characters)
- `JWT_EXPIRES_IN=1h` (or a reviewed equivalent)

Use build command `npm ci` and start command `npm start` from the `backend` directory. `npm start` reads provider-supplied environment variables directly; it does not require a checked-in `.env` file.

## Safe hosted migration procedure

1. Provision the Render PostgreSQL instance and capture its internal connection string in Render's secret environment settings.
2. Back up or snapshot the target database according to the selected plan.
3. Set `HOSTED_DATABASE_NAME` to the exact approved database name from the connection URL and `CONFIRM_HOSTED_MIGRATION=true` only in the one-off job.
4. In a one-off Render shell/job with the same environment variables, run `npm run migrate:hosted`. The command refuses non-production, local `DB_*` settings, missing confirmation, URL-name mismatch, or a `current_database()` mismatch before any write.
5. Confirm migration history and `/health` point to the intended service.
6. Deploy the backend only after migration verification. To provision synthetic accounts once, set runtime-only `HOSTED_SARAH_PASSWORD`, `HOSTED_MARK_PASSWORD`, `HOSTED_DATABASE_NAME`, and `CONFIRM_HOSTED_DEMO_PROVISION=true`, then run `npm run provision:hosted-demo`. Existing identities are left unchanged and passwords are never output.

Provisioning is idempotent, not a two-account transaction: if a process fails after creating one identity, rerun the same guarded command after investigating the failure; the existing synthetic identity is skipped and the missing one can be created. Migration recovery remains a controlled manual operation: stop on any failed migration, review the provider backup/recovery options, and do not rerun against an uncertain target.

## Vercel frontend

Set Vercel root directory to `frontend`, build command to `npm run build`, and `VITE_API_BASE_URL` to the deployed API root. `vercel.json` rewrites direct SPA paths such as `/requests/:id` to `index.html`.

## Stop conditions and boundaries

Stop if the hosted URL path, `HOSTED_DATABASE_NAME`, or `current_database()` differs from the approved target. Do not execute G4-C deployment, G4-D production smoke testing, or G4-E rollback work without separate authorization. Backup, recovery, plan selection, and rollback execution remain manual provider responsibilities.

Do not use the local test `.env.test` or demo seed passwords in Render. This repository does not provision, deploy, or select a paid Render plan.
