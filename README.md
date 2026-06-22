# Legal Workflow Platform

## Overview

Legal Workflow Platform enables lawyers to design, customize, and manage per-user legal intake workflows with field-level configuration, allowed domains, and webhook destinations.

When embedded using a secure script tag, workflows render dynamic forms on client websites and deliver HMAC-signed submissions to configured webhooks.

Updates made in the admin dashboard propagate to embedded forms so client sites always render the current workflow configuration.

## Features

- Workflow Builder
- Drag & Drop Fields
- Dynamic Lists
- Theme Customization
- Firestore Storage
- Embeddable Widget
- Webhook Integration
- HMAC Signature Verification
- Multi-User Architecture
- Domain Validation
- AI-Powered workflow Generation (Google AI)

Screenshots :
- Workflow Builder :
![System Flow](/public/createWorkflow_1.png)
- Drag & Drop Fields :
![System Flow](/public/createWorkflow_2.png)

## Architecture and System Flow

This application uses a Next.js App Router front-end and server functions to expose RESTful endpoints. Workflows and submissions are stored in Firestore. JWTs are used to secure user-specific APIs; HMAC headers sign webhook payloads. An embeddable `embed.js` script fetches workflow configuration and renders dynamic forms on client sites.

![System Flow](/public/LegalFlow.png)




## Tech Stack

- Next.js
- React + TypeScript
- shadcn/ui for UI components
- Tailwind CSS for styling
- Firebase / Firestore
- Zod for runtime validation
- jsonwebtoken for JWTs
- HMAC signing utilities for webhook verification
- Google AI models
- Vercel 

### HMAC signing flow

- **Where the secret is created:** When a workflow is created on the server a per-workflow HMAC secret is generated (see `lib/hmac.ts`). The secret is created server-side to sign webhook payloads.
- **Where it is stored:** The secret is stored in Firestore on the workflow document (field `hmacSecret`). Server helpers in `lib/firestore.ts` store the secret at creation time and include logic to _never_ serialize the secret back to browser clients (see `stripSecret` behavior).
- **When/how it's used:** When a submission is received (`POST /api/submit/[workflowId]`) the server sanitizes the submission and, if the workflow has a `webhookUrl`, the server computes an HMAC signature over the sanitized payload and sends it in request headers to the webhook endpoint. The header names and signing format are implemented in `lib/hmac.ts` (e.g. `X-LegalFlow-Signature`, `X-LegalFlow-Timestamp`).

### Origin validation (render + submit)

- **Why double-check:** The platform defends both the widget configuration fetch (render) and the submission ingestion (submit) to prevent unauthorized sites from embedding or submitting to workflows.
- **Render-time check:** The widget endpoint (`GET /api/widget/[workflowId]`) inspects the incoming `Origin` header and compares it against the workflow's `allowedDomains`. If the origin is not allowed, the endpoint returns `403 Forbidden` and the embeddable script will not render the form on that site.
- **Submit-time check:** The public submit endpoint (`POST /api/submit/[workflowId]`) performs a similar `Origin` check and will reject submissions that originate from disallowed domains. This prevents client-side bypass where an attacker might attempt to post directly to the submit endpoint from an unauthorized origin.
- **Implementation files:** See `app/api/widget/[workflowId]/route.ts` and `app/api/submit/[workflowId]/route.ts` for the precise checks and error handling.
- **Client behavior:** The embeddable `public/embed.js` script also handles `403` responses gracefully; the client should not assume the widget will always render and must handle blocked or missing theme/config responses.

### Dynamic rendering

- **How the embed script is loaded:** Host pages include a small script tag provided by the admin UI, for example:

  <script src="https://your-site.com/embed.js" data-workflow-id="wf_xxx" data-token=""></script>

  The script reads `data-workflow-id` from the script tag and initializes the widget container (`#legalflow-widget`) on the host page.

- **Config fetch on client load:** On initialization the script builds the widget URL and fetches the workflow configuration from the server (`GET /api/widget/[workflowId]`). The browser automatically includes the `Origin` header for the host page; the server validates it against the workflow's `allowedDomains` and returns `403` if disallowed.

- **What the script receives:** The widget endpoint returns a JSON `WidgetConfigResponse` with `id`, `name`, `fields`, and `theme`. The script uses this config to:
  - Generate and inject CSS rules that reflect the workflow `theme` (colors, font family, border radius, input style).
  - Render DOM form controls for each `field` (text, email, select, etc.) into the host page's widget container.

- **Submit flow from the host page:** When an end-user submits the form, the embed script posts the submission to `POST /api/submit/[workflowId]` from the host origin. The server again validates the `Origin` header and rejects disallowed origins. Submissions are sanitized server-side and, if configured, forwarded to the workflow's `webhookUrl` with HMAC headers.

- **Error handling:** The embed script gracefully handles non-OK responses (403, 404, 5xx) and missing fields/theme. It never exposes secrets (e.g., `hmacSecret`) and treats server-provided theme values as untrusted input that drives presentation only (not sensitive logic).



## Installation

1. Clone the repository

```bash
git clone https://github.com/anasbenraies/Legal-Workflow-Platform.git
cd Legal-Workflow-Platform

```

2. Install dependencies

```bash
npm install
# or
pnpm install
```

## Configuration

create a `.env.local` file and set the required variables:

Required environment variables:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_ADMIN_SDK_KEY ` = example {"type":"service_account","project_id": "abc..",...}
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL` for example `http://localhost:3000` for local development
- `GOOGLE_API_KEY` (for AI generation feature)


## Running Locally

Start the dev server:

```bash
npm run dev
# or
pnpm dev
```

Open `http://localhost:3000` and sign up to create workflows.

## API Documentation

- `POST /api/submit/[workflowId]` — Accepts submissions from embedded forms. Validates origin against the workflow's allowed domains, sanitizes input, stores submission in Firestore, and dispatches webhook (HMAC-signed).
- `GET /api/workflows` — List workflows for the authenticated user.
- `POST /api/workflows` — Create a new workflow (authenticated).
- `GET|PUT|DELETE /api/workflows/[id]` — Read, update, or delete a specific workflow (authenticated). PUT requests are validated with Zod and sanitized before write.
- `GET /api/widget/[workflowId]?token=` — Serve the embeddable widget configuration (token or other auth may be required depending on workflow settings).

Refer to `docs/API_AND_SENSITIVE.md` for detailed parameter shapes and expected responses.

## Folder Structure

- `app/` — Next.js app router pages and API routes
  - `api/` — Server endpoints (workflows, submit, widget, etc.)
- `components/` — React components (builder, fields, widget renderer)
- `lib/` — Utilities (Firestore helpers, sanitize, hmac, users)
- `public/` — Static assets including `embed.js`
- `types/` — TypeScript types

## Deployment


The project was initially intended to be deployed on Google Cloud Run for scalability . However, due to billing limitations and the rejection of international virtual cards (including CTI), I was unable to complete the setup.

I therefore switched to Vercel, which offers seamless Next.js support and simplified deployment without payment constraints. This ensured a smooth and reliable production deployment.


Deployment checklist:

1. Set environment variables in the hosting platform.
2. Ensure Firestore permissions and service account keys are configured.
3. Build and deploy the Next.js app using the host's recommended process.

## Contributing

1. Fork the repo and create a feature branch.
2. Open a pull request with a clear description of your changes.
3. Run tests and linters before submitting.

Please follow the repository code style and add tests for new features.

## License

This project is released under the MIT License. See the `LICENSE` file for details.
