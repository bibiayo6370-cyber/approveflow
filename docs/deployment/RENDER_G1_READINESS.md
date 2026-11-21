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

Use build command `npm ci` and start command `npm start` from the `backend` directory.

## Safe hosted migration procedure

1. Provision the Render PostgreSQL instance and capture its internal connection string in Render's secret environment settings.
2. Back up or snapshot the target database according to the selected plan.
3. In a one-off Render shell/job with the same environment variables, run `npm run migrate`.
4. Confirm migration history and `current_database()` point to the intended hosted database.
5. Deploy the backend only after migration verification; then call `/health` and authenticate with controlled demo accounts if seeded.

Do not use the local test `.env.test` or demo seed passwords in Render. This repository does not provision, deploy, or select a paid Render plan.
