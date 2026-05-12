# ARCHITECTURE.md

## 1. Project overview

AI Spend Auditor helps startup founders, CTOs, engineering managers, and small teams audit monthly AI tool spend. Users enter team size, primary use case, AI subscriptions, API providers, plans, seats, and monthly spend. The app runs a rule-based audit engine to estimate monthly and annual savings, generates an AI summary using Groq, stores the audit in Neon Postgres, creates a public shareable audit URL, captures leads after value is shown, and sends a confirmation email using Resend.

## 2. Architecture style

This project uses a modular monolith. The UI, API routes, audit engine, and data access live in one Next.js app, but are separated into clean modules.

Why modular monolith over microservices:
- Faster MVP shipping
- Simpler deployment
- Easier debugging
- Fewer moving parts
- Still maintainable through clean modules

## 3. High-level system diagram (Mermaid)

```mermaid
flowchart TD
    A[Landing page] --> B[Spend form]
    B --> C[POST /api/audits]
    C --> D[calculateAudit]
    D --> E[Groq summary / fallback]
    E --> F[Neon DB]
    F --> G[/audit/[publicId]]
    G --> H[Lead capture]
    H --> I[POST /api/leads]
    I --> J[Resend email]
```

## 4. Data flow from form submission to public report

1. User submits the spend form with tools, plans, seats, usage type, and monthly spend.
2. The client posts payload to `POST /api/audits`.
3. The audit engine runs `calculateAudit`, applying deterministic pricing rules and savings logic.
4. The server requests a summary from Groq. If Groq fails, a fallback summary template is used.
5. The audit result and summary are stored in Neon Postgres via Drizzle.
6. The user is redirected to `/audit/[publicId]`, which renders the public audit page.
7. After value is shown, the lead capture form submits to `POST /api/leads`.
8. The lead is stored and a confirmation email is sent with Resend.

## 5. Why this stack was chosen

- Next.js App Router provides UI, API routes, and SSR in one deployable unit.
- TypeScript improves correctness for audit math and data contracts.
- Tailwind CSS enables fast UI iteration and consistent styling.
- Neon Postgres is a reliable, managed relational database for audits and leads.
- Drizzle ORM keeps queries type-safe and schema-driven.
- Groq SDK enables fast AI summaries without impacting audit math.
- Resend provides straightforward transactional email delivery.
- GitHub Actions runs tests and linting automatically.
- Vercel provides fast, production-grade deployments for Next.js.

## 6. Folder/module structure

- `app/` App Router pages and API routes
- `components/` UI components (forms, buttons, lead capture)
- `lib/` shared services (AI summary, email, database clients)
- `lib/audit-engine/` audit rules, pricing, and calculations
- `db/` schema and Drizzle setup
- `drizzle/` migrations and metadata
- `tests/` audit engine tests

## 7. Audit engine architecture

The audit engine is rule-based and deterministic. It does not use AI for audit math.

- Input: tools, plan, seats, monthly spend, and usage type
- Rules: per-tool pricing rules and savings heuristics
- Output: monthly savings, annual savings, and recommendations

Because the engine is deterministic, it is testable with unit tests and produces stable results. AI is only used to summarize the results, not to compute them.

## 8. API routes

- `POST /api/audits` creates an audit, runs `calculateAudit`, generates summary, and persists results
- `POST /api/leads` stores lead info and sends confirmation email
- `GET /audit/[publicId]` renders a public report page

## 9. Database design

Neon Postgres stores normalized audit data and lead records. The design focuses on:

- Audit metadata (inputs, totals, savings)
- Summary text (AI or fallback)
- Public share token (`publicId`)
- Lead capture data tied to audits

Public audit pages do not expose email, company name, or role.

## 10. AI summary generation

The server calls Groq to create a concise summary of the audit results. If Groq fails, a fallback summary is used to keep the UX consistent and reliable. The summary is saved alongside the audit for quick retrieval on public pages.

## 11. Lead capture and email flow

Lead capture is shown after the audit results are visible. Submissions:

- Pass a honeypot field for basic spam protection
- Create a lead record in Neon
- Trigger a confirmation email via Resend

## 12. Security and privacy

- Public audit pages avoid exposing email, company name, or role
- API inputs are validated on the server
- Honeypot field helps reduce spam
- Environment secrets are stored in Vercel and GitHub Actions

## 13. Error handling and fallback behavior

- Groq failures use a fallback summary
- Database errors return safe error responses without leaking details
- Form submissions validate inputs and show actionable errors
- Audit math remains deterministic even if AI is unavailable

## 14. What I would change for 10k audits/day

- Move audit creation to a queue with background workers
- Add read replicas or caching for public audit pages
- Implement rate limiting and abuse detection
- Precompute and store derived metrics for faster reads
- Split summary generation into async jobs with retries

## 15. Trade-offs

- A modular monolith speeds delivery but limits independent scaling of components
- Deterministic rules improve trust but require ongoing pricing updates
- Storing summaries improves page speed but can become stale if logic changes
- Public sharing improves virality but requires careful privacy controls

