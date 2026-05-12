import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import { db } from "@/lib/db";
import { audits } from "@/db/schema";
import CopyShareButton from "@/components/copy-share-button";
import type {
  AuditResult,
  RecommendationSeverity,
  SavingsLevel,
  ToolRecommendation,
} from "@/lib/audit-engine/types";

function formatCurrency(value: number) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

function formatPercent(value: number) {
  return `${Math.max(0, Math.round(value || 0))}%`;
}

function getSavingsBadgeClasses(level: SavingsLevel | undefined) {
  if (level === "high") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (level === "medium") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function getSavingsBadgeLabel(level: SavingsLevel | undefined) {
  if (level === "high") {
    return "High savings opportunity";
  }

  if (level === "medium") {
    return "Medium savings opportunity";
  }

  return "Low savings opportunity";
}

function getSeverityBadgeClasses(severity: RecommendationSeverity | undefined) {
  if (severity === "high") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (severity === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function getTopRecommendations(recommendations: ToolRecommendation[]) {
  return [...recommendations]
    .sort((left, right) => right.monthlySavings - left.monthlySavings)
    .slice(0, 3);
}

export default async function PublicAuditPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  const audit = await db.query.audits.findFirst({
    where: eq(audits.publicId, publicId),
  });

  if (!audit) {
    notFound();
  }

  const result = audit.resultJson as AuditResult;
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/audit/${publicId}`;
  const sortedRecommendations = [...(result.recommendations ?? [])].sort(
    (left, right) => right.monthlySavings - left.monthlySavings
  );
  const topRecommendations = getTopRecommendations(sortedRecommendations);
  const summary = audit.summary || result.nextBestAction;
  const summarySourceLabel = audit.summarySource === "llm" ? "AI-generated summary" : "Fallback summary";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-900 text-sm font-semibold text-white">
              AI
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              AI Spend Auditor
            </span>
          </Link>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:w-auto"
            >
              Back home
            </Link>
            <Link
              href="/audit/new"
              className="inline-flex w-full items-center justify-center rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:w-auto"
            >
              Run another audit
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-12">
        <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
                AI Spend Audit Result
              </p>
              <p className="mt-2 text-sm text-slate-500">Public report ID: {publicId}</p>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {result.headline || "Your AI spend audit is ready"}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getSavingsBadgeClasses(result.savingsLevel)}`}
              >
                {getSavingsBadgeLabel(result.savingsLevel)}
              </span>
              {result.credexFit && (
                <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  Credex fit
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <p className="text-sm font-medium text-slate-500">Potential savings</p>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-4xl font-semibold tracking-tight text-emerald-600 sm:text-5xl">
                    {formatCurrency(result.totalMonthlySavings)}/mo
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-700">
                    {formatCurrency(result.totalAnnualSavings)}/year
                  </p>
                </div>
                <p className="max-w-sm text-sm leading-6 text-slate-600">{summary}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Current monthly spend
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatCurrency(result.totalMonthlySpend)}/mo
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Potential monthly savings
                </p>
                <p className="mt-3 text-2xl font-semibold text-emerald-600">
                  {formatCurrency(result.totalMonthlySavings)}/mo
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Annual savings
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatCurrency(result.totalAnnualSavings)}/yr
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Savings rate
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatPercent(result.savingsRatePercent)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Top recommendations
                </h2>
                <p className="text-sm text-slate-500">Ranked by monthly savings</p>
              </div>

              {topRecommendations.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {topRecommendations.map((recommendation) => (
                    <article
                      key={`${recommendation.toolId}-${recommendation.recommendedAction}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {recommendation.toolName}
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {recommendation.recommendedAction}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getSeverityBadgeClasses(recommendation.severity)}`}
                          >
                            {recommendation.severity}
                          </span>
                          <p className="text-sm font-semibold text-emerald-600">
                            Save {formatCurrency(recommendation.monthlySavings)}/mo
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {recommendation.reason}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-600">
                    No major waste detected. Keep monitoring usage as your team grows.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div
                className={`rounded-3xl border p-6 shadow-sm ${
                  result.credexFit
                    ? "border-cyan-200 bg-cyan-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  {result.credexFit
                    ? "High-value savings opportunity detected"
                    : "Keep your AI spend under control"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {result.credexFit
                    ? "Your audit suggests meaningful AI infrastructure or API spend. Exploring discounted AI/cloud credits could help capture more of this savings."
                    : "Your current spend does not show a major Credex-fit opportunity yet. Save this audit and get notified when new optimizations apply."}
                </p>
                <button
                  type="button"
                  className={`mt-5 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                    result.credexFit
                      ? "bg-cyan-600 text-white hover:bg-cyan-700"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {result.credexFit
                    ? "Save report and explore options"
                    : "Save this audit"}
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {summarySourceLabel}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{summary}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Shareable report</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  This public report does not include email, company name, or private lead details.
                </p>
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Public URL
                  </p>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="break-all font-mono text-sm text-slate-700">{publicUrl}</p>
                    <CopyShareButton url={publicUrl} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Recommendation breakdown
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  Full audit findings
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                {sortedRecommendations.length} recommendation
                {sortedRecommendations.length === 1 ? "" : "s"}
              </p>
            </div>

            {sortedRecommendations.length > 0 ? (
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {sortedRecommendations.map((recommendation) => (
                  <article
                    key={`${recommendation.toolId}-${recommendation.recommendedAction}-${recommendation.reason}`}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {recommendation.toolName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Type: {recommendation.type === "api" ? "API" : "Subscription"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getSeverityBadgeClasses(recommendation.severity)}`}
                      >
                        {recommendation.severity}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Current spend
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {formatCurrency(recommendation.currentSpend)}/mo
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Monthly savings
                        </p>
                        <p className="mt-2 text-base font-semibold text-emerald-600">
                          {formatCurrency(recommendation.monthlySavings)}/mo
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Annual savings
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {formatCurrency(recommendation.annualSavings)}/yr
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {recommendation.recommendedAction}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {recommendation.reason}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-base font-medium text-slate-900">
                  No major recommendations right now
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Your stack currently looks mostly efficient. Re-run the audit as usage changes.
                </p>
              </div>
            )}
          </div>
        </section>

        <LeadCaptureForm publicId={publicId} credexFit={result.credexFit} />
      </div>
    </main>
  );
}
