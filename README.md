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
- Vercel 

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
