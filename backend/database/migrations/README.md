# ApproveFlow Database Migrations

Database schema changes are managed through version-controlled SQL migrations.

## Naming Convention

Migration files use the following format:

`NNN_description.sql`

Examples:

- `001_create_users.sql`
- `002_create_requests.sql`
- `003_create_audit_events.sql`

The numeric prefix determines migration execution order.

## Principles

- Each migration represents one logical schema change.
- Migrations are committed to Git.
- Applied migrations must be tracked so they are not executed twice.
- Migrations should be reproducible on a fresh database.
- Schema changes must preserve application data unless data migration is explicitly required.
- Migration SQL should be reviewed before being applied.

## Current Scope

Sprint 1 will introduce the minimum database schema required for:

- User authentication
- Requester authorization
- Request creation
- Request submission

Additional domain tables will be introduced through subsequent migrations as functionality enters scope.
