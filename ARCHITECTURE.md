# ARCHITECTURE.md

## Project Overview

AI Spend Auditor is a web application that helps startup founders and engineering managers audit their monthly AI tool spend. Users enter the AI tools they use, their plan, number of seats, monthly spend, team size, and primary use case. The application then calculates potential monthly and annual savings, gives per-tool recommendations, generates a personalized AI summary, captures qualified leads, and creates a shareable public audit report URL.

The goal of this project is to ship a useful MVP that Credex could plausibly use as a lead-generation tool for startups overspending on AI tools and cloud/AI infrastructure credits.

---

## Architecture Style

This project uses a **modular monolith architecture**.

I intentionally avoided microservices because this is a 7-day MVP where speed, simplicity, and reliability matter more than infrastructure complexity. A modular monolith lets me keep the product easy to develop, test, deploy, and debug while still separating the important parts of the system into clean modules.

The application is split into separate logical areas:

- Landing page and marketing UI
- Spend input form
- Audit engine
- Audit result page
- AI summary generation
- Lead capture
- Shareable public audit page
- Database access layer
- Email sending layer
- Tests and documentation

If this product scaled significantly, some parts could later be extracted into separate services or background jobs, but starting with microservices would slow down the MVP without giving immediate value.

---

## Tech Stack

### Frontend

- **Next.js** for the full-stack React framework
- **TypeScript** for type safety and fewer runtime bugs
- **Tailwind CSS** for fast, responsive UI development
- **LocalStorage** for persisting form state across page reloads

### Backend

- **Next.js API Routes / Server Actions** for backend logic
- **Neon Postgres** for relational data storage
- **Drizzle ORM** for type-safe database queries
- **Resend** for transactional email
- **LLM API** for personalized audit summary generation
- **Fallback template summary** if the LLM API fails

### Deployment

- **Vercel** for frontend and backend deployment
- **Neon** for serverless Postgres database
- **GitHub Actions** for linting and tests on push

---

## Why I Chose This Stack

I chose **Next.js** because the assignment needs both frontend pages and backend API functionality. Next.js allows me to build the landing page, audit form, result pages, API routes, dynamic public URLs, and Open Graph metadata inside one project.

I chose **TypeScript** because the audit engine depends on structured data such as tools, plans, pricing, seats, use cases, and savings calculations. TypeScript helps prevent mistakes in these calculations.

I chose **Postgres through Neon** because the data is relational and structured. The app stores audits, leads, and public audit reports. A relational database makes it easier to keep audit records and lead records consistent.

I chose **Vercel** because it gives fast deployment for Next.js applications and makes it easy to ship a working product quickly.

I chose a **modular monolith** because this project needs to be shipped quickly, tested properly, and deployed reliably. Microservices would add unnecessary deployment, communication, and debugging complexity for this stage.

---

## High-Level System Diagram

```mermaid
flowchart TD
    A[Cold Visitor] --> B[Landing Page]
    B --> C[Spend Input Form]

    C --> D[LocalStorage Persistence]
    C --> E[Create Audit Request]

    E --> F[Next.js API Route]
    F --> G[Audit Engine]

    G --> H[Pricing Data]
    G --> I[Rule-Based Savings Logic]
    G --> J[Audit Result Object]

    J --> K[LLM Summary API]
    K --> L[AI Summary]
    K --> M[Fallback Summary if API Fails]

    J --> N[Neon Postgres Database]
    L --> N
    M --> N

    N --> O[Audit Results Page]
    O --> P[Lead Capture Form]
    P --> Q[Save Lead to Database]
    Q --> R[Send Confirmation Email]

    O --> S[Shareable Public Audit URL]
    S --> T[Public Audit Page without Email or Company Details]