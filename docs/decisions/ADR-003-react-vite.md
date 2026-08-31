# ADR-003: Adopt React and Vite for the Frontend

**Status:** Accepted
**Date:** 31 August 2026

## Context

ApproveFlow requires a browser-based interface for requesters, approvers, finance officers, and administrators.

The application requires a component-based UI, client-side interaction, form handling, and integration with the REST API.

## Decision

ApproveFlow will use:

- React
- Vite
- Tailwind CSS

React will provide component-based UI development and state primitives.

Vite will provide the development server and frontend build tooling.

Tailwind CSS will provide utility-based styling.

## Rationale

React provides a mature component model and state primitives suitable for the application's interactive workflow interfaces.

Vite provides a fast and lightweight development and build experience.

Tailwind CSS integrates well with React and allows the UI to be developed consistently without introducing a separate component framework at this stage.

The combined ecosystem provides strong community support and extensive tooling.

## Alternatives Considered

### Next.js

Rejected for the MVP because server-side rendering and the broader full-stack framework capabilities are not required for this internal workflow application.

### Plain HTML/CSS/JavaScript

Rejected because it would provide less structure for a multi-role interactive application.

## Consequences

### Positive

- Component-based UI
- Fast development workflow
- Mature ecosystem
- Straightforward API integration
- Consistent styling approach

### Negative

- Additional frontend dependencies
- Broader application state management may require an additional solution if the MVP grows beyond React's built-in state primitives

## Reassessment Trigger

Frontend architecture should be reconsidered if requirements introduce server-side rendering, complex application-wide state, or other capabilities that justify a broader framework.
