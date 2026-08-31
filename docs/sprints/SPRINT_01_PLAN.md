# ApproveFlow

## Sprint 01 — Request Submission Foundation

**Sprint:** 01
**Status:** Approved
**Sprint Goal:** Deliver the first working vertical slice of ApproveFlow in which an authenticated requester can create and submit a structured business request that is persisted and enters the `PENDING_APPROVAL` state.

---

## 1. Sprint Objective

The objective of Sprint 01 is to establish the application foundation and deliver the first meaningful end-to-end business capability.

At the end of the sprint, the system should demonstrate:

```text
Requester
    ↓
Authentication
    ↓
Create Business Request
    ↓
Validate Request
    ↓
Persist Request
    ↓
Submit Request
    ↓
PENDING_APPROVAL
```

This increment establishes the foundation for the approval workflow that will be implemented in subsequent sprints.

---

## 2. Sprint Scope

### Included User Stories

#### US-001 — User Login

A registered user can authenticate and receive an authenticated session/token.

#### US-002 — Role-Based Access

Application roles are established and protected operations enforce role-based authorization.

Initial roles:

- REQUESTER
- APPROVER
- FINANCE
- ADMIN

#### US-003 — Create Business Request

An authenticated requester can create a structured business request containing the information required for approval.

#### US-004 — Submit Request

A requester can submit a draft request, causing it to transition to:

```text
DRAFT → PENDING_APPROVAL
```

---

## 3. Out of Scope

The following are intentionally excluded from Sprint 01:

- Approver queue
- Approval decision
- Request rejection
- Finance processing
- Audit history beyond what is necessary for the current workflow
- Production deployment
- Advanced notification systems
- External integrations

These capabilities will be addressed in later increments.

---

## 4. Engineering Work Breakdown

### 4.1 Application Foundation

- [ ] Establish application repository structure.
- [ ] Initialize backend application.
- [ ] Initialize frontend application.
- [ ] Configure environment variables.
- [ ] Configure database connection.
- [ ] Establish development scripts.
- [ ] Establish initial API structure.

---

### 4.2 Authentication

- [ ] Create User model.
- [ ] Implement password hashing.
- [ ] Implement user registration/seed mechanism.
- [ ] Implement login service.
- [ ] Implement login API endpoint.
- [ ] Implement authentication middleware.
- [ ] Implement authentication failure handling.
- [ ] Implement login interface.
- [ ] Add authentication tests.

---

### 4.3 Authorization

- [ ] Define application roles.
- [ ] Implement role authorization middleware.
- [ ] Protect requester operations.
- [ ] Verify unauthorized access is rejected.
- [ ] Add authorization tests.

---

### 4.4 Request Management

- [ ] Create Request model.
- [ ] Define request fields.
- [ ] Define request status values.
- [ ] Implement request validation.
- [ ] Implement request creation endpoint.
- [ ] Associate request with authenticated creator.
- [ ] Implement request submission endpoint.
- [ ] Enforce valid state transitions.
- [ ] Add request creation tests.
- [ ] Add request submission tests.

---

### 4.5 Frontend

- [ ] Create login interface.
- [ ] Create request form.
- [ ] Validate request input.
- [ ] Submit request to API.
- [ ] Display successful submission.
- [ ] Display validation/API errors.

---

## 5. Initial Request State Model

The request lifecycle introduced in Sprint 01 is:

```text
DRAFT
  │
  │ submit
  ▼
PENDING_APPROVAL
```

Other states exist in the product backlog but will be implemented in later sprints:

```text
APPROVED
REJECTED
PROCESSED
```

Invalid transitions must be rejected.

---

## 6. Core Business Rules

### Rule 1 — Authentication

Protected request operations require an authenticated user.

### Rule 2 — Request Ownership

A requester may create requests on their own behalf.

### Rule 3 — Submission

Only a request in `DRAFT` state may be submitted.

### Rule 4 — Ownership

