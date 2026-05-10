import { applyCrossToolRules, applyToolRules } from "@/lib/audit-engine/rules";
import type {
  AuditInput,
  AuditResult,
  RecommendationSeverity,
  SanitizedAuditInput,
  SanitizedToolSpendInput,
  ToolRecommendation,
} from "@/lib/audit-engine/types";

const LOW_SAVINGS_THRESHOLD = 100;
const HIGH_SAVINGS_THRESHOLD = 500;
const CREDex_SAVINGS_THRESHOLD = 500;
const CREDex_TOTAL_SPEND_THRESHOLD = 1500;
const HIGH_API_SPEND_THRESHOLD = 500;

function roundDollars(value: number) {
  return Math.max(0, Math.round(value));
}

function sanitizeNumber(value: number | undefined, fallback = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return value;
}

function sanitizeMonthlySpend(value: number | undefined) {
  return Math.max(0, sanitizeNumber(value, 0));
}

function sanitizeSeats(value: number | undefined) {
  const seats = Math.floor(sanitizeNumber(value, 1));
  return seats >= 1 ? seats : 1;
}

function sanitizeInput(input: AuditInput): SanitizedAuditInput {
  return {
    teamSize: Math.max(1, Math.floor(sanitizeNumber(input.teamSize, 1))),
    primaryUseCase: input.primaryUseCase,
    estimatedTotalMonthlySpend:
      input.estimatedTotalMonthlySpend === undefined
        ? undefined
        : sanitizeMonthlySpend(input.estimatedTotalMonthlySpend),
    tools: input.tools.map((tool): SanitizedToolSpendInput => ({
      id: tool.id,
      type: tool.type,
      toolName: tool.toolName,
      plan: tool.plan,
      seats: sanitizeSeats(tool.seats),
      monthlySpend: sanitizeMonthlySpend(tool.monthlySpend),
      apiUsage: tool.apiUsage,
      mainModel: tool.mainModel,
    })),
  };
}

function dedupeRecommendations(recommendations: ToolRecommendation[]): ToolRecommendation[] {
  const seen = new Set<string>();

  return recommendations.filter((recommendation) => {
    const key = [
      recommendation.toolId,
      recommendation.recommendedAction,
      recommendation.reason,
    ].join("::");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function severityWeight(severity: RecommendationSeverity) {
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

function sortRecommendations(recommendations: ToolRecommendation[]) {
  return [...recommendations].sort((left, right) => {
    const severityDiff = severityWeight(right.severity) - severityWeight(left.severity);
    if (severityDiff !== 0) {
      return severityDiff;
    }

    const savingsDiff = right.monthlySavings - left.monthlySavings;
    if (savingsDiff !== 0) {
      return savingsDiff;
    }

    return left.toolName.localeCompare(right.toolName);
  });
}

function determineSavingsLevel(totalMonthlySavings: number) {
  if (totalMonthlySavings < LOW_SAVINGS_THRESHOLD) {
    return "low" as const;
  }

  if (totalMonthlySavings < HIGH_SAVINGS_THRESHOLD) {
    return "medium" as const;
  }

  return "high" as const;
}

function determineCredexFit(input: SanitizedAuditInput, totalMonthlySavings: number, totalMonthlySpend: number) {
  const hasHighApiSpend = input.tools.some(
    (tool) => tool.type === "api" && tool.monthlySpend >= HIGH_API_SPEND_THRESHOLD
  );

  return (
    totalMonthlySavings >= CREDex_SAVINGS_THRESHOLD ||
    hasHighApiSpend ||
    totalMonthlySpend >= CREDex_TOTAL_SPEND_THRESHOLD
  );
}

function buildHeadline(totalMonthlySavings: number) {
  if (totalMonthlySavings < LOW_SAVINGS_THRESHOLD) {
    return "Your AI spend looks mostly efficient";
  }

  if (totalMonthlySavings < HIGH_SAVINGS_THRESHOLD) {
    return `You may be able to reduce AI spend by $${totalMonthlySavings}/month`;
  }

  return `You could save $${totalMonthlySavings}/month across your AI stack`;
}

function buildNextBestAction(savingsLevel: "low" | "medium" | "high", credexFit: boolean) {
  if (savingsLevel === "low") {
    return "Keep monitoring AI usage and get notified when new optimizations apply.";
  }

  if (savingsLevel === "high" || credexFit) {
    return "Explore discounted AI infrastructure credits and review high-spend tools first.";
  }

  return "Review the highlighted plans and API usage patterns before your next billing cycle.";
}

export function calculateAudit(input: AuditInput): AuditResult {
  const sanitizedInput = sanitizeInput(input);
  const totalMonthlySpend = roundDollars(
    sanitizedInput.tools.reduce((sum, tool) => sum + tool.monthlySpend, 0)
  );

  const recommendations = dedupeRecommendations(
    sortRecommendations([
      ...sanitizedInput.tools.flatMap((tool) => applyToolRules(tool, sanitizedInput)),
      ...applyCrossToolRules(sanitizedInput),
    ])
  );

  const totalMonthlySavings = roundDollars(
    recommendations.reduce((sum, recommendation) => sum + recommendation.monthlySavings, 0)
  );
  const totalAnnualSavings = totalMonthlySavings * 12;
  const savingsRatePercent =
    totalMonthlySpend > 0
      ? Math.round((totalMonthlySavings / totalMonthlySpend) * 100)
      : 0;
  const savingsLevel = determineSavingsLevel(totalMonthlySavings);
  const credexFit = determineCredexFit(
    sanitizedInput,
    totalMonthlySavings,
    totalMonthlySpend
  );

  return {
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsRatePercent,
    savingsLevel,
    credexFit,
    headline: buildHeadline(totalMonthlySavings),
    recommendations,
    nextBestAction: buildNextBestAction(savingsLevel, credexFit),
  };
}
