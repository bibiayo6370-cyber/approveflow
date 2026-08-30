# ApproveFlow

## Project Charter

**Document Version:** 0.1  
**Project Status:** Draft  
**Project Type:** Mini DevOps / Software Engineering Demonstration  
**Organization:** XYZ Logistics Corp  
**Primary Scenario:** The Wrong Laptops

## 1. Project Overview

ApproveFlow is a lightweight business process approval application designed to replace informal, fragmented approval processes with a structured, traceable digital workflow.

The application will allow employees to submit business requests, route those requests to authorized approvers, record approval or rejection decisions, and provide Finance with the approved request without requiring manual re-entry of the original information.

The project is intentionally scoped as a small but production-minded engineering exercise demonstrating software development, testing, CI/CD, containerization, deployment, troubleshooting, and operational thinking.

## 2. Business Problem

XYZ Logistics Corp currently relies on email, verbal communication, paper forms, photographs, and messaging applications to manage business approvals.

This process creates several risks:

- Approval requests can be lost or delayed in email.
- Verbal approvals are difficult to verify.
- Physical signatures can delay business processes.
- Approved information may be manually re-entered.
- Handwritten information can be misinterpreted.
- Employees have limited visibility into request status.
- Finance may not have a reliable, centralized record of authorization.
- There is no consistent audit trail showing who performed each action and when.

These weaknesses can result in operational delays, incorrect purchases, financial risk, and damage to customer relationships.

## 3. Problem Scenario

Sarah, a Senior Project Manager at XYZ Logistics Corp, requires five high-performance laptops for a newly awarded project.

The total purchase value is ₦4,500,000.

Under the existing process:

1. Sarah sends an approval request to Mark, her department head, by email.
2. The request is lost among Mark's other emails.
3. Sarah later receives a verbal approval from Mark.
4. Finance requires formal evidence of the approval.
5. Mark eventually provides a photographed signed form.
6. Finance processes the request but misinterprets the handwritten information.
7. Standard laptops are ordered instead of the required high-performance laptops.
8. The incorrect order arrives late.
9. The resulting project delay puts the client relationship at risk.

ApproveFlow is intended to prevent this class of failure.

## 4. Project Objective

The primary objective is to design and implement a digital approval workflow that provides:

- Structured business requests
- Role-based approval
- Centralized request status
- Explicit approval decisions
- Preservation of the original request information
- Finance processing based on the approved request
- A complete audit trail
- Automated validation and testing
- Repeatable application delivery through CI/CD

## 5. Target Users

### Requester

Employees who need approval for business requests.

Example:
**Sarah — Senior Project Manager**

Responsibilities:

- Create requests
- Submit requests
- View request status
- View approval history

### Approver

Managers or authorized personnel responsible for reviewing requests.

Example:
**Mark — Department Head**

Responsibilities:

- View pending requests
- Review request details
- Approve requests
- Reject requests
- Provide approval comments

### Finance Officer

Personnel responsible for processing approved requests.

Responsibilities:

- View approved requests
- Verify approval information
- Process approved requests
- Record processing status

## 6. Initial Workflow

The core workflow will be:

    Request Creation
           ↓
       Submission
           ↓
    Pending Approval
         ↙   ↘
     Reject   Approve
       ↓         ↓
    Rejected   Approved
                   ↓
           Pending Finance
                   ↓
               Processed

Every significant workflow transition must be recorded.

## 7. Core Product Principles

### 7.1 Single Source of Truth

The request stored by the system becomes the authoritative version of the business request.

Finance should not need to manually re-enter request information.

### 7.2 Explicit Authorization

Only an appropriately authorized user can approve a request.

### 7.3 Traceability

Important actions must generate an auditable record.

### 7.4 State-Based Processing

The system must prevent invalid workflow transitions.

For example:

> A request that has not been approved cannot be processed by Finance.

### 7.5 Data Integrity

The information submitted by the requester must remain consistent throughout the approval workflow.

### 7.6 Security by Default

Users should only be able to perform actions permitted by their assigned role and the current state of the request.

### 7.7 Automation

Where practical, repetitive validation, testing, building, and delivery activities should be automated.

## 8. Initial Scope

The Minimum Viable Product will include:

### Authentication

- User login
- Secure password handling
- Role-based access

### Request Management

- Create request
- View request
- View request status
- Submit request

### Approval

- Approver request queue
- Request review
- Approve request
- Reject request
- Approval comments

### Finance

- Approved request queue
- View approved request
- Mark request as processed

### Audit

