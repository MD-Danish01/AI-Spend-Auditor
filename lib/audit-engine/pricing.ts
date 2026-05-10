import type {
  ApiProvider,
  PricingPlan,
  SubscriptionToolName,
  ToolPricing,
} from "@/lib/audit-engine/types";

export const SUBSCRIPTION_TOOL_PRICING: Record<SubscriptionToolName, ToolPricing> = {
  Cursor: {
    name: "Cursor",
    sourceUrl: "https://cursor.com/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      { plan: "Hobby", monthlyUsd: 0, pricingModel: "flat" },
      { plan: "Pro", monthlyUsd: 20, pricingModel: "flat" },
      { plan: "Pro+", monthlyUsd: 60, pricingModel: "flat" },
      { plan: "Ultra", monthlyUsd: 200, pricingModel: "flat" },
      { plan: "Teams", monthlyUsd: 40, pricingModel: "per_user" },
      {
        plan: "Enterprise",
        monthlyUsd: null,
        pricingModel: "custom",
        notes: "Custom contract pricing.",
      },
    ],
  },
  "GitHub Copilot": {
    name: "GitHub Copilot",
    sourceUrl: "https://github.com/features/copilot/plans",
    verifiedAt: "2026-05-10",
    plans: [
      { plan: "Free", monthlyUsd: 0, pricingModel: "flat" },
      { plan: "Pro", monthlyUsd: 10, pricingModel: "flat" },
      { plan: "Pro+", monthlyUsd: 39, pricingModel: "flat" },
      { plan: "Business", monthlyUsd: 19, pricingModel: "per_user" },
      { plan: "Enterprise", monthlyUsd: 39, pricingModel: "per_user" },
    ],
  },
  Claude: {
    name: "Claude",
    sourceUrl: "https://claude.com/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      { plan: "Free", monthlyUsd: 0, pricingModel: "flat" },
      { plan: "Pro Monthly", monthlyUsd: 20, pricingModel: "flat" },
      { plan: "Pro Annual", monthlyUsd: 17, pricingModel: "flat" },
      { plan: "Max", monthlyUsd: 100, pricingModel: "flat" },
      { plan: "Team Standard", monthlyUsd: 25, pricingModel: "per_user" },
      { plan: "Team Premium", monthlyUsd: 125, pricingModel: "per_user" },
      {
        plan: "Enterprise",
        monthlyUsd: null,
        pricingModel: "custom",
        notes: "Custom contract pricing.",
      },
    ],
  },
  ChatGPT: {
    name: "ChatGPT",
    sourceUrl: "https://chatgpt.com/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      { plan: "Free", monthlyUsd: 0, pricingModel: "flat" },
      { plan: "Plus", monthlyUsd: 20, pricingModel: "flat" },
      { plan: "Pro 5x", monthlyUsd: 100, pricingModel: "flat" },
      { plan: "Pro 20x", monthlyUsd: 200, pricingModel: "flat" },
      { plan: "Business", monthlyUsd: 25, pricingModel: "per_user" },
      {
        plan: "Enterprise",
        monthlyUsd: null,
        pricingModel: "custom",
        notes: "Custom contract pricing.",
      },
    ],
  },
  Gemini: {
    name: "Gemini",
    sourceUrl: "https://one.google.com/about/plans",
    verifiedAt: "2026-05-10",
    plans: [
      { plan: "Pro", monthlyUsd: 20, pricingModel: "flat" },
      { plan: "Ultra", monthlyUsd: 250, pricingModel: "flat" },
    ],
  },
  v0: {
    name: "v0",
    sourceUrl: "https://v0.dev/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      { plan: "Free", monthlyUsd: 0, pricingModel: "flat" },
      { plan: "Team", monthlyUsd: 30, pricingModel: "per_user" },
      { plan: "Business", monthlyUsd: 100, pricingModel: "per_user" },
      {
        plan: "Enterprise",
        monthlyUsd: null,
        pricingModel: "custom",
        notes: "Custom contract pricing.",
      },
    ],
  },
};

export const API_TOOL_PRICING: Record<ApiProvider, ToolPricing> = {
  "OpenAI API": {
    name: "OpenAI API",
    sourceUrl: "https://openai.com/api/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      {
        plan: "Usage based",
        monthlyUsd: null,
        pricingModel: "usage_based",
        notes: "Use user-provided monthly spend.",
      },
    ],
  },
  "Anthropic API": {
    name: "Anthropic API",
    sourceUrl: "https://claude.com/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      {
        plan: "Usage based",
        monthlyUsd: null,
        pricingModel: "usage_based",
        notes: "Use user-provided monthly spend.",
      },
    ],
  },
  "Gemini API": {
    name: "Gemini API",
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      {
        plan: "Usage based",
        monthlyUsd: null,
        pricingModel: "usage_based",
        notes: "Use user-provided monthly spend.",
      },
    ],
  },
};

export const ALL_TOOL_PRICING = {
  ...SUBSCRIPTION_TOOL_PRICING,
  ...API_TOOL_PRICING,
};

export function getPricingPlan(
  toolName: SubscriptionToolName | ApiProvider,
  planName?: string
): PricingPlan | undefined {
  const tool = ALL_TOOL_PRICING[toolName];
  if (!tool) {
    return undefined;
  }

  if (!planName) {
    return tool.plans[0];
  }

  return tool.plans.find((plan) => plan.plan === planName);
}
