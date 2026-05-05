# PanicProof

PanicProof is a production-looking demo app that turns messy consumer-problem artifacts into a calm action board with extracted facts, a timeline, prioritized actions, editable drafts, and a polished PDF evidence summary.

It is not a legal-advice app. Generated facts, actions, and drafts are organization and drafting aids and must be reviewed by a human before use.

![PanicProof landing page](/public/screenshots/panicproof-home.png)

![PanicProof case workbench](/public/screenshots/panicproof-workbench.png)

## What Works

- No-auth Next.js App Router app with TypeScript, Tailwind CSS, and shadcn/ui.
- SQLite local development with Prisma and a Neon/Postgres-ready schema for deployment.
- Seeded sample cases for flight cancellation, security deposit, and chargeback/refund disputes.
- One-click sample loading from the home page and `/samples`.
- Upload flow with local text/PDF extraction and image/screenshot review placeholders.
- Editable extracted facts before action generation.
- Prioritized actions, editable action text, complete/done state, regenerated drafts, and PDF export.
- OpenRouter integration behind a server utility, with deterministic demo mode when no key is set.
- Render Blueprint in `render.yaml`.

## Local Setup

```bash
npm install
npm run prisma:migrate
npm run seed
npm run dev
```

Open `http://localhost:3000`.

`npm run prisma:migrate` wraps `RUST_LOG=info npx prisma migrate dev`, which avoids a blank SQLite schema-engine error seen on some macOS/Node runtimes while still running the normal Prisma migration flow.

## Environment Variables

```bash
# Optional model-backed analysis through OpenRouter
OPENROUTER_API_KEY=""
OPENROUTER_MODEL="openai/gpt-4.1-mini"
OPENROUTER_SITE_URL="http://localhost:3000"

# Deployment database
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=verify-full"
```

Local demo mode uses SQLite at `prisma/dev.db` with no required API key. For Render + Neon, set `DATABASE_URL` to the pooled Neon Postgres connection string and use the Render build command in `render.yaml`. The deployed build uses `prisma/schema.postgres.prisma`.

## Tests

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Render Deployment

1. Push this repo to GitHub.
2. Create or choose a Neon project and copy its pooled Postgres `DATABASE_URL`.
3. In Render, create a Blueprint from the GitHub repo.
4. Fill the synced env vars:
   - `DATABASE_URL`
   - `OPENROUTER_API_KEY` if using model-backed analysis
   - `OPENROUTER_SITE_URL` with the deployed app URL
5. Render runs `npm ci && npm run render:build`, which generates Prisma, pushes the Postgres schema, seeds samples, and builds Next.js.

## 30-Second Demo Script

1. Start on the landing page and say: “PanicProof turns consumer-problem evidence into a calm action board.”
2. Click “Load sample case” for the flight cancellation scenario.
3. Show the three-column workbench: evidence on the left, editable facts and actions in the center, timeline/drafts/export on the right.
4. Edit one fact, click “Save facts,” then click “Generate action plan.”
5. Mark an action complete, copy a draft, and click “Export polished PDF.”
6. Close with: “Everything is reviewable and editable; this is organization and drafting support, not legal advice.”
