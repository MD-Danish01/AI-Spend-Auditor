import type {
  RecommendationSeverity,
  SanitizedAuditInput,
  SanitizedToolSpendInput,
  ToolRecommendation,
} from "@/lib/audit-engine/types";

const SMALL_TEAM_LIMIT = 3;
const SMALL_TEAM_MIN_SPEND = 50;
const SMALL_TEAM_SAVINGS_RATE = 0.2;
const EXPENSIVE_PLAN_THRESHOLD = 200;
const EXPENSIVE_PLAN_SAVINGS_RATE = 0.15;
const OVERLAP_SAVINGS_RATE = 0.1;

const TEAM_STYLE_PLAN_KEYWORDS = ["team", "business", "enterprise"];
const CODING_TOOLS = new Set(["Cursor", "GitHub Copilot"]);
const GENERAL_ASSISTANT_TOOLS = new Set(["Claude", "ChatGPT"]);

function roundDollars(value: number) {
  return Math.max(0, Math.round(value));
}

function buildRecommendation(params: {
  toolId: string;
  toolName: string;
  type: "subscription" | "api";
  currentSpend: number;
  recommendedAction: string;
  monthlySavings: number;
  severity: RecommendationSeverity;
  reason: string;
}): ToolRecommendation {
  const monthlySavings = roundDollars(params.monthlySavings);

  return {
    toolId: params.toolId,
    toolName: params.toolName,
    type: params.type,
    currentSpend: roundDollars(params.currentSpend),
    recommendedAction: params.recommendedAction,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    severity: params.severity,
    reason: params.reason,
  };
}

