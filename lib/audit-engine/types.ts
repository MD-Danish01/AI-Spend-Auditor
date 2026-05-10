export type PrimaryUseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolType = "subscription" | "api";

export type SubscriptionToolName =
  | "Cursor"
  | "GitHub Copilot"
  | "Claude"
  | "ChatGPT"
  | "Gemini"
  | "v0";

export type ApiProvider = "OpenAI API" | "Anthropic API" | "Gemini API";

export type ApiUsage =
  | "product_features"
  | "internal_tools"
  | "experiments"
  | "customer_support"
  | "mixed";

export type ToolSpendInput = {
  id: string;
  type: ToolType;
  toolName: SubscriptionToolName | ApiProvider;
  plan?: string;
  seats?: number;
  monthlySpend: number;
  apiUsage?: ApiUsage;
  mainModel?: string;
};

export type AuditInput = {
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  estimatedTotalMonthlySpend?: number;
  tools: ToolSpendInput[];
};

export type SavingsLevel = "low" | "medium" | "high";

export type RecommendationSeverity = "info" | "medium" | "high";

export type ToolRecommendation = {
  toolId: string;
  toolName: string;
  type: ToolType;
  currentSpend: number;
  recommendedAction: string;
  monthlySavings: number;
  annualSavings: number;
  severity: RecommendationSeverity;
  reason: string;
};

export type AuditResult = {
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsRatePercent: number;
  savingsLevel: SavingsLevel;
  credexFit: boolean;
  headline: string;
  recommendations: ToolRecommendation[];
  nextBestAction: string;
};

export type PricingModel = "flat" | "per_user" | "usage_based" | "custom";

export type PricingPlan = {
  plan: string;
  monthlyUsd: number | null;
  pricingModel: PricingModel;
  notes?: string;
};

export type ToolPricing = {
  name: SubscriptionToolName | ApiProvider;
  sourceUrl: string;
  verifiedAt: string;
  plans: PricingPlan[];
};

export type SanitizedToolSpendInput = {
  id: string;
  type: ToolType;
  toolName: SubscriptionToolName | ApiProvider;
  plan?: string;
  seats: number;
  monthlySpend: number;
  apiUsage?: ApiUsage;
  mainModel?: string;
};

export type SanitizedAuditInput = {
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  estimatedTotalMonthlySpend?: number;
  tools: SanitizedToolSpendInput[];
};
