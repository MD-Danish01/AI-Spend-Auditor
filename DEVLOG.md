# DEVLOG.md

## Day 1 — 2026-05-07

**Hours worked:** 2.5

**What I did:**  
I started by understanding the product idea: a free AI spend audit tool that helps users enter their AI subscriptions, API spend, team size, and use case, then receive estimated savings and recommendations. I decided to build the project as a modular monolith instead of microservices because the goal was to ship a working MVP quickly. I initialized the Next.js project, set up the basic project structure, and built the first version of the landing page.

**What I learned:**  
I learned that the project is not just a calculator. It needs to feel like a useful product: clear landing page, low-friction audit flow, public report, lead capture, and trustworthy recommendations.

**Blockers / what I'm stuck on:**  
The main early confusion was architecture. I considered microservices, but realized it would add deployment and debugging complexity without helping the MVP.

**Plan for tomorrow:**  
Build the spend input form and design the user flow from landing page to audit generation.

---

## Day 2 — 2026-05-08

**Hours worked:** 3

**What I did:**  
I designed and implemented the multi-step spend input form. I split the form into three steps: team context, AI tools, and review. The form collects team size, primary use case, subscription tools, API providers, plans, seats, and monthly spend. I also added localStorage persistence so the form state is not lost on refresh.

**What I learned:**  
I learned that a long form feels overwhelming, so a step-based flow is better for UX. I also decided not to ask for email before showing the audit result because the product should provide value first.

**Blockers / what I'm stuck on:**  
The main challenge was deciding how to handle API spend. Token-level input would be more detailed, but most founders know their monthly API bill, not token counts. I chose simple monthly API spend input for the MVP.

**Plan for tomorrow:**  
Build the rule-based audit engine and test it with sample inputs.

---

## Day 3 — 2026-05-09

**Hours worked:** 4

**What I did:**  
I implemented the audit engine inside `lib/audit-engine/`. I separated the logic into types, pricing data, rules, and the main `calculateAudit()` function. The engine calculates total monthly spend, estimated monthly savings, annual savings, savings level, recommendations, and high-savings eligibility. I manually tested the function using sample inputs.

**What I learned:**  
I learned why the audit engine should be deterministic and testable. Savings calculations should not depend on an LLM because users need explainable financial reasoning.

**Blockers / what I'm stuck on:**  
The hardest part was writing rules that felt useful but not exaggerated. I added low-savings behavior so the app does not manufacture fake savings when the user’s spend already looks efficient.

**Plan for tomorrow:**  
Connect the form to an API route and return the audit result object from the backend.

---

## Day 4 — 2026-05-10

**Hours worked:** 4.5

**What I did:**  
I connected the form submission to `/api/audits`. The API route validates input, calls `calculateAudit()`, and returns an audit result. After confirming the form → API → audit engine → result object flow worked, I added Neon Postgres and Drizzle ORM. I created the database schema for audits and leads, added migrations, and started saving audit results in the database.

**What I learned:**  
I learned how much cleaner the flow becomes when the database becomes the source of truth. Instead of relying on localStorage for results, each audit can now get a unique public ID.

**Blockers / what I'm stuck on:**  
I hit a Drizzle schema warning because the older `pgTable` extra config object style was deprecated. I fixed it by switching to the newer array-based index format.

**Plan for tomorrow:**  
Create the public audit report route `/audit/[publicId]` and make the result page fetch from the database.

---

## Day 5 — 2026-05-11

**Hours worked:** 4

**What I did:**  
I created the public audit report page at `/audit/[publicId]`. The page fetches the audit from Neon using the public ID and renders a screenshot-worthy result card with total savings, annual savings, savings rate, recommendations, summary, and CTA. I also added lead capture below the result page and connected it to `/api/leads`.

**What I learned:**  
I learned the importance of separating public audit data from private lead data. Public reports should show recommendations and savings, but not email, company name, or role.

**Blockers / what I'm stuck on:**  
I had to think through the best lead capture UX. I avoided a popup and placed the form below the result so it feels like “save this report,” not a forced signup.

**Plan for tomorrow:**  
Add confirmation email sending and basic abuse protection for the lead form.

---

## Day 6 — 2026-05-12

**Hours worked:** 5

**What I did:**  
I added Resend email sending using the verified sending domain `reports.danishdev.me`. After a user submits the lead form, the app saves the lead and sends a confirmation email with the audit report link. I also added a honeypot field for basic spam protection. Then I implemented Groq-powered AI summaries using `llama-3.3-70b-versatile`, with fallback summaries if the API fails.

**What I learned:**  
I learned that LLM output needs guardrails. One generated summary exposed an internal variable name like `credexFit`, so I improved the prompt, stopped passing raw internal wording, and added forbidden-term fallback behavior.

**Blockers / what I'm stuck on:**  
The initial AI summary was too developer-facing and over-promoted discounted credits in a low-savings case. I fixed this by making the prompt more strict and only allowing credit-related language for high-savings cases.

**Plan for tomorrow:**  
Add automated tests, GitHub Actions CI, and complete project documentation.

---

## Day 7 — 2026-05-13

**Hours worked:** 5

**What I did:**  
I added automated audit engine tests using Node’s test runner with `tsx`. The tests cover high API spend, low-spend honesty, extra paid seats, overlapping tools, and annual savings calculation. I also added GitHub Actions CI to run lint, tests, and production build on pushes and pull requests to `master`. After fixing the CI Node version issue, the workflow passed with green checks.

**What I learned:**  
I learned how GitHub Actions works as a temporary Ubuntu runner that installs dependencies, runs tests, checks linting, and builds the project. This gave me more confidence that the project works outside my local machine.

**Blockers / what I'm stuck on:**  
The first CI test run failed because the test path did not resolve correctly in GitHub Actions. I fixed the test setup and aligned the Node version so the same test command passes locally and in CI.

**Plan for tomorrow:**  
Polish the README and required documentation, verify deployment, take screenshots, and do a final end-to-end test from form submission to email confirmation.