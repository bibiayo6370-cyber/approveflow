# G3 frontend

The Vite React/TypeScript client lives in `frontend/`. `src/main.tsx` bootstraps the router, `src/app/App.tsx` owns protected routes and session restoration, `src/lib/api.ts` is the typed fetch client, and `src/types/api.ts` contains API-facing types. Focused feature components implement login, request creation, and approver decisions.

ApproveFlow uses a navy navigation shell, light request surfaces, role-specific workspaces, status labels, and responsive cards/forms. The request display remains intentionally compact for the approved MVP; no finance, attachment, notification, or draft-editing features are included.

## Forms and session

React Hook Form, Zod, and `@hookform/resolvers` validate login, request creation, and rejection reasons. Request validation requires all fields, a positive whole-number quantity, a non-negative monetary string with no more than two fractional digits, and a real ISO calendar date. The total preview uses integer cents; the API remains authoritative. Lucide React supplies action icons.

The JWT is stored only in `sessionStorage`. Startup validates it with `GET /api/auth/me`; failure clears the session and routes to login. Passwords and tokens are not logged or stored in environment variables.

## API and CORS

`VITE_API_BASE_URL` contains only the API origin; see `frontend/.env.example`. The client uses the committed G1/G2 auth and request endpoints and their `{ user }`, `{ request }`, `{ requests }`, and `{ events }` envelopes.

The backend CORS middleware uses the exact, comma-separated `CORS_ALLOWED_ORIGINS` allowlist (default `http://localhost:5173`). It allows only `GET`/`POST` preflights and `Authorization`/`Content-Type` request headers. Unknown origins, methods, and headers receive no permissive CORS response; wildcard origins are not used.

## Verification

Commands run during G3 closure:

- `frontend: npm test` — 15 passing tests. The jsdom/React Testing Library suite uses status-aware Fetch fixtures: 401 for invalid login/session and 409 for stale decisions, preserving the API client's non-2xx error behavior. It also covers valid session restoration, logout cleanup, protected-route redirect, loading, empty, and network-failure states.
- `frontend: npm run build` — TypeScript and production build passed.
- `backend: node --test tests/cors.unit.test.js` — 3 passing tests.
- `backend: npm test` after live `approveflow_test` identity verification — 31 passing tests.
- `npm audit --omit=dev` in both applications — zero reported vulnerabilities.
- JavaScript syntax checks and `git diff --check` passed.

Visible labels, field-error alerts, focus outlines, native controls, responsive single-column mobile forms, and mobile request cards were inspected in source. No browser-driven visual test was performed. The mocked suite covers login/session handling, protected navigation, requester draft creation/submission/history, approver decisions, status retention, and stale-decision feedback.