- Record request creation
- Record submission
- Record approval/rejection
- Record finance processing
- Record timestamps and responsible users

### DevOps Requirements

- Git-based development
- Automated tests
- CI pipeline
- Docker containerization
- Automated build
- Deployment
- Application health check

## 9. Out of Scope for MVP

The following will deliberately not be implemented in Version 1:

- Complex multi-level approval hierarchies
- Procurement/vendor management
- Purchase-order generation
- Payment processing
- Integration with banking systems
- Email/SMS notification infrastructure
- Enterprise SSO
- Advanced analytics
- Mobile applications
- AI-based approval decisions
- Electronic signature integration
- Production-scale infrastructure

These may be considered future enhancements.

## 10. Non-Functional Engineering Goals

The application should demonstrate:

### Reliability

The system should prevent invalid workflow transitions and handle expected application errors gracefully.

### Security

Authentication, authorization, input validation, and protection of sensitive configuration must be considered throughout development.

### Maintainability

The codebase should use clear structure, meaningful naming, modular components, and documented engineering decisions.

### Testability

Important business rules should be covered by automated tests.

### Deployability

The application should be capable of being built and deployed consistently from a clean environment.

### Observability

The application should provide sufficient logging and health information to diagnose basic operational problems.

## 11. Technology Direction

The initial technology direction is:

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express

### Database

- MongoDB

### Authentication Method

- JWT

### Testing

- Automated unit and integration testing

### DevOps

- Git/GitHub
- GitHub Actions
- Docker
- Docker Compose where appropriate

The final technology choices will be confirmed during technical design.

## 12. Definition of Success

The project will be considered successful when a complete request can move through the workflow:

**Sarah creates request → submits request → Mark reviews → Mark approves → Finance receives the approved request → Finance processes it.**

The system must also demonstrate that:

1. Unauthorized users cannot perform restricted actions.
2. Finance cannot process an unapproved request.
3. The original request information remains intact.
4. Approval decisions are recorded.
5. Workflow history can be inspected.
6. Automated tests verify important business rules.
7. CI automatically validates changes.
8. The application can be packaged and deployed consistently.
9. A deployment can be verified through a health check.
10. At least one controlled failure can be diagnosed, fixed, and documented.

## 13. Engineering Evidence Objective

A secondary objective of this project is to provide verifiable evidence of practical engineering execution.

The project will therefore preserve evidence of:

- Requirements analysis
- Architecture decisions
- Git workflow
- Incremental implementation
- Code reviews/PRs where applicable
- Automated testing
- CI execution
- Containerization
- Deployment
- Troubleshooting
- Failure recovery
- Engineering trade-offs
- Documentation

The project should demonstrate not only the final application but the engineering process used to produce it.

## 14. Key Risks

| Risk                                | Mitigation                                                               |
| ----------------------------------- | ------------------------------------------------------------------------ |
| Scope becomes too large             | Maintain strict MVP boundaries                                           |
| Over-engineering                    | Prefer simple solutions appropriate to the problem                       |
| Insufficient testing                | Define tests alongside business functionality                            |
| Deployment problems discovered late | Introduce containerization and CI before project completion              |
| Security weaknesses                 | Apply authentication, authorization and validation from the beginning    |
| Weak execution evidence             | Capture engineering evidence continuously rather than retrospectively    |
| Artificial-looking DevOps workflow  | Use real Git history, actual CI runs, real failures and documented fixes |

## 15. Definition of Done — Project Level

ApproveFlow is complete when:

- [ ] MVP requirements are implemented
- [ ] Core approval workflow functions correctly
- [ ] Role-based authorization is enforced
- [ ] Invalid workflow transitions are prevented
- [ ] Audit history is implemented
- [ ] Automated tests pass
- [ ] CI pipeline passes
- [ ] Application is containerized
- [ ] Application is deployed
- [ ] Deployment is verified
- [ ] Controlled failure has been investigated and resolved
- [ ] Documentation is complete
- [ ] Engineering evidence has been captured
- [ ] Project can be demonstrated end-to-end

## 16. Project Philosophy

ApproveFlow is intentionally small.

The goal is not to demonstrate the largest number of technologies or build an enterprise procurement platform.

The goal is to demonstrate disciplined engineering:

**Understand the problem → design the solution → build incrementally → test → automate → deploy → observe → troubleshoot → improve.**

The final system should therefore be judged not only by whether it works, but by the quality and traceability of the engineering process used to make it work.

**Status:** Draft v0.1  
**Next Step:** Review and approve Project Charter, then establish the Git repository and Sprint 0 documentation structure.
