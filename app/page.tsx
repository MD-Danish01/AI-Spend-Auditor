import Link from "next/link";

const recommendationRows = [
  {
    tool: "Cursor Business",
    action: "Review seat allocation",
    savings: "$80/mo",
  },
  {
    tool: "ChatGPT Team",
    action: "Downgrade light users",
    savings: "$60/mo",
  },
  {
    tool: "OpenAI API",
    action: "Explore discounted credits",
    savings: "$150/mo",
  },
];

const problemCards = [
  {
    title: "Too many paid seats",
    description:
      "Teams often keep premium seats active for users who only need occasional access.",
  },
  {
    title: "Wrong plan for current usage",
    description:
      "Startup teams may stay on business or team plans even when simpler plans are enough.",
  },
  {
    title: "API spend grows silently",
    description:
      "Usage-based AI APIs can become expensive before anyone reviews the pattern.",
  },
];

const steps = [
  {
    title: "Add your tools",
    description: "Select AI tools, plans, seats, and monthly spend.",
  },
  {
    title: "Run the audit",
    description:
      "The rule-based engine checks plan fit, seats, alternatives, and credit opportunities.",
  },
  {
    title: "Review recommendations",
    description:
      "See current spend, suggested action, estimated savings, and reasoning.",
  },
  {
    title: "Share or save",
    description:
      "Capture the report by email and generate a public shareable audit URL.",
  },
];

const features = [
  {
    title: "Monthly and annual savings",
    description:
      "Get a clear savings estimate in both monthly and annual terms for fast decision-making.",
  },
  {
    title: "Per-tool breakdown",
    description:
      "Review every tool individually, including seats, current spend, and recommended changes.",
  },
  {
    title: "Plan-fit recommendations",
    description:
      "Spot when teams are paying for a plan tier that no longer matches real usage.",
  },
  {
    title: "AI-generated summary",
    description:
      "Turn the detailed findings into an executive-ready summary your team can read quickly.",
  },
  {
    title: "Email report capture",
    description:
      "Save the audit output for follow-up without slowing down the initial free analysis.",
  },
  {
    title: "Shareable public URL",
    description:
      "Generate a link to share the report with founders, finance, or engineering leadership.",
  },
];

const trustPoints = ["No login required", "2-minute input", "Value before email"];

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "What you get", href: "#what-you-get" },
  { label: "For startups", href: "#for-startups" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-900 text-sm font-semibold text-white">
              AI
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              AI Spend Auditor
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Link
            href="/audit/new"
            className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
          >
            Start free audit
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
                Free AI infrastructure spend audit
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Find hidden waste in your AI tool spend
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Enter your AI tools, team size, plans, and monthly spend. Get an
                instant audit with savings opportunities, plan-fit
                recommendations, and a shareable report.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/audit/new"
                  className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
                >
                  Run free audit
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  See how it works
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-600" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)] sm:p-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Audit preview</p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                      $3,480/year potential savings
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Based on sample AI tool usage
                    </p>
                  </div>
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    Preview
                  </span>
                </div>

                <div className="mt-8 space-y-3">
                  {recommendationRows.map((row) => (
                    <div
                      key={row.tool}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {row.tool}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{row.action}</p>
                        </div>
                        <p className="text-sm font-semibold text-emerald-600">
                          Save {row.savings}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                  <p className="text-sm leading-6 text-slate-700">
                    High API spend detected. Credex-style discounted credits may
                    help reduce infrastructure cost.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              The problem
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Most teams don&apos;t know they&apos;re overspending
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              AI software budgets often spread across seats, subscriptions, and
              API usage before anyone has a clean view of what is worth keeping.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {problemCards.map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                From AI bill to savings report in minutes
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="what-you-get" className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              What you get
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              An audit report your team can act on
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="for-startups" className="bg-slate-900">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  High savings opportunity
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Found meaningful savings?
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  If your audit shows high API or subscription spend, the report
                  can surface options to explore discounted AI and cloud
                  credits.
                </p>
              </div>

              <div className="mt-8 lg:mt-0">
                <Link
                  href="/audit/new"
                  className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Start free audit
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 text-sm text-slate-600 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-slate-900">AI Spend Auditor</p>
            <p className="mt-2">Free AI spend audit for startup teams.</p>
          </div>

          <div className="flex flex-wrap gap-6">
            <a href="#" className="transition hover:text-slate-900">
              Privacy
            </a>
            <a href="#" className="transition hover:text-slate-900">
              Contact
            </a>
            <a href="#" className="transition hover:text-slate-900">
              GitHub
            </a>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-500">
            Savings are estimates based on public pricing and user-provided
            inputs.
          </p>
        </div>
      </footer>
    </div>
  );
}
