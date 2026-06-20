# API Reference & Sensitive Components

This document describes the server API endpoints, their expected inputs, behavior, outputs, and the repository files that contain security-sensitive logic or secrets.

**Notes**: all server routes live under `app/api/` and use Next.js route handlers. Firestore is used as the data store, and HMAC (webhook signing) + JWT (API auth) secure flows.

**APIs**

- **POST /api/submit/[workflowId]**
  - Purpose: public ingestion endpoint for embedded workflows.
  - Auth: none (origin-restricted by workflow.allowedDomains).
  - Input (JSON): { data: Record<string, any> }
    - `data` is the submission payload coming from the embedded form.
  - Behavior:
    - Checks Origin header against the workflow's `allowedDomains`.
    - Sanitizes `data` using `sanitizeValue` (recursive string sanitization).
    - Persists a submission document in Firestore via `createSubmission`.
    - If the workflow has a `webhookUrl`, posts the sanitized payload to the webhook.
      - Webhook request includes HMAC headers built by `buildWebhookHeaders`.
      - Webhook call uses an 8s timeout and updates the submission `webhookStatus` to `sent` or `failed`.
  - Output (JSON): { success: true, submissionId } on success; 403 if origin not allowed; 404 if workflow missing.
  - Files: [app/api/submit/[workflowId]/route.ts](app/api/submit/[workflowId]/route.ts#L1-L200)

- **GET /api/widget/[workflowId]**
  - Purpose: public widget configuration used by `public/embed.js` to render a form client-side.
  - Auth: none (origin-restricted by workflow.allowedDomains).
  - Query: optional `?token=` (embed accepts token, but server currently checks origin and returns 403 if not allowed).
  - Output (JSON): WidgetConfigResponse: { id, name, fields, theme }
  - Errors: 403 if Origin not allowed; 404 if workflow not found.
  - Files: [app/api/widget/[workflowId]/route.ts](app/api/widget/[workflowId]/route.ts#L1-L200)

- **GET /api/workflows**
  - Purpose: list workflows owned by the authenticated user.
  - Auth: required — `Authorization: Bearer <token>` (JWT). Token verified with `verifyToken`.
  - Input: none.
  - Output (JSON): { workflows: WorkflowSchemaClient[] } (no `hmacSecret` in returned objects)
  - Errors: 401 Unauthorized if token missing/invalid.
  - Files: [app/api/workflows/route.ts](app/api/workflows/route.ts#L1-L200)

- **POST /api/workflows**
  - Purpose: create a workflow for the authenticated user.
  - Auth: required — `Authorization: Bearer <token>` (JWT). Token subject becomes ownerId.
  - Input (JSON): validated by Zod schema via `validateAndSanitizeWorkflow` — see `lib/validation.ts`.
    - Fields of interest: `name` (string, required), `description` (optional), `fields` (array of form fields), `theme` (ThemeConfig), `webhookUrl` (string or empty), `allowedDomains` (string[]).
  - Behavior: validation -> sanitize -> `createWorkflow` in Firestore (server generates `id` and `hmacSecret`). `ownerId` mapping written to `user_workflows` when provided.
  - Output (JSON): { workflow } (201) — returned workflow omits `hmacSecret`.
  - Files: [app/api/workflows/route.ts](app/api/workflows/route.ts#L1-L200) and [lib/validation.ts](lib/validation.ts#L1-L200)

- **GET|PUT|DELETE /api/workflows/[id]**
  - Purpose: read / update / delete a single workflow (owner-only).
  - Auth: required — `Authorization: Bearer <token>` (JWT). Server enforces ownership via `getWorkflowIfOwner`.
  - GET Output: { workflow } (404 if not found)
  - PUT Input: partial workflow object accepted, validated with `workflowCreateSchema.partial()` (Zod). Server normalizes/removes `createdAt`/`updatedAt` if client included Firestore Timestamp objects and coerces `webhookUrl` to string before validation.
  - PUT Behavior: validate -> sanitize (via `sanitizeValue`) -> `updateWorkflow` (updates `updatedAt` timestamp in Firestore).
  - DELETE Behavior: deletes workflow and owner mapping.
  - Files: [app/api/workflows/[id]/route.ts](app/api/workflows/[id]/route.ts#L1-L200)

- **Auth: POST /api/auth/signup and POST /api/auth/login**
  - Purpose: create accounts and issue JWTs.
  - Signup Input: { username, email, password } -> creates a user document with `passwordHash` (bcrypt) and returns `token` and `user`.
  - Login Input: { email, password } -> verifies hash and returns `token` + user. Tokens signed with `signToken` using `JWT_SECRET`.
  - Files: [app/api/auth/signup/route.ts](app/api/auth/signup/route.ts#L1-L200), [app/api/auth/login/route.ts](app/api/auth/login/route.ts#L1-L200), [lib/users.ts](lib/users.ts#L1-L200), [lib/jwt.ts](lib/jwt.ts#L1-L200)

**Sensitive components & files (summary + why they are sensitive)**

- `lib/firestore.ts` — Firestore access and data persistence.
  - Why sensitive: writes/reads pipelines; houses creation of workflows and generation of `hmacSecret` (via `hmac.generateSecret`). Contains logic that maps `ownerId` to `user_workflows`.
  - Important functions: `createWorkflow`, `getWorkflowInternal` (returns `hmacSecret` — DO NOT expose), `getWorkflowIfOwner`, `updateWorkflow`, `createSubmission`, `updateSubmissionWebhookStatus`.
  - File: [lib/firestore.ts](lib/firestore.ts#L1-L200)

- `types/workflow.ts` — canonical types and the `WorkflowSchema` definition.
  - Why sensitive: `WorkflowSchema` includes `hmacSecret` and `createdAt`/`updatedAt` types (Timestamp|string). This file documents which fields must never be returned to browser clients.
  - File: [types/workflow.ts](types/workflow.ts#L1-L200)

- `lib/hmac.ts` — webhook signing utilities.
  - Why sensitive: signs payloads with HMAC-SHA256 using `hmacSecret` stored per-workflow. Recipients rely on header `X-LegalFlow-Signature`.
  - Functions: `generateSecret()`, `generateHmacSignature(payload, secret)`, `buildWebhookHeaders(payload, secret)`.
  - File: [lib/hmac.ts](lib/hmac.ts#L1-L200)

- `lib/jwt.ts` and `lib/users.ts` — authentication and user storage.
  - Why sensitive: JWT secret (`process.env.JWT_SECRET`) and user `passwordHash` values. Ensure `JWT_SECRET` is set in production and not checked into source.
  - Files: [lib/jwt.ts](lib/jwt.ts#L1-L200), [lib/users.ts](lib/users.ts#L1-L200)

- `lib/sanitize.ts` — input sanitizer.
  - Why sensitive: central sanitization logic that protects against XSS and injection. Changes here affect all stored data and outgoing webhook payloads.
  - Behavior: removes HTML via `isomorphic-dompurify`, strips dangerous schemes, truncates long strings, recursively sanitizes objects/arrays.
  - File: [lib/sanitize.ts](lib/sanitize.ts#L1-L200)

- `public/embed.js` — the embeddable client script.
  - Why sensitive: fetches `/api/widget/<id>` and renders a DOM-based form on external origins. It must handle missing or forbidden responses gracefully and never expose `hmacSecret`.
  - File: [public/embed.js](public/embed.js#L1-L200)


**Quick usage examples**

- Create workflow (client):

  POST /api/workflows
  Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
  Body (JSON): { name: "Intake form", fields: [...], theme: {...}, webhookUrl: "https://example.com/webhook", allowedDomains: ["https://client.example"] }

- Embed snippet (host page):

  <script src="https://localhost:3000/embed.js" data-workflow-id="wf_xxx" data-token=""></script>

  embed.js will call `/api/widget/<id>` and render the form into `#legalflow-widget`.



