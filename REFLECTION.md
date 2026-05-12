# REFLECTION.md

## 1. The hardest bug I hit this week, and how I debugged it

The hardest issue I hit was not a normal code error, but an AI output quality problem. After adding the Groq-powered summary generation, one generated summary included developer-facing wording like “if credexFit is true.” That was a serious problem because `credexFit` is an internal boolean used by the backend, not something a user should ever see in a public audit report.

I debugged it by first checking whether the problem came from the audit engine or from the LLM prompt. The audit engine was returning the correct result: low savings, no high-savings CTA, and correct monthly and annual savings. The issue was that the prompt was passing raw internal context too directly, so the model copied the internal variable language into the final summary.

I fixed it by improving the system prompt and changing the data passed to the model. Instead of exposing raw variables like `credexFit`, I converted them into user-facing context such as “low or moderate savings; do not mention discounted credits.” I also added stronger prompt rules: no internal variable names, no JSON keys, no conditional developer wording, and no over-promotion of discounted credits for low-savings cases.

Finally, I added a forbidden-term guard so that if the model output contains terms like `credexFit`, `resultJson`, or other internal implementation words, the app falls back to a deterministic summary. This made the feature safer and more reliable while keeping the audit math fully rule-based.

---

## 2. A decision I reversed mid-week, and what made me reverse it

One decision I reversed was the architecture approach. At first, I was thinking about whether I should design the app with a more complex architecture, possibly separating parts like audit calculation, database handling, email, and AI summary generation into different services. That sounded impressive at first, but it was not the right choice for this project.

After thinking through the user flow, I realized the important goal was not to show architecture complexity. The goal was to ship a working product that users could actually complete end-to-end: fill the form, generate an audit, get a public report, save their email, and receive a confirmation email. Microservices would have added extra deployment, debugging, and communication complexity without improving the user experience at this stage.

I reversed the decision and chose a modular monolith using Next.js. The app stays in one deployable codebase, but the logic is still separated cleanly into modules: audit engine, database schema, API routes, email helper, AI summary helper, and UI components.

This was the better trade-off because it allowed me to move faster while still keeping the code maintainable. If the product later needed to handle high traffic, I could move slow or external-service-dependent tasks like AI summary generation and email sending into background jobs or separate workers. But for the MVP, a modular monolith was the right balance.

---

## 3. What I would build in week 2 if I had it

If I had another week, I would first add PDF export for the full audit report. A PDF would make the product more useful for founders, finance teams, and engineering managers because they could share the report internally with cofounders or team leads.

The second feature I would build is benchmark mode. The app could show metrics like “AI spend per team member” or “AI spend per developer” and compare it against rough startup-size benchmarks. This would make the report more valuable because users would not only see savings recommendations, but also understand whether their spend is normal for their team size.

I would also add an admin dashboard for captured leads. The dashboard would show high-savings audits, submitted emails, company names, roles, total monthly spend, and estimated savings. This would make the product more useful as a lead-generation tool because high-intent users could be prioritized.

Another improvement would be better analytics instrumentation. I would track events like landing page views, audit starts, audit completions, public report views, lead submissions, and email sent status. This would help identify where users drop off.

Finally, I would improve the pricing refresh workflow. AI tool pricing changes often, so I would create a clear update process for pricing sources and maybe add an admin-editable pricing table later.

---

## 4. How I used AI tools

I used AI tools as assistants, not as a replacement for understanding the project. AI helped me think through architecture, generate UI structure, improve prompts, debug issues, and write documentation drafts. I also used code assistance for repetitive boilerplate, such as form structure, helper functions, and documentation formatting.

I did not fully trust AI with the most important business logic. The audit engine needed to be deterministic, explainable, and testable, so I manually reviewed the rules for savings calculation, API spend thresholds, overlapping tools, extra seats, and low-savings behavior. I wanted the result to be understandable and defensible, not random or model-generated.

One specific time AI was wrong was during summary generation. The generated summary included the internal variable name `credexFit` and used conditional wording that was not appropriate for users. I caught this by reading the generated public report carefully and comparing it with the actual audit result. Then I improved the prompt and added a forbidden-term fallback guard.

AI was useful for speed, but I still had to make product decisions myself: where to capture email, why not to block the report behind signup, how to keep public reports private, and why audit math should not be generated by an LLM. This project helped me understand that AI tools are most useful when paired with clear human judgment.

---

## 5. Self-rating

### Discipline: 8/10

I stayed focused on shipping the core flow first: form, audit engine, database, public report, lead capture, email, AI summary, tests, and CI. I avoided bonus features until the main product loop was working.

### Code quality: 7/10

The code is structured into clear modules, and the audit engine is separated from UI, database, and AI summary logic. There is still room to improve by adding more validation, better shared types across client/server boundaries, and more edge-case tests.

### Design sense: 7/10

The landing page, form, and result page follow a clean white SaaS-style design with good hierarchy and spacing. The result page is designed to be screenshot-worthy, but I could still improve micro-interactions, empty states, and visual polish.

### Problem-solving: 8/10

I handled several real issues: choosing the right architecture, designing API spend input, fixing Drizzle schema warnings, improving AI summary quality, and resolving CI test failures. I tried to solve problems by simplifying the system rather than adding unnecessary complexity.

### Entrepreneurial thinking: 7/10

I treated the project as a product, not just a coding task. I thought about the user flow, value-before-email principle, lead capture, public sharing, savings honesty, and how the tool could generate qualified interest. I still need more real user interviews to improve the product beyond assumptions.