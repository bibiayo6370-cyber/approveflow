# ADR-002: Adopt Node.js and Express for the Backend

**Status:** Accepted
**Date:** 31 August 2026

## Context

ApproveFlow requires a backend API capable of authentication, authorization, request management, workflow processing, and persistence.

The development team requires a technology stack that supports modern API development, testing, containerization, and future DevOps practices.

## Decision

ApproveFlow will use:

- Node.js
- Express

The backend will expose a REST API.

## Rationale

Node.js allows the project to use a common programming language across the frontend and backend.

This reduces context switching between application layers and provides a consistent ecosystem that can be useful when working with future full-stack or DevOps-oriented engineering teams.

Express provides a lightweight and widely adopted framework for implementing HTTP APIs without imposing unnecessary architectural abstractions.

Node.js and Express also integrate cleanly with container-based development and deployment.

## Alternatives Considered

### Python + FastAPI

A strong API option, but would introduce a separate primary programming language into the application stack.

### NestJS

Provides stronger framework conventions but introduces additional abstraction that is not necessary for the MVP.

## Consequences

### Positive

- Common JavaScript/TypeScript ecosystem across application layers
- Large package ecosystem
- Straightforward REST API implementation
- Good Docker compatibility
- Low framework overhead

### Negative

- Architectural discipline must be maintained by the team
- Express provides fewer built-in conventions than more opinionated frameworks

## Reassessment Trigger

The backend framework should be reconsidered if application complexity or team requirements justify a more opinionated framework.
