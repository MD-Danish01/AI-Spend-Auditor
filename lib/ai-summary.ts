import Groq from "groq-sdk";
import type { AuditInput, AuditResult } from "@/lib/audit-engine/types";

export type SummaryResult = {
  summary: string;
  source: "llm" | "fallback";
};

const DEFAULT_MODEL = "llama-3.1-8b-instant";
const SYSTEM_PROMPT =
  "You are writing a concise user-facing AI spend audit summary for a founder, CTO, or engineering manager. The audit math has already been calculated by deterministic business rules. Your job is only to explain the result clearly in plain English. Write one paragraph only, between 80 and 120 words. Use a professional, calm, practical tone. Do not invent numbers, tools, discounts, company type, or recommendations. Do not guarantee savings. Do not mention internal fields, booleans, JSON, variable names, developer instructions, or implementation details. Never mention terms such as credexFit, primaryUseCase, savingsLevel, resultJson, monthlySavings, totalMonthlySavings, JSON, or boolean. Use phrases like 'this audit' or 'your AI stack', not 'our audit'. Mention discounted AI or cloud credits only when the provided context explicitly says it is appropriate.If total monthly savings are below $100, start the summary by saying the AI spend looks mostly efficient. Do not use strong phrases like “major savings,” “maximize savings,” or “significant opportunity.” Keep the tone honest and conservative.";

const FORBIDDEN_TERMS = [
  "credexfit",
  "resultjson",
  "monthlysavings",
  "totalmonthlysavings",
  "savingslevel",
  "primaryusecase",
  "json",
  "boolean",
  "internal variable",
  "if credexfit",
  "our ai spend audit",
];

function formatCurrency(value: number) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

function trimToWordLimit(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return text.trim();
  }

  return `${words.slice(0, maxWords).join(" ")}.`;
}

function getTeamContext(primaryUseCase: AuditInput["primaryUseCase"]) {
  switch (primaryUseCase) {
    case "coding":
      return "coding-focused team";
    case "writing":
      return "writing-focused team";
    case "data":
      return "data-focused team";
    case "research":
      return "research-focused team";
    case "mixed":
    default:
      return "mixed-use team";
  }
}

function hasForbiddenTerms(summary: string) {
  const normalized = summary.toLowerCase();

  return FORBIDDEN_TERMS.some((term) => normalized.includes(term));
}

export function createFallbackSummary(result: AuditResult): SummaryResult {
  if (result.credexFit) {
    return {
      summary: `Your AI stack shows a meaningful savings opportunity. The audit found potential savings of ${formatCurrency(result.totalMonthlySavings)}/month, or ${formatCurrency(result.totalAnnualSavings)}/year. The biggest opportunities are listed in the recommendations below. Review high-spend tools first and consider whether discounted AI or cloud credits could help reduce infrastructure costs.`,
      source: "fallback",
    };
  }

  return {
    summary: `Your AI spend looks mostly efficient, with estimated savings of ${formatCurrency(result.totalMonthlySavings)}/month. The recommendations below can still help you monitor usage, reduce waste, and keep your AI stack aligned with your team size and use case.`,
    source: "fallback",
  };
}

export async function generateAuditSummary(
  input: AuditInput,
  result: AuditResult
): Promise<SummaryResult> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.LLM_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return createFallbackSummary(result);
  }

  const groq = new Groq({ apiKey });
  const sortedRecommendations = [...result.recommendations]
    .sort((left, right) => right.monthlySavings - left.monthlySavings)
    .slice(0, 3);
  const payload = {
    teamSize: input.teamSize,
    teamContext: getTeamContext(input.primaryUseCase),
    totalMonthlySpend: result.totalMonthlySpend,
    totalMonthlySavings: result.totalMonthlySavings,
    totalAnnualSavings: result.totalAnnualSavings,
    savingsRatePercent: result.savingsRatePercent,
    savingsContext: result.credexFit
      ? "High-savings opportunity detected. It is appropriate to mention discounted AI/cloud credits."
      : "Low or moderate savings. Do not mention Credex or discounted credits.",
    nextBestAction: result.nextBestAction,
    topRecommendations: sortedRecommendations.map((recommendation) => ({
      toolName: recommendation.toolName,
      action: recommendation.recommendedAction,
      estimatedMonthlySavings: recommendation.monthlySavings,
      reason: recommendation.reason,
    })),
  };

  const userPrompt = [
    "Write one clean user-facing paragraph, 80-120 words.",
    "Be specific, practical, and concise.",
    "Mention total monthly savings, annual savings, the most important optimization area, and the next best action.",
    "Mention discounted AI or cloud credits only when the provided savings context says that is appropriate.",
    "Do not mention internal fields, booleans, JSON, developer instructions, or variable names.",
    "Do not say 'our AI spend audit'. Do not say 'B2B SaaS' unless the input explicitly says that.",
    "Use only the facts in this JSON:",
    JSON.stringify(payload),
  ].join("\n\n");

  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.3,
      max_tokens: 180,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      return createFallbackSummary(result);
    }

    if (hasForbiddenTerms(summary) || summary.includes("B2B SaaS")) {
      return createFallbackSummary(result);
    }

    return {
      summary: trimToWordLimit(summary, 140),
      source: "llm",
    };
  } catch (error) {
    console.error("Failed to generate AI summary:", error);
    return createFallbackSummary(result);
  }
}
