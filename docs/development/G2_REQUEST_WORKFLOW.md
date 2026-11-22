# G2 request workflow

## Scope and lifecycle

G2 implements the Requester → Approver path only:

```text
DRAFT → PENDING_APPROVAL → APPROVED
                         └→ REJECTED
```

`APPROVED` and `REJECTED` are terminal in G2. Finance processing is intentionally excluded.

## API

All request endpoints require an active authenticated Requester or Approver.

| Endpoint | Role | Result |
| --- | --- | --- |
| `POST /api/requests` | Requester | Creates an owner-bound `DRAFT` and `REQUEST_CREATED` event. |
| `GET /api/requests` | Requester/Approver | Requester sees own requests; Approver sees pending inbox. |
| `GET /api/requests/pending` | Approver | Lists `PENDING_APPROVAL` requests. |
| `GET /api/requests/:id` | Owner/Approver | Returns an accessible request; unsubmitted drafts are owner-only. |
| `POST /api/requests/:id/submit` | Owner Requester | Moves `DRAFT` to `PENDING_APPROVAL`. |
| `POST /api/requests/:id/approve` | Approver | Moves pending request to `APPROVED`. |
| `POST /api/requests/:id/reject` | Approver | Moves pending request to `REJECTED`; requires `comment`. |
| `GET /api/requests/:id/history` | Owner/Approver | Returns append-only event history. |

The request body accepts title, description, category, quantity, unitCost, requiredDate, and justification. Status, ownership, and total cost are server-controlled. Monetary values are parsed into integer cents and the server calculates `totalCost` exactly.

## Persistence and concurrency

Migration 003 creates `request_events` with an append-only trigger. Creation and its event are one transaction. Submission, approval, and rejection lock the request row with `FOR UPDATE`, validate status and ownership/role, update status, write the corresponding event, and commit together. A failed event insert rolls back the state update; concurrent decisions serialize at the row lock and only the first valid transition succeeds.

## Verification and limitations

The integration suite covers input integrity, ownership, inbox access, decisions, rejection comments, history immutability, actor attribution, rollback, and concurrent decisions. It runs only against local `approveflow_test` after its identity is verified. G2 does not provide Finance processing, notifications, attachments, multilevel approvals, or multi-tenancy.