function isTeamStylePlan(plan?: string) {
  if (!plan) {
    return false;
  }

  const normalized = plan.toLowerCase();
  return TEAM_STYLE_PLAN_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function isCodingTool(toolName: string) {
  return CODING_TOOLS.has(toolName);
}

function isGeneralAssistantTool(toolName: string) {
  return GENERAL_ASSISTANT_TOOLS.has(toolName);
}

export function applyOversizedSeatsRule(
  tool: SanitizedToolSpendInput,
  teamSize: number
): ToolRecommendation[] {
  if (tool.type !== "subscription" || tool.seats <= teamSize) {
    return [];
  }

  const extraSeats = tool.seats - teamSize;
  const averageSeatSpend = tool.seats > 0 ? tool.monthlySpend / tool.seats : 0;

  return [
    buildRecommendation({
      toolId: tool.id,
      toolName: tool.toolName,
      type: tool.type,
      currentSpend: tool.monthlySpend,
      recommendedAction: "Review seat allocation",
      monthlySavings: averageSeatSpend * extraSeats,
      severity: "high",
      reason: `Active seats exceed team size by ${extraSeats}. Reducing unused paid seats may lower spend without changing coverage for active users.`,
    }),
  ];
}

export function applySmallTeamExpensivePlanRule(
  tool: SanitizedToolSpendInput,
  teamSize: number
): ToolRecommendation[] {
  if (
    tool.type !== "subscription" ||
    teamSize > SMALL_TEAM_LIMIT ||
    tool.monthlySpend < SMALL_TEAM_MIN_SPEND ||
    !isTeamStylePlan(tool.plan)
  ) {
    return [];
  }

  return [
    buildRecommendation({
      toolId: tool.id,
      toolName: tool.toolName,
      type: tool.type,
      currentSpend: tool.monthlySpend,
      recommendedAction: "Review whether an individual plan is enough",
      monthlySavings: tool.monthlySpend * SMALL_TEAM_SAVINGS_RATE,
      severity: "medium",
      reason:
        "Small teams are often able to use individual or lighter plans instead of team or business tiers. Review whether the current plan still matches active usage.",
    }),
  ];
}

export function applyVeryExpensivePlanRule(tool: SanitizedToolSpendInput): ToolRecommendation[] {
  if (tool.type !== "subscription" || tool.monthlySpend <= EXPENSIVE_PLAN_THRESHOLD) {
    return [];
  }

  return [
    buildRecommendation({
      toolId: tool.id,
      toolName: tool.toolName,
      type: tool.type,
      currentSpend: tool.monthlySpend,
      recommendedAction: "Review plan fit and seat utilization",
      monthlySavings: tool.monthlySpend * EXPENSIVE_PLAN_SAVINGS_RATE,
      severity: "medium",
      reason:
        "This subscription is a meaningful monthly line item. Review whether the current plan and seat allocation still match real usage.",
    }),
  ];
}

export function applyApiSpendReviewRule(tool: SanitizedToolSpendInput): ToolRecommendation[] {
  if (tool.type !== "api") {
    return [];
  }

  if (tool.monthlySpend < 100) {
    return [
      buildRecommendation({
        toolId: tool.id,
        toolName: tool.toolName,
        type: tool.type,
        currentSpend: tool.monthlySpend,
        recommendedAction: "Keep monitoring API usage",
        monthlySavings: 0,
        severity: "info",
        reason:
          "API spend is currently low, so there is no major optimization priority right now.",
      }),
    ];
  }

  if (tool.monthlySpend < 300) {
    return [
      buildRecommendation({
        toolId: tool.id,
        toolName: tool.toolName,
        type: tool.type,
        currentSpend: tool.monthlySpend,
        recommendedAction: "Review model choice, prompt size, caching, and monitoring",
        monthlySavings: tool.monthlySpend * 0.1,
        severity: "medium",
        reason:
          "API usage is large enough to justify reviewing model selection and basic efficiency controls.",
      }),
    ];
  }

  if (tool.monthlySpend < 500) {
    return [
      buildRecommendation({
        toolId: tool.id,
        toolName: tool.toolName,
        type: tool.type,
        currentSpend: tool.monthlySpend,
        recommendedAction: "Add usage monitoring, cheaper model routing, caching, and budget alerts",
        monthlySavings: tool.monthlySpend * 0.15,
        severity: "medium",
        reason:
          "API usage is now material enough that routing and monitoring controls can produce meaningful savings.",
      }),
    ];
  }

  return [
    buildRecommendation({
      toolId: tool.id,
      toolName: tool.toolName,
      type: tool.type,
      currentSpend: tool.monthlySpend,
      recommendedAction: "Explore discounted AI credits and procurement optimization",
      monthlySavings: tool.monthlySpend * 0.2,
      severity: "high",
      reason:
        "High API spend detected. Procurement review, discounted credits, caching, and model routing may materially reduce infrastructure cost.",
    }),
  ];
}

export function applyUseCaseFitRule(input: SanitizedAuditInput): ToolRecommendation[] {
  const codingTools = input.tools.filter((tool) => isCodingTool(tool.toolName));

  if (input.primaryUseCase === "coding" && codingTools.length === 0) {
    return [
      buildRecommendation({
        toolId: "stack-coding-fit",
        toolName: "AI stack",
        type: "subscription",
        currentSpend: 0,
        recommendedAction: "Review whether a coding-focused assistant would improve developer workflows",
        monthlySavings: 0,
        severity: "info",
        reason:
          "Your primary use case is coding, but the current stack does not include a coding-focused assistant such as Cursor or GitHub Copilot.",
      }),
    ];
  }

  if (input.primaryUseCase !== "coding" && codingTools.length >= 2) {
    const cheaperCodingTool = [...codingTools].sort(
      (left, right) => left.monthlySpend - right.monthlySpend
    )[0];

    return [
      buildRecommendation({
        toolId: cheaperCodingTool.id,
        toolName: cheaperCodingTool.toolName,
        type: cheaperCodingTool.type,
        currentSpend: cheaperCodingTool.monthlySpend,
        recommendedAction: "Review whether all coding-focused tools are still necessary",
        monthlySavings: 0,
        severity: "info",
        reason:
          "Coding is not the primary use case, but multiple coding-focused tools are active. Review whether both are still justified.",
      }),
    ];
  }

  return [];
}

export function applyDuplicateOverlapRule(tools: SanitizedToolSpendInput[]): ToolRecommendation[] {
  const recommendations: ToolRecommendation[] = [];

  const cursor = tools.find((tool) => tool.toolName === "Cursor");
  const copilot = tools.find((tool) => tool.toolName === "GitHub Copilot");
  if (cursor && copilot) {
    const cheaperTool = cursor.monthlySpend <= copilot.monthlySpend ? cursor : copilot;
    recommendations.push(
      buildRecommendation({
        toolId: cheaperTool.id,
        toolName: cheaperTool.toolName,
        type: cheaperTool.type,
        currentSpend: cheaperTool.monthlySpend,
        recommendedAction: "Review overlap between coding assistants",
        monthlySavings: cheaperTool.monthlySpend * OVERLAP_SAVINGS_RATE,
        severity: "medium",
        reason:
          "Cursor and GitHub Copilot can both be valuable, but they may overlap for coding workflows. Review whether both are needed for the same users.",
      })
    );
  }

  const assistantTools = tools.filter((tool) => isGeneralAssistantTool(tool.toolName));
  if (assistantTools.length >= 2) {
    const cheaperTool = [...assistantTools].sort(
      (left, right) => left.monthlySpend - right.monthlySpend
    )[0];
    recommendations.push(
      buildRecommendation({
        toolId: cheaperTool.id,
        toolName: cheaperTool.toolName,
        type: cheaperTool.type,
        currentSpend: cheaperTool.monthlySpend,
        recommendedAction: "Review overlap between general assistant tools",
        monthlySavings: cheaperTool.monthlySpend * OVERLAP_SAVINGS_RATE,
        severity: "medium",
        reason:
          "Claude and ChatGPT may both be useful, but overlapping assistant usage should be reviewed before renewing both at full scope.",
      })
    );
  }

  return recommendations;
}

export function applyToolRules(
  tool: SanitizedToolSpendInput,
  input: SanitizedAuditInput
): ToolRecommendation[] {
  return [
    ...applyOversizedSeatsRule(tool, input.teamSize),
    ...applySmallTeamExpensivePlanRule(tool, input.teamSize),
    ...applyVeryExpensivePlanRule(tool),
    ...applyApiSpendReviewRule(tool),
  ];
}

export function applyCrossToolRules(input: SanitizedAuditInput): ToolRecommendation[] {
  return [...applyUseCaseFitRule(input), ...applyDuplicateOverlapRule(input.tools)];
}

export function hasCodingFocusedTool(
  tools: Array<Pick<SanitizedToolSpendInput, "toolName">>
): boolean {
  return tools.some((tool) => isCodingTool(tool.toolName));
}

export function countCodingTools(
  tools: Array<Pick<SanitizedToolSpendInput, "toolName">>
): number {
  return tools.filter((tool) => isCodingTool(tool.toolName)).length;
}

export function countGeneralAssistantTools(
  tools: Array<Pick<SanitizedToolSpendInput, "toolName">>
): number {
  return tools.filter((tool) => isGeneralAssistantTool(tool.toolName)).length;
}
