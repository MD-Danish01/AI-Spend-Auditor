"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  AuditResult,
  RecommendationSeverity,
  SavingsLevel,
  ToolRecommendation,
} from "@/lib/audit-engine/types";

const STORAGE_KEY = "ai-spend-auditor-latest-result";

function formatCurrency(amount: number | undefined) {
  const safeAmount = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  return `$${Math.round(safeAmount).toLocaleString()}`;
}

function formatPercent(value: number | undefined) {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `${Math.max(0, Math.round(safeValue))}%`;
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

function isAuditResult(value: unknown): value is AuditResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<AuditResult>;

  return (
    typeof result.headline === "string" &&
    typeof result.totalMonthlySpend === "number" &&
    typeof result.totalMonthlySavings === "number" &&
    typeof result.totalAnnualSavings === "number" &&
    typeof result.savingsRatePercent === "number" &&
    typeof result.credexFit === "boolean" &&
    typeof result.nextBestAction === "string" &&
    Array.isArray(result.recommendations)
  );
}

export default function AuditResultPage() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
          setAuditResult(null);
          return;
        }

        const parsed = JSON.parse(raw) as unknown;
        setAuditResult(isAuditResult(parsed) ? parsed : null);
      } catch {
        setAuditResult(null);
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const sortedRecommendations = useMemo(
    () =>
      auditResult
        ? [...auditResult.recommendations].sort(
            (left, right) => right.monthlySavings - left.monthlySavings
          )
        : [],
    [auditResult]
  );

  const topRecommendations = useMemo(
    () => getTopRecommendations(sortedRecommendations),
    [sortedRecommendations]
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">
              AI Spend Auditor
            </p>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Loading audit result...
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (!auditResult) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16 text-center">
          <div className="w-full rounded-[32px] border border-slate-200 bg-white px-8 py-12 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">
              AI Spend Auditor
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              No audit result found
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Run a new audit to generate your AI spend report.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/audit/new"
                className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                Start free audit
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const summaryText = `Your audit found ${auditResult.savingsLevel} savings potential across your AI stack. The largest opportunities come from the recommendations below. ${auditResult.nextBestAction}`;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
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

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href="/audit/new"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Run another audit
            </Link>
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
            >
              Share link coming soon
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Back to home
          </Link>
        </div>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
                AI Spend Audit Result
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Generated from your AI tool stack
              </p>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {auditResult.headline || "Your AI spend audit is ready"}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getSavingsBadgeClasses(auditResult.savingsLevel)}`}
              >
                {getSavingsBadgeLabel(auditResult.savingsLevel)}
              </span>
              {auditResult.credexFit && (
                <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  Credex fit
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <p className="text-sm font-medium text-slate-500">
                {auditResult.totalMonthlySavings >= 100
                  ? "Potential savings"
                  : "Your stack looks efficient"}
              </p>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-4xl font-semibold tracking-tight text-emerald-600 sm:text-5xl">
                    {formatCurrency(auditResult.totalMonthlySavings)}/mo
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-700">
                    {formatCurrency(auditResult.totalAnnualSavings)}/year
                  </p>
                </div>
                <p className="max-w-sm text-sm leading-6 text-slate-600">
                  {auditResult.totalMonthlySavings >= 100
                    ? "These are the strongest savings opportunities currently visible from your submitted stack."
                    : "No major waste was detected in your current AI stack. Continue monitoring usage as your team evolves."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Current monthly spend
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatCurrency(auditResult.totalMonthlySpend)}/mo
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Potential monthly savings
                </p>
                <p className="mt-3 text-2xl font-semibold text-emerald-600">
                  {formatCurrency(auditResult.totalMonthlySavings)}/mo
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Annual savings
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatCurrency(auditResult.totalAnnualSavings)}/yr
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Savings rate
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatPercent(auditResult.savingsRatePercent)}
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
                <p className="text-sm text-slate-500">
                  Ranked by monthly savings
                </p>
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
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{summaryText}</p>
              </div>

              <div
                id="save-report"
                className={`rounded-3xl border p-6 shadow-sm ${
                  auditResult.credexFit
                    ? "border-cyan-200 bg-cyan-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  {auditResult.credexFit
                    ? "High-value savings opportunity detected"
                    : "Keep your AI spend under control"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {auditResult.credexFit
                    ? "Your audit suggests meaningful AI infrastructure or API spend. Exploring discounted AI/cloud credits could help capture more of this savings."
                    : "Your current spend does not show a major Credex-fit opportunity yet. Save the audit and get notified when new optimizations apply."}
                </p>
                <a
                  href="#lead-capture"
                  className={`mt-5 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                    auditResult.credexFit
                      ? "bg-cyan-600 text-white hover:bg-cyan-700"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {auditResult.credexFit
                    ? "Save report and explore options"
                    : "Save this audit"}
                </a>
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
                {sortedRecommendations.length} recommendation{sortedRecommendations.length === 1 ? "" : "s"}
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

        <section id="lead-capture" className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Save report
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Want this report in your inbox?
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Lead capture will be connected next. Email, company name, and role will be
              collected here after the user has already seen value.
            </p>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900">Email</label>
                <input
                  type="email"
                  disabled
                  placeholder="you@company.com"
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900">
                  Company name optional
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Acme Inc."
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900">Role optional</label>
                <input
                  type="text"
                  disabled
                  placeholder="CTO"
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-400"
                />
              </div>
              <button
                type="button"
                disabled
                className="mt-2 inline-flex cursor-not-allowed items-center justify-center rounded-full bg-slate-300 px-6 py-3 text-sm font-semibold text-white"
              >
                Email this report
              </button>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Public reports will not include email, company name, or private lead details.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Shareable report
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Shareable report
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Public audit URLs will be connected after database storage is added.
            </p>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Preview URL</p>
              <p className="mt-2 break-all font-mono text-sm text-slate-700">/audit/[publicId]</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/audit/new"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                Run another audit
              </Link>
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-400"
              >
                Copy share link
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
