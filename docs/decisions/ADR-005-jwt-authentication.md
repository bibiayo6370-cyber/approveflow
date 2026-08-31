# ADR-005: Adopt JWT-Based Authentication

**Status:** Accepted
**Date:** 31 August 2026

## Context

ApproveFlow contains multiple user roles and protected business operations.

The API must be able to establish the identity of a user and determine whether that user is authorized to perform a requested operation.

## Decision

ApproveFlow will use **JSON Web Tokens (JWT)** for API authentication.

A successfully authenticated user will receive a signed token that is presented when accessing protected API resources.

Authorization will remain separate from authentication and will be enforced through server-side middleware and business rules.

## Rationale

JWT provides a stateless authentication mechanism that fits well with a REST API.

It also provides a clear separation between:

```text
Authentication
      ↓
Who are you?
      ↓
Authorization
      ↓
What are you allowed to do?
```

The approach is straightforward to implement, test, containerize, and demonstrate.

## Alternatives Considered

### Server-Side Sessions

Rejected for the MVP because JWT provides a simpler stateless API model and avoids introducing a separate session-storage dependency.

### External Identity Provider

Rejected because the MVP does not currently require external identity management and implementing the core authentication boundary internally provides stronger engineering evidence.

## Consequences

### Positive

- Stateless API authentication
- Straightforward integration with REST endpoints
- Easy automated testing
- Clear authentication/authorization separation

### Negative

- Token expiry and lifecycle must be handled correctly
- Token storage and transmission require secure implementation
- Revocation is more complex than traditional server-side sessions

## Security Considerations

- Passwords must never be stored in plaintext.
- Tokens must be signed using a secure secret.
- Secrets must not be committed to source control.
- Protected operations must validate the token server-side.
- Authentication alone must not grant authorization.

## Reassessment Trigger

The authentication architecture should be reconsidered if enterprise requirements introduce centralized identity management, SSO, MFA, or an organizational identity provider.
