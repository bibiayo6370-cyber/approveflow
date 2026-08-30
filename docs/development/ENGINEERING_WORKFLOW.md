# ApproveFlow Engineering Workflow

**Document Version:** 1.0
**Status:** Approved
**Effective Date:** 30 August 2026

## 1. Purpose

This document defines the development workflow and engineering practices for the ApproveFlow project.

The objective is to maintain a predictable, traceable, and maintainable development process while producing verifiable evidence of engineering execution.

## 2. Branch Strategy

ApproveFlow uses the following branch model:

```text
main
  │
  └── develop
        │
        ├── feature/*
        ├── fix/*
        ├── docs/*
        └── chore/*
```

### `main`

The stable, releasable branch.

Changes should only reach `main` through an approved integration process.

### `develop`

The primary integration branch during active development.

Completed feature work is integrated here before release.

### Feature branches

Feature branches are created from `develop`.

Naming convention:

```text
feature/<short-description>
```

Example:

```text
feature/user-authentication
feature/approval-workflow
feature/audit-trail
```

### Fix branches

Bug fixes use:

```text
fix/<short-description>
```

Example:

```text
fix/finance-processing-validation
```

### Documentation branches

Documentation-only changes use:

```text
docs/<short-description>
```

### Chore branches

Maintenance and project configuration changes use:

```text
chore/<short-description>
```

## 3. Development Workflow

The standard development cycle is:

```text
Issue / Requirement
       ↓
Create branch from develop
       ↓
Implement change
       ↓
Run tests
       ↓
Review changes
       ↓
Commit
       ↓
Push branch
       ↓
Pull Request
       ↓
Review / CI
       ↓
Merge into develop
```

Direct development on `main` is not permitted.

## 4. Commit Convention

Commits should use a concise conventional format:

```text
<type>: <description>
```

Approved types include:

- `feat` — new functionality
- `fix` — bug fix
- `test` — tests
- `docs` — documentation
- `refactor` — code restructuring without behavioural change
- `chore` — maintenance/configuration
- `ci` — CI/CD changes

Examples:

```text
feat: implement request submission workflow
fix: prevent finance from processing pending requests
test: add approval workflow integration tests
docs: document approval architecture
ci: add automated test workflow
```

Commit messages should describe **what changed**, not the entire implementation process.

## 5. Pull Requests

Pull Requests should:

- Have a clear title
- Explain the purpose of the change
- Identify important implementation details
- Describe testing performed
- Identify known limitations where applicable
- Pass required automated checks before merging

For this demonstration project, Pull Requests also serve as evidence of the engineering workflow.

## 6. Testing Requirement

New business functionality should include appropriate automated tests.

Particular attention must be given to business rules and authorization boundaries.

For example:

```text
A request must not be processed by Finance unless it has been approved.
```

Business rules must not depend solely on frontend controls.

Where appropriate, they must be enforced at the backend/API level and covered by automated tests.

## 7. Security and Configuration

Secrets and environment-specific configuration must not be committed to Git.

Local configuration should use environment variables.

Sensitive files such as:

```text
.env
```

must remain excluded through `.gitignore`.

A safe example configuration may be documented through:

```text
.env.example
```

without containing real credentials.

## 8. Documentation

Important engineering decisions should be documented alongside implementation.

Documentation may include:

- Architecture
- Engineering decisions
- Testing
- Deployment
- Troubleshooting
- Development practices

Documentation should be updated when significant implementation decisions change.

## 9. AI-Assisted Development

AI tools may be used to assist with:

- Research
- Code generation
- Debugging
- Documentation
- Test generation
- Design exploration

However, AI-generated output is not considered accepted engineering work until it has been:

1. Reviewed by the developer
2. Understood by the developer
3. Tested
4. Validated against project requirements
5. Modified where necessary
6. Accepted as an explicit engineering decision

The developer remains responsible for all code and technical decisions committed to the repository.

## 10. Evidence Preservation

The project should preserve meaningful evidence of the engineering process.

This includes, where appropriate:

- Git commits
- Branches
- Pull Requests
- CI results
- Test results
- Deployment records
- Troubleshooting investigations
- Architecture decisions
- Implementation trade-offs

The objective is to demonstrate both the resulting system and the process used to build it.

## 11. Definition of a Completed Change

A change is considered complete when:

- The implementation satisfies its requirement
- Appropriate tests have been created or updated
- Tests pass
- Code has been reviewed
- Documentation has been updated where necessary
- The change has been committed using the project's convention
- CI checks pass where applicable
- The change is ready for integration

## 12. Guiding Principle

ApproveFlow follows a simple engineering principle:

> **Build incrementally, validate continuously, document important decisions, and leave evidence of the work.**
