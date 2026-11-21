# G1 authentication contract

## Design

The authentication module follows the agreed route → controller → service → repository layering. bcryptjs hashes and verifies passwords; jsonwebtoken signs short-lived bearer tokens. JWT verification also reads the current user record, so disabled accounts lose access before the JWT expiry.

No request, approval, finance, or workflow endpoint is implemented in G1.

## API

### `POST /api/auth/login`

Request:

```json
{ "email": "person@example.com", "password": "password" }
```

Success (`200`):

```json
{
  "token": "signed JWT",
  "tokenType": "Bearer",
  "expiresIn": "1h",
  "user": { "id": "uuid", "firstName": "…", "lastName": "…", "email": "person@example.com", "role": "REQUESTER" }
}
```

Malformed input returns `400 VALIDATION_ERROR`. Unknown email, bad password, and inactive account all return the same `401 INVALID_CREDENTIALS` response. Password hashes are never returned.

### `GET /api/auth/me`

Requires `Authorization: Bearer <JWT>`. It returns the authenticated current user (`200`), or `401` for missing, malformed, expired, invalid, or disabled-user tokens.

`requireRole('REQUESTER')` and `requireRole('APPROVER')` are reusable server-side middleware for future G2 routes; denied access returns `403 FORBIDDEN`.

## Controlled demo accounts

Run the explicit seed command only in a non-production environment, supplying passwords through the process environment:

```powershell
$env:CONFIRM_DEMO_SEED='true'
$env:DEMO_REQUESTER_PASSWORD='<at least 12 characters>'
$env:DEMO_APPROVER_PASSWORD='<at least 12 characters>'
cd backend
npm run seed:demo
```

It creates the fixed local demonstration identities only if absent, bcrypt-hashes the supplied passwords, and refuses production execution. Never put those passwords in source control or logs.