Only the request creator may submit their draft request unless an explicitly authorized administrative operation exists.

### Rule 5 — State Integrity

The API must enforce valid state transitions. Frontend controls must not be treated as the security boundary.

### Rule 6 — Data Integrity

The submitted request must preserve the information entered by the requester.

---

## 7. Acceptance Criteria

Sprint 01 is successful when the following scenario can be demonstrated:

## Scenario: Sarah submits a laptop request

1. Sarah has a REQUESTER account.
2. Sarah authenticates successfully.
3. Sarah creates a request for five high-performance laptops.
4. The request contains the required business information.
5. The system validates the request.
6. The request is persisted.
7. The request initially exists as `DRAFT`.
8. Sarah submits the request.
9. The system changes the status to `PENDING_APPROVAL`.
10. The request remains associated with Sarah.
11. Invalid submission attempts are rejected.
12. Automated tests verify the core business rules.

---

## 8. Definition of Done

A Sprint 01 story is considered complete when it satisfies the project's Definition of Done.

At minimum:

- Requirements satisfied
- Acceptance criteria satisfied
- Appropriate automated tests implemented
- Tests passing
- Authorization rules enforced
- Relevant documentation updated
- Changes committed using project conventions
- CI checks passing once CI is established
- Demonstrable working functionality available

---

## 9. Sprint Risks

| Risk                                              | Impact | Mitigation                                                     |
| ------------------------------------------------- | ------ | -------------------------------------------------------------- |
| Authentication complexity delays request workflow | Medium | Keep authentication implementation focused on MVP requirements |
| Request validation inconsistencies                | High   | Centralize validation and test business rules                  |
| Unauthorized API access                           | High   | Enforce authorization server-side                              |
| Scope expansion                                   | Medium | Defer non-MVP capabilities to backlog                          |
| Database/environment configuration issues         | Medium | Establish configuration early and document setup               |

---

## 10. Expected Sprint Increment

At the conclusion of Sprint 01, ApproveFlow should have a working vertical slice demonstrating:

```text
                    APPROVEFLOW
                         │
                         ▼
                    LOGIN
                         │
                         ▼
                  REQUESTER ROLE
                         │
                         ▼
               CREATE REQUEST
                         │
                         ▼
                   DRAFT
                         │
                         ▼
                  SUBMIT REQUEST
                         │
                         ▼
              PENDING_APPROVAL
```

This increment becomes the foundation upon which the approval workflow is built.

---

## 11. Sprint Demonstration

The sprint demonstration should use the original business scenario rather than a generic technical demonstration.

### Demonstration narrative

> Sarah has won a major logistics contract and needs five high-performance laptops costing ₦4,500,000. Instead of sending an email or submitting a handwritten form, she logs into ApproveFlow and creates a structured request.

The demonstration should then show:

1. Sarah authenticating.
2. Sarah creating the request.
3. The request being validated.
4. The request being persisted.
5. Sarah submitting the request.
6. The request transitioning to `PENDING_APPROVAL`.
7. The underlying API/data confirming the persisted state.

---

## 12. Evidence to Preserve

The following evidence should be captured during the sprint:

- Git commits
- Pull Requests
- Automated test results
- CI results
- API test evidence
- Screenshots of the working workflow
- Important troubleshooting investigations
- Architecture decisions
- Final sprint demonstration

Evidence should be captured as development occurs rather than reconstructed after completion.

---

## 13. Sprint Success Criterion

Sprint 01 succeeds if a reviewer can independently observe that:

> **An authenticated requester can create and submit a valid business request, and the system reliably persists that request in the `PENDING_APPROVAL` state while enforcing the appropriate authorization and business rules.**

---

## 14. Next Increment

The next sprint will build upon this foundation by implementing the approval side of the workflow:

```text
PENDING_APPROVAL
       ↓
Approver Queue
       ↓
Review
       ↓
Approve / Reject
```

This will directly address the approval delays and undocumented verbal approvals described in the "Wrong Laptops" scenario.
