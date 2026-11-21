# G1 authentication testing

## Isolation contract

Database-writing tests run only through `npm test`, which loads `backend/.env.test`. In test mode, the database module rejects any `DATABASE_URL`, requires `DB_NAME=approveflow_test`, and accepts only `localhost`, `127.0.0.1`, or `::1` as `DB_HOST`. The integration test also asserts the exact expected identity (`approveflow_test`) before issuing `TRUNCATE` or inserts.

`npm run migrate:test` has a stricter migration-only guard. It requires `NODE_ENV=test`, requires `DB_NAME=approveflow_test`, rejects any inherited `DATABASE_URL`, then queries `current_database()` and requires the connected database to be exactly `approveflow_test`. This happens before `schema_migrations` is created or any migration file is read/applied.

Prepare the local test database once, after verifying the local container and development database:

```powershell
docker exec approveflow-postgres createdb -U approveflow approveflow_test
cd backend
npm run migrate:test
npm test
```

Never run the schema or auth integration tests through the development `.env`.

## Coverage

- successful login with bcrypt password verification
- generic failure for unknown, inactive, and wrong-password accounts
- missing, malformed, and expired JWTs
- active-user check on token use
- Requester and Approver authorization middleware

## Expected evidence

The test run must show `current_database()` as `approveflow_test` before database-writing tests are considered valid. Keep development data in `approveflow` separate and untouched.
