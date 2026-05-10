export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "openai-api"
  | "anthropic-api"
  | "gemini-api"
  | "v0";

export type PricingPlan = {
  plan: string;
  monthlyUsd: number | null;
  pricingModel: "per_user" | "flat" | "usage_based" | "custom";
  notes?: string;
};

export type ToolPricing = {
  id: ToolId;
  name: string;
  plans: PricingPlan[];
  sourceUrl: string;
  verifiedAt: string;
};

export const TOOL_PRICING: ToolPricing[] = [
  {
    id: "cursor",
    name: "Cursor",
    sourceUrl: "https://cursor.com/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      { plan: "Hobby", monthlyUsd: 0, pricingModel: "flat" },
      { plan: "Pro", monthlyUsd: 20, pricingModel: "flat" },
      { plan: "Pro+", monthlyUsd: 60, pricingModel: "flat" },
      { plan: "Ultra", monthlyUsd: 200, pricingModel: "flat" },
      {
        plan: "Teams",
        monthlyUsd: 40,
        pricingModel: "per_user",
        notes: "Use as Business/Teams equivalent in the assignment UI.",
      },
      {
        plan: "Enterprise",
        monthlyUsd: null,
        pricingModel: "custom",
      },
    ],
  },
  {
    id: "github-copilot",
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
  {
    id: "claude",
    name: "Claude",
    sourceUrl: "https://claude.com/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      { plan: "Free", monthlyUsd: 0, pricingModel: "flat" },
      { plan: "Pro", monthlyUsd: 20, pricingModel: "flat" },
      {
        plan: "Max",
        monthlyUsd: 100,
        pricingModel: "flat",
        notes: "Starts from $100/month.",
      },
      {
        plan: "Team Standard",
        monthlyUsd: 25,
        pricingModel: "per_user",
        notes: "Monthly billing. Annual is $20/user/month.",
      },
      {
        plan: "Team Premium",
        monthlyUsd: 125,
        pricingModel: "per_user",
        notes: "Monthly billing. Annual is $100/user/month.",
      },
      {
        plan: "Enterprise",
        monthlyUsd: null,
        pricingModel: "custom",
        notes: "Seat price plus API-rate usage may apply.",
      },
      {
        plan: "API direct",
        monthlyUsd: null,
        pricingModel: "usage_based",
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    sourceUrl: "https://chatgpt.com/pricing/",
    verifiedAt: "2026-05-10",
    plans: [
      { plan: "Free", monthlyUsd: 0, pricingModel: "flat" },
      { plan: "Plus", monthlyUsd: 20, pricingModel: "flat" },
      { plan: "Pro 5x", monthlyUsd: 100, pricingModel: "flat" },
      { plan: "Pro 20x", monthlyUsd: 200, pricingModel: "flat" },
      {
        plan: "Business",
        monthlyUsd: 25,
        pricingModel: "per_user",
        notes: "Monthly billing. Annual is $20/user/month. Minimum 2 users.",
      },
      { plan: "Enterprise", monthlyUsd: null, pricingModel: "custom" },
      { plan: "API direct", monthlyUsd: null, pricingModel: "usage_based" },
    ],
  },
  {
    id: "openai-api",
    name: "OpenAI API direct",
    sourceUrl: "https://openai.com/api/pricing/",
    verifiedAt: "2026-05-10",
    plans: [
      {
        plan: "API direct",
        monthlyUsd: null,
        pricingModel: "usage_based",
        notes:
          "Use user-provided monthly spend. Reference model: GPT-5.1 $1.25/1M input and $10/1M output tokens.",
      },
    ],
  },
  {
    id: "anthropic-api",
    name: "Anthropic API direct",
    sourceUrl: "https://claude.com/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      {
        plan: "API direct",
        monthlyUsd: null,
        pricingModel: "usage_based",
        notes:
          "Use user-provided monthly spend. Reference: Claude Haiku 4.5 $1/MTok input, $5/MTok output; Sonnet 4.5 $3/MTok input, $15/MTok output.",
      },
    ],
  },
  {
    id: "gemini-api",
    name: "Gemini API",
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      {
        plan: "API direct",
        monthlyUsd: null,
        pricingModel: "usage_based",
        notes:
          "Use user-provided monthly spend. Google Gemini API pricing varies by model and tier.",
      },
    ],
  },
  {
    id: "v0",
    name: "v0",
    sourceUrl: "https://v0.app/docs/pricing",
    verifiedAt: "2026-05-10",
    plans: [
      { plan: "Free", monthlyUsd: 0, pricingModel: "flat" },
      { plan: "Premium", monthlyUsd: 20, pricingModel: "flat" },
      { plan: "Team", monthlyUsd: 30, pricingModel: "per_user" },
      { plan: "Business", monthlyUsd: 100, pricingModel: "per_user" },
      { plan: "Enterprise", monthlyUsd: null, pricingModel: "custom" },
    ],
  },
];