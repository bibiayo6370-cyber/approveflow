# ApproveFlow System Architecture

**Status:** Approved
**Version:** 1.0
**Date:** 1 September 2026

---

## 1. Purpose

This document defines the technical architecture for ApproveFlow, a business process approval application designed to replace informal and poorly traceable approval processes with a structured digital workflow.

The architecture is based on the business scenario **"The Wrong Laptops"**, in which an undocumented approval process resulted in delays, communication failures, financial processing problems, and an incorrect purchase.

The architecture is intentionally designed for an MVP while providing clear boundaries for future evolution.

---

## 2. Business Problem

XYZ Logistics Corp requires five high-performance laptops costing ₦4,500,000 for a major project.

The existing approval process relies on:

- Email
- Verbal approval
- Physical signatures
- Informal messaging
- Manual interpretation of requests

These mechanisms create risks including:

- Lost approval requests
- Lack of traceability
- Delayed approvals
- Ambiguous authorization
- Incorrect order information
- Weak accountability

ApproveFlow introduces a structured, traceable workflow.

---

## 3. Architectural Goals

The architecture must support:

1. Secure user authentication.
2. Role-based authorization.
3. Structured business requests.
4. Explicit workflow state transitions.
5. Transactionally consistent persistence.
6. Clear separation of application responsibilities.
7. Automated testing.
8. Containerized environments.
9. Automated CI/CD.
10. Future extension of approval, finance, and audit capabilities.

---

## 4. Architecture Style

ApproveFlow uses a **Modular Monolith** architecture.

The system is deployed as a coherent application while maintaining clear internal business-module boundaries.

Initial logical modules include:

```text
Authentication
Request Management
Approval Workflow
Finance
Audit
```

Only functionality required by the current sprint is implemented.

Future modules will be introduced as their functionality enters the delivery scope.

## Rationale

The architecture provides Separation of Concerns without introducing the operational complexity of microservices.

It also allows future extraction of independently deployable services if genuine business or operational requirements justify that change.

---

## 5. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │       Browser        │
                         │    React + Vite      │
                         │     Tailwind CSS     │
                         └──────────┬───────────┘
                                    │
                               HTTPS / REST
                                    │
                         ┌──────────▼───────────┐
                         │      API Server      │
                         │   Node.js + Express  │
                         │                      │
                         │ ┌──────────────────┐ │
                         │ │ Authentication    │ │
                         │ │ Request Mgmt      │ │
                         │ │ Approval Workflow  │ │
                         │ │ Finance            │ │
                         │ │ Audit              │ │
                         │ └──────────────────┘ │
                         │          │           │
                         │       Services       │
                         │          │           │
                         │     Repositories     │
                         └──────────┬───────────┘
                                    │
                                   SQL
                                    │
                         ┌──────────▼───────────┐
                         │      PostgreSQL      │
                         └──────────────────────┘
```

---

## 6. Application Layering

Application requests follow this boundary:

```text
HTTP Request
     ↓
Route
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
PostgreSQL
```

## Route

Responsible for:

- Defining HTTP endpoints.
- Applying middleware.
- Connecting requests to controllers.

Routes should not contain business logic.

## Controller

Responsible for:

- Reading HTTP input.
- Calling application services.
- Returning appropriate HTTP responses.
- Translating application errors into HTTP responses.

Controllers should remain thin.

## Service

Responsible for:

- Business rules.
- Workflow operations.
- Authorization-sensitive business decisions.
- Coordinating repositories.
- Enforcing valid state transitions.

The service layer is the primary location for application business rules.

## Repository

Responsible for:

- Persistence operations.
- Database queries.
- Mapping application operations to PostgreSQL interactions.

Repositories should not determine business workflow decisions.

---

## 7. Initial Module Structure

The application will use the following logical structure:

```text
src/
├── app/
│   └── application configuration
│
├── modules/
│   ├── auth/
│   │   ├── routes
│   │   ├── controller
│   │   ├── service
│   │   ├── repository
│   │   ├── validation
│   │   └── tests
│   │
│   └── requests/
│       ├── routes
│       ├── controller
│       ├── service
│       ├── repository
│       ├── validation
│       └── tests
│
└── shared/
    ├── middleware
    ├── errors
    ├── database
    └── utilities
