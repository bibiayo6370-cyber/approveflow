# ADR-009: Enforce Business Rules in the Service Layer

**Status:** Accepted
**Date:** 31 August 2026

## Context

ApproveFlow implements a business approval workflow in which operations are governed by rules and state transitions.

Examples include:

- Only authenticated users may create requests.
- Only authorized users may perform restricted operations.
- Only a `DRAFT` request may be submitted.
- A requester may only submit their own request.
- Future approval and finance operations will depend on the current workflow state.

These rules must not depend on the frontend because clients cannot be treated as trusted security boundaries.

They should also not be embedded primarily within HTTP controllers because controllers should remain focused on transport concerns.

## Decision

ApproveFlow will enforce application business rules within the **service layer**.

The expected request-processing flow is:

```text
HTTP Request
     ↓
Route
     ↓
Controller
     ↓
Service ← Business Rules
     ↓
Repository
     ↓
PostgreSQL
```

Controllers will translate HTTP requests into application operations and translate application results into HTTP responses.

Services will coordinate business operations and enforce domain/application rules.

Repositories will encapsulate persistence operations.

## Rationale

The service-layer approach provides:

- Separation of Concerns
- Independently testable business rules
- Thin HTTP controllers
- Reusable application logic
- Clear boundaries between transport, business logic, and persistence
- A consistent location for workflow state-transition rules

For example, the rule:

```text
Only DRAFT requests may be submitted.
```

will be enforced by the request service rather than relying on the React interface to prevent invalid submissions.

## Alternatives Considered

### Controllers

Rejected because placing business rules directly in controllers can produce large, difficult-to-test HTTP handlers and tightly couples business logic to the transport layer.

### Database

Rejected as the primary location for application business rules because not all workflow rules are persistence constraints. Business behaviour should remain explicit in the application domain/service layer while the database continues to enforce appropriate data-integrity constraints.

## Consequences

### Positive

- Business rules can be unit tested independently of HTTP
- Controllers remain lightweight
- Workflow logic has a clear home
- Rules can be reused by different API endpoints
- Easier future evolution of the application

### Negative

- Introduces additional application layers
- Requires developers to maintain clear responsibilities between controllers, services, and repositories
- Some simple operations may require more structure than a direct controller-to-database implementation

## Architectural Constraint

Controllers must not bypass the service layer for business operations.

Repositories must not contain application workflow decisions that belong to the service/domain layer.

The database remains responsible for appropriate data-integrity constraints.

## Reassessment Trigger

This boundary should be reconsidered if future architectural changes introduce a dedicated domain layer or another architecture in which business rules require a different explicit boundary.
