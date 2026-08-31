# ADR-006: Adopt REST for the Application API

**Status:** Accepted
**Date:** 31 August 2026

## Context

ApproveFlow requires communication between the React frontend and backend application modules.

The API must support authentication, request management, workflow operations, and future finance and audit capabilities.

## Decision

ApproveFlow will expose a **RESTful HTTP API** using JSON representations.

Initial endpoints will follow resource-oriented conventions.

Examples include:

```text
POST /api/auth/login
POST /api/requests
GET  /api/requests
GET  /api/requests/:id
POST /api/requests/:id/submit
```

## Rationale

REST is well understood, straightforward to test, and appropriate for the relatively simple resource and workflow interactions in ApproveFlow.

It also provides a clean boundary between the React frontend and backend application.

## Alternatives Considered

### GraphQL

Rejected because the application's initial data-access requirements are straightforward and do not justify GraphQL's additional schema and query complexity.

### tRPC

Rejected because it introduces stronger coupling between the TypeScript client and server than required by the current architecture.

## Consequences

### Positive

- Simple client/server boundary
- Familiar HTTP semantics
- Easy API testing
- Straightforward integration with frontend and external tools
- Clear resource-oriented endpoints

### Negative

- API versioning will need consideration as the system evolves
- Multiple requests may sometimes be required to retrieve related resources

## Reassessment Trigger

The API approach should be reconsidered if client data requirements become sufficiently complex to justify GraphQL or another API interaction model.