```

Approval, finance, and audit modules will be introduced when their functionality is implemented.

---

## 8. Domain Entities

The initial domain contains:

```text
User
Request
AuditEvent
```

## User

Represents an authenticated system user.

Initial roles:

```text
REQUESTER
APPROVER
FINANCE
ADMIN
```

## Request

Represents a business process request submitted through ApproveFlow.

Initial fields include:

- ID
- Title
- Description
- Category
- Quantity
- Unit Cost
- Total Cost
- Required Date
- Justification
- Status
- Created By
- Created At
- Updated At

## AuditEvent

Represents a traceable system or workflow event.

The audit capability will be progressively implemented as workflow operations are introduced.

---

## 9. Request State Machine

The request lifecycle is explicitly modelled as a state machine.

```text
                 ┌──────────────┐
                 │    DRAFT     │
                 └──────┬───────┘
                        │
                     submit
                        │
                        ▼
              ┌────────────────────┐
              │ PENDING_APPROVAL   │
              └───────┬────────────┘
                      │
              ┌───────┴────────┐
              │                │
           approve           reject
              │                │
              ▼                ▼
        ┌──────────┐     ┌──────────┐
        │ APPROVED │     │ REJECTED │
        └────┬─────┘     └──────────┘
             │
          process
             │
             ▼
        ┌───────────┐
        │ PROCESSED │
        └───────────┘
```

Only transitions explicitly supported by the workflow are permitted.

For Sprint 1:

```text
DRAFT → PENDING_APPROVAL
```

is implemented.

---

## 10. State Transition Rules

| Current State    | Action  | Required Actor  | Result           |
| ---------------- | ------- | --------------- | ---------------- |
| DRAFT            | Submit  | Requester/Owner | PENDING_APPROVAL |
| PENDING_APPROVAL | Approve | Approver        | APPROVED         |
| PENDING_APPROVAL | Reject  | Approver        | REJECTED         |
| APPROVED         | Process | Finance         | PROCESSED        |

Invalid transitions must be rejected by the application service layer.

The frontend must not be treated as the authority for workflow state.

---

## 11. Authentication Architecture

ApproveFlow uses JWT-based authentication.

```text
User
 │
 │ credentials
 ▼
Login API
 │
 │ validate credentials
 ▼
Authentication Service
 │
 │ signed JWT
 ▼
Client
 │
 │ Authorization: Bearer <token>
 ▼
Protected API
 │
 ▼
Authentication Middleware
 │
 ▼
Authenticated User Context
```

Passwords are never stored in plaintext.

Authentication and authorization are separate concerns.

---

## 12. Authorization Architecture

Authorization occurs on the server.

The application determines:

1. Who the user is.
2. What role the user has.
3. Whether that role permits the requested operation.
4. Whether business rules permit the operation.

For example:

```text
Request Submission
       │
       ▼
Authenticated?
       │
       ▼
Correct Role?
       │
       ▼
Owns Request?
       │
       ▼
Request is DRAFT?
       │
       ▼
Submit
```

Frontend controls may improve user experience but cannot replace server-side authorization.

---

## 13. API Architecture

The backend exposes a RESTful JSON API.

Initial endpoints include:

```text
POST /api/auth/login

POST /api/requests

GET /api/requests

GET /api/requests/:id

POST /api/requests/:id/submit
```

API responsibilities are separated from business rules.

HTTP concerns remain in routes/controllers while business operations are implemented by services.

---

## 14. Database Architecture

PostgreSQL is the system's primary persistent datastore.

The relational model provides explicit relationships and transactional integrity.

Initial relationship model:

```text
USER
 │
 │ 1
 │
 │ *
 ▼
REQUEST
 │
 │ *
 │
 ▼
AUDIT_EVENT
```

The exact database schema will be refined during implementation.

Primary keys identify entities.

Foreign keys maintain relationships and data integrity.

Transactions will be used where multiple related persistence operations must succeed or fail together.

---

## 15. Data Integrity

The application will enforce data integrity at multiple levels.

## Application Level

The service layer enforces:

- Required business fields.
- Valid workflow transitions.
- Authorization rules.
- Ownership rules.

## Database Level

PostgreSQL enforces appropriate:

- Primary keys.
- Foreign keys.
- Unique constraints.
- NOT NULL constraints.
- Data types.
- Transaction boundaries.

Neither layer is expected to replace the other.

---

## 16. Error Handling

Errors will be categorized into appropriate classes, including:

- Validation errors
- Authentication errors
- Authorization errors
- Resource-not-found errors
- Invalid state-transition errors
- Persistence errors
- Unexpected application errors

The API will return consistent HTTP responses.

Internal implementation details and sensitive information must not be exposed to clients.

---

## 17. Security Boundaries

The primary security boundary is the backend API.

```text
Browser
   │
   │ untrusted client
   ▼
API Boundary
   │
   ├── Authentication
   ├── Authorization
   ├── Validation
   └── Business Rules
          │
          ▼
       Database
```

Security principles include:

- Never trust client-side authorization.
- Never store plaintext passwords.
- Never commit secrets.
- Validate external input.
- Apply least-privilege access.
- Protect sensitive configuration through environment variables.

---

## 18. Container Architecture

Docker will provide application containerization.

Docker Compose will provide the local multi-container environment.

Conceptually:

```text
┌───────────────────────┐
│      Frontend         │
│    React + Vite       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│       Backend         │
│    Node + Express     │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│      PostgreSQL       │
└───────────────────────┘
```

Persistent database data must use an appropriate Docker volume or equivalent persistence mechanism.

---

## 19. CI/CD Architecture

GitHub Actions will provide automated validation and delivery.

The pipeline will progressively evolve toward:

```text
Developer
    │
    ▼
