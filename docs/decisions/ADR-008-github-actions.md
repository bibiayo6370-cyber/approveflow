# ADR-008: Adopt GitHub Actions for CI/CD

**Status:** Accepted
**Date:** 31 August 2026

## Context

ApproveFlow requires automated validation of changes and eventually automated delivery of the application.

The source repository and project management workflow are hosted on GitHub.

## Decision

ApproveFlow will use **GitHub Actions** as its CI/CD platform.

The pipeline will progressively implement:

```text
Code Change
    ↓
Build
    ↓
Lint
    ↓
Test
    ↓
Docker Build
    ↓
Deployment
```

The exact deployment target will be selected when deployment requirements are established.

## Rationale

GitHub Actions integrates directly with the repository and pull-request workflow.

It provides a suitable platform for automated testing, build validation, container image creation, and eventual deployment without requiring a separate CI infrastructure.

## Alternatives Considered

### GitLab CI

Rejected because the source repository and project workflow are already centered on GitHub.

### Jenkins

Rejected because operating a separate Jenkins infrastructure would introduce unnecessary operational overhead for the MVP.

## Consequences

### Positive

- Native GitHub integration
- Automated quality gates
- Pull-request validation
- Reproducible build workflows
- Foundation for continuous delivery

### Negative

- Workflow configuration becomes part of the repository
- CI execution time and runner limitations must be considered
- Deployment secrets require secure management

## Reassessment Trigger

The CI/CD platform should be reconsidered if organizational requirements mandate another platform or if pipeline scale exceeds the practical capabilities of GitHub Actions.
