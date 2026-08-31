# ADR-004: Adopt PostgreSQL for Persistent Data

**Status:** Accepted
**Date:** 31 August 2026

## Context

ApproveFlow manages structured business entities including users, requests, workflow states, and audit events.

The application requires reliable state transitions and consistent relationships between these entities.

## Decision

ApproveFlow will use **PostgreSQL** as its primary database.

## Rationale

PostgreSQL provides strong transactional integrity and ACID guarantees that are appropriate for business approval workflows.

The relational model also provides a natural representation of relationships between entities through primary keys and foreign keys.

The database is therefore well suited to modelling:

```text
User
  │
  └──< Request
          │
          └──< AuditEvent
```

Transactional behaviour is particularly important when workflow state changes must remain consistent with associated records.

## Alternatives Considered

### MongoDB

Rejected for this project because the approval workflow is dominated by structured relationships and transactional business state.

### SQLite

Rejected as the primary deployment database because the project is intended to demonstrate a deployable business application rather than a local-only prototype.

## Consequences

### Positive

- Strong transactional guarantees
- ACID compliance
- Explicit relational modelling
- Foreign-key integrity
- Mature ecosystem
- Strong querying capabilities

### Negative

- Requires relational schema design
- Schema changes require controlled migrations
- More upfront modelling than a schemaless database

## Reassessment Trigger

The database strategy should be reconsidered if future requirements introduce fundamentally different data-storage patterns that cannot be efficiently supported by the relational model.