Git Push / Pull Request
    │
    ▼
GitHub Actions
    │
    ├── Install dependencies
    ├── Lint
    ├── Unit tests
    ├── Integration tests
    ├── Build
    └── Docker build
             │
             ▼
          Deployment
```

CI quality gates must prevent broken changes from being promoted.

Deployment implementation will be introduced when the deployment target is selected.

---

## 20. Testing Strategy

Testing will occur at multiple levels.

## Unit Tests

Validate isolated business logic, particularly service-layer rules.

Examples:

- Valid request submission.
- Invalid state transition.
- Unauthorized submission.
- Ownership violation.

## Integration Tests

Validate interactions between:

- API
- Services
- Repositories
- PostgreSQL

## End-to-End Tests

Validate critical user journeys once the frontend workflow is sufficiently complete.

The first end-to-end scenario will be:

```text
Login
  ↓
Create Request
  ↓
Submit Request
  ↓
Verify PENDING_APPROVAL
```

---

## 21. Observability

The MVP will provide foundational observability through:

- Structured application logging.
- HTTP request/error logging.
- Health-check endpoint.
- CI test/build results.

More advanced metrics, tracing, alerting, and centralized log aggregation may be introduced if deployment requirements justify them.

---

## 22. Scalability Strategy

The initial system is intentionally designed as a modular monolith.

Scaling strategy:

```text
Current
   │
   ▼
Scale application instances
   │
   ▼
Database optimization
   │
   ▼
Caching / asynchronous processing where justified
   │
   ▼
Extract independently scalable modules
   │
   ▼
Microservices only if justified
```

The architecture does not assume that microservices are automatically required for scale.

Future extraction decisions should be based on measurable requirements such as:

- Independent scaling
- Deployment independence
- Team ownership boundaries
- Availability requirements
- Operational characteristics

---

## 23. Development Principles

The implementation will follow these principles:

### Principle 1 — Business rules belong in services

Controllers should not become repositories for workflow logic.

### Principle 2 — Security is server-enforced

The frontend is not a trusted security boundary.

### Principle 3 — State transitions are explicit

Workflow state must be controlled by defined application rules.

### Principle 4 — Build only what is required

Future modules are architecturally planned but implemented only when required by the delivery scope.

### Principle 5 — Prefer simple architecture until complexity is justified

The system should not introduce infrastructure or architectural patterns merely for demonstration.

### Principle 6 — Evidence is part of delivery

Implementation decisions, tests, CI results, troubleshooting, and deployment outcomes should be preserved as part of the engineering record.

---

## 24. Architecture Traceability

| Business Requirement         | Architectural Response            |
| ---------------------------- | --------------------------------- |
| Lost approval requests       | Structured digital workflow       |
| Verbal approvals             | Explicit workflow state           |
| Physical signatures          | Digital approval action           |
| Incorrect order details      | Structured request fields         |
| Lack of accountability       | Authentication + audit capability |
| Unauthorized actions         | Server-side authorization         |
| Inconsistent environments    | Docker                            |
| Manual quality validation    | GitHub Actions                    |
| Difficult maintenance        | Modular architecture              |
| Transactional business state | PostgreSQL                        |

---

## 25. Architecture Decision Records

The architecture is supported by the following ADRs:

- ADR-001 — Modular Monolith
- ADR-002 — Node.js + Express
- ADR-003 — React + Vite
- ADR-004 — PostgreSQL
- ADR-005 — JWT Authentication
- ADR-006 — REST API
- ADR-007 — Docker + Docker Compose
- ADR-008 — GitHub Actions
- ADR-009 — Service Layer Business Rules

These records document the reasoning, alternatives, and consequences behind the architecture.

---

## 26. Sprint 1 Architectural Boundary

Sprint 1 implements only:

```text
Authentication
     +
Requester Authorization
     +
Request Creation
     +
Request Submission
```

The first working increment is:

```text
REQUESTER
    │
    ▼
LOGIN
    │
    ▼
CREATE REQUEST
    │
    ▼
DRAFT
    │
    ▼
SUBMIT
    │
    ▼
PENDING_APPROVAL
```

Approval, Finance, and extended Audit functionality remain outside the Sprint 1 implementation boundary.

---

## 27. Architecture Success Criteria

The architecture is considered successfully established when:

- Application responsibilities are clearly separated.
- Business rules have an explicit service-layer boundary.
- Authentication and authorization boundaries are defined.
- Workflow states and valid transitions are documented.
- Persistence responsibilities are defined.
- Containerization strategy is documented.
- CI/CD direction is established.
- Architectural decisions are traceable to ADRs.
- Sprint 1 implementation can proceed without unresolved architectural ambiguity.
