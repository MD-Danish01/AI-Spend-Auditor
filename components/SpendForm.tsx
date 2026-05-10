"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type PrimaryUseCase = "coding" | "writing" | "data" | "research" | "mixed";
type ToolType = "subscription" | "api";

type SubscriptionToolName =
  | "Cursor"
  | "GitHub Copilot"
  | "Claude"
  | "ChatGPT"
  | "Gemini"
  | "v0";

type ApiProvider = "OpenAI API" | "Anthropic API" | "Gemini API";

type ApiUsage =
  | "product_features"
  | "internal_tools"
  | "experiments"
  | "customer_support"
  | "mixed";

type ToolSpendInput = {
  id: string;
  type: ToolType;
  toolName: string;
  plan?: string;
  seats?: number;
  monthlySpend: number;
  apiUsage?: ApiUsage;
  mainModel?: string;
};

type AuditFormState = {
  teamSize: number;
  primaryUseCase: PrimaryUseCase | "";
  estimatedTotalMonthlySpend?: number;
  tools: ToolSpendInput[];
};

type Step = 1 | 2 | 3;

const STORAGE_KEY = "ai-spend-auditor-form";

const useCaseOptions: Array<{ value: PrimaryUseCase; label: string }> = [
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "data", label: "Data analysis" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed usage" },
];

const subscriptionTools: SubscriptionToolName[] = [
  "Cursor",
  "GitHub Copilot",
  "Claude",
  "ChatGPT",
  "Gemini",
  "v0",
];

const apiProviders: ApiProvider[] = [
  "OpenAI API",
  "Anthropic API",
  "Gemini API",
];

const plansByTool: Record<SubscriptionToolName, string[]> = {
  Cursor: ["Hobby", "Pro", "Pro+", "Ultra", "Teams", "Enterprise"],
  "GitHub Copilot": ["Free", "Pro", "Pro+", "Business", "Enterprise"],
  Claude: [
    "Free",
    "Pro Monthly",
    "Pro Annual",
    "Max",
    "Team Standard",
    "Team Premium",
    "Enterprise",
  ],
  ChatGPT: ["Free", "Plus", "Pro 5x", "Pro 20x", "Business", "Enterprise"],
  Gemini: ["Pro", "Ultra"],
  v0: ["Free", "Team", "Business", "Enterprise"],
};

const apiUsageOptions: Array<{ value: ApiUsage; label: string }> = [
  { value: "product_features", label: "Product features" },
  { value: "internal_tools", label: "Internal tools" },
  { value: "experiments", label: "Experiments" },
  { value: "customer_support", label: "Customer support" },
  { value: "mixed", label: "Mixed usage" },
];

const modelOptions = [
  "Not sure",
  "GPT-4o / GPT-5 class",
  "Claude Sonnet / Opus class",
  "Gemini Pro / Ultra class",
  "Embeddings",
  "Other",
];

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tool-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createDefaultTool(id = createId()): ToolSpendInput {
  return {
    id,
    type: "subscription",
    toolName: "",
    plan: "",
    seats: 1,
    monthlySpend: 0,
  };
}

function getInitialFormState(): AuditFormState {
  return {
    teamSize: 0,
    primaryUseCase: "",
    estimatedTotalMonthlySpend: undefined,
    tools: [createDefaultTool("tool-1")],
  };
}

function parseStoredFormState(raw: string | null): AuditFormState {
  const fallback = getInitialFormState();

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuditFormState>;
    const parsedTools: ToolSpendInput[] = Array.isArray(parsed.tools)
      ? parsed.tools.map(
          (tool): ToolSpendInput => ({
            id: typeof tool.id === "string" ? tool.id : createId(),
            type: tool.type === "api" ? "api" : "subscription",
            toolName: typeof tool.toolName === "string" ? tool.toolName : "",
            plan: typeof tool.plan === "string" ? tool.plan : "",
            seats:
              typeof tool.seats === "number" && Number.isFinite(tool.seats)
                ? tool.seats
                : 1,
            monthlySpend:
              typeof tool.monthlySpend === "number" &&
              Number.isFinite(tool.monthlySpend)
                ? tool.monthlySpend
                : 0,
            apiUsage:
              tool.apiUsage === "product_features" ||
              tool.apiUsage === "internal_tools" ||
              tool.apiUsage === "experiments" ||
              tool.apiUsage === "customer_support" ||
              tool.apiUsage === "mixed"
                ? tool.apiUsage
                : undefined,
            mainModel: typeof tool.mainModel === "string" ? tool.mainModel : "",
          }),
        )
      : [];

    return {
      teamSize:
        typeof parsed.teamSize === "number" && Number.isFinite(parsed.teamSize)
          ? parsed.teamSize
          : 0,
      primaryUseCase:
        parsed.primaryUseCase === "coding" ||
        parsed.primaryUseCase === "writing" ||
        parsed.primaryUseCase === "data" ||
        parsed.primaryUseCase === "research" ||
        parsed.primaryUseCase === "mixed"
          ? parsed.primaryUseCase
          : "",
      estimatedTotalMonthlySpend:
        typeof parsed.estimatedTotalMonthlySpend === "number" &&
        Number.isFinite(parsed.estimatedTotalMonthlySpend)
          ? parsed.estimatedTotalMonthlySpend
          : undefined,
      tools: parsedTools.length > 0 ? parsedTools : [createDefaultTool()],
    };
  } catch {
    return fallback;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

const useCaseLabels: Record<PrimaryUseCase, string> = {
  coding: "Coding",
  writing: "Writing",
  data: "Data analysis",
  research: "Research",
  mixed: "Mixed usage",
};

const apiUsageLabels: Record<ApiUsage, string> = {
  product_features: "Product features",
  internal_tools: "Internal tools",
  experiments: "Experiments",
  customer_support: "Customer support",
  mixed: "Mixed usage",
};

export default function SpendForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [showValidation, setShowValidation] = useState(false);
  const [formState, setFormState] =
    useState<AuditFormState>(getInitialFormState);
  const hasHydratedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFormState(parseStoredFormState(localStorage.getItem(STORAGE_KEY)));
      hasHydratedRef.current = true;
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
  }, [formState]);

  const toolsMonthlySpend = useMemo(
    () =>
      formState.tools.reduce((sum, tool) => {
        const value = Number(tool.monthlySpend);
        return sum + (Number.isFinite(value) ? Math.max(0, value) : 0);
      }, 0),
    [formState.tools],
  );

  const totalMonthlySpend =
    toolsMonthlySpend > 0
      ? toolsMonthlySpend
      : Math.max(0, Number(formState.estimatedTotalMonthlySpend ?? 0));

  const totalAnnualSpend = totalMonthlySpend * 12;

  const step1Valid =
    Number.isFinite(formState.teamSize) &&
    formState.teamSize >= 1 &&
    formState.primaryUseCase !== "";

  const toolErrors = formState.tools.map((tool) => {
    const errors: string[] = [];

    if (!tool.toolName) {
      errors.push("Tool/provider is required.");
    }

    if (tool.monthlySpend < 0 || Number.isNaN(tool.monthlySpend)) {
      errors.push("Monthly spend must be 0 or higher.");
    }

    if (tool.type === "subscription") {
      if (!tool.plan) {
        errors.push("Plan is required for subscription tools.");
      }
      if (!tool.seats || tool.seats < 1) {
        errors.push("Seats must be at least 1.");
      }
    }

    if (tool.type === "api" && !tool.apiUsage) {
      errors.push("Primary API usage is required for API tools.");
    }

    return errors;
  });

  const step2Valid =
    formState.tools.length > 0 &&
    toolErrors.every((errors) => errors.length === 0);

  function goNext() {
    if (step === 1) {
      if (!step1Valid) {
        setShowValidation(true);
        return;
      }
      setShowValidation(false);
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!step2Valid) {
        setShowValidation(true);
        return;
      }
      setShowValidation(false);
      setStep(3);
    }
  }

  function goBack() {
    setShowValidation(false);
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  }

  function updateState<K extends keyof AuditFormState>(
    key: K,
    value: AuditFormState[K],
  ) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  function updateTool(toolId: string, patch: Partial<ToolSpendInput>) {
    setFormState((prev) => ({
      ...prev,
      tools: prev.tools.map((tool) =>
        tool.id === toolId ? { ...tool, ...patch } : tool,
      ),
    }));
  }

  function changeToolType(toolId: string, type: ToolType) {
    setFormState((prev) => ({
      ...prev,
      tools: prev.tools.map((tool) => {
        if (tool.id !== toolId) {
          return tool;
        }

        if (type === "subscription") {
          return {
            ...tool,
            type,
            toolName: subscriptionTools.includes(
              tool.toolName as SubscriptionToolName,
            )
              ? tool.toolName
              : "",
            plan: "",
            seats: tool.seats && tool.seats >= 1 ? tool.seats : 1,
            apiUsage: undefined,
            mainModel: "",
          };
        }

        return {
          ...tool,
          type,
          toolName: apiProviders.includes(tool.toolName as ApiProvider)
            ? tool.toolName
            : "",
          plan: undefined,
          seats: undefined,
          apiUsage: undefined,
          mainModel: "",
        };
      }),
    }));
  }

  function addTool() {
    setFormState((prev) => ({
      ...prev,
      tools: [...prev.tools, createDefaultTool()],
    }));
  }

  function removeTool(toolId: string) {
    setFormState((prev) => ({
      ...prev,
      tools:
        prev.tools.length > 1
          ? prev.tools.filter((tool) => tool.id !== toolId)
          : prev.tools,
    }));
  }

  function clearSavedForm() {
    localStorage.removeItem(STORAGE_KEY);
    setFormState({
      teamSize: 0,
      primaryUseCase: "",
      estimatedTotalMonthlySpend: undefined,
      tools: [createDefaultTool()],
    });
    setStep(1);
    setShowValidation(false);
  }

  const teamSizeError =
    showValidation &&
    (!Number.isFinite(formState.teamSize) || formState.teamSize < 1)
      ? "Team size is required and must be at least 1."
      : "";

  const useCaseError =
    showValidation && !formState.primaryUseCase
      ? "Please select a primary use case."
      : "";

  const stepConfig = [
    { number: 1 as Step, label: "Team context" },
    { number: 2 as Step, label: "AI tools" },
    { number: 3 as Step, label: "Review" },
  ];

  async function handleGenerateAudit() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));

      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch("/api/audits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate audit");
      }

      router.push(data.redirectUrl);

    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate audit.";

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <ol
            className="flex flex-wrap items-center gap-3"
            aria-label="Form steps"
          >
            {stepConfig.map((item) => {
              const isActive = step === item.number;
              const isCompleted = step > item.number;

              return (
                <li key={item.number} className="flex items-center gap-3">
                  <div
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
                      isCompleted
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : isActive
                          ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                          : "border-slate-300 bg-white text-slate-500",
                    ].join(" ")}
                  >
                    {item.number}
                  </div>
                  <span
                    className={[
                      "text-sm font-medium",
                      isCompleted || isActive
                        ? "text-slate-900"
                        : "text-slate-500",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={clearSavedForm}
            className="text-sm text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700"
          >
            Clear saved form
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Team context
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Tell us about your team and usage context.
              </p>
            </div>

            <div>
              <label
                htmlFor="team-size"
                className="block text-sm font-medium text-slate-900"
              >
                Team size
              </label>
              <input
                id="team-size"
                type="number"
                min={1}
                value={formState.teamSize || ""}
                onChange={(e) =>
                  updateState(
                    "teamSize",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-400 focus:ring-2"
                placeholder="e.g. 14"
              />
              <p className="mt-1 text-xs text-slate-500">
                How many people actively use AI tools?
              </p>
              {teamSizeError && (
                <p className="mt-2 text-sm text-rose-600">{teamSizeError}</p>
              )}
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-slate-900">
                Primary use case
              </legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {useCaseOptions.map((option) => {
                  const selected = formState.primaryUseCase === option.value;

                  return (
                    <label
                      key={option.value}
                      className={[
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition",
                        selected
                          ? "border-cyan-300 bg-cyan-50"
                          : "border-slate-300 bg-white hover:border-slate-400",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="primary-use-case"
                        value={option.value}
                        checked={selected}
                        onChange={() =>
                          updateState("primaryUseCase", option.value)
                        }
                        className="mt-0.5 h-4 w-4 border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              {useCaseError && (
                <p className="mt-2 text-sm text-rose-600">{useCaseError}</p>
              )}
            </fieldset>

            <div>
              <label
                htmlFor="estimated-total-spend"
                className="block text-sm font-medium text-slate-900"
              >
                Optional: Current total monthly AI spend
              </label>
              <input
                id="estimated-total-spend"
                type="number"
                min={0}
                value={formState.estimatedTotalMonthlySpend ?? ""}
                onChange={(e) =>
                  updateState(
                    "estimatedTotalMonthlySpend",
                    e.target.value === ""
                      ? undefined
                      : Math.max(0, Number(e.target.value)),
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-400 focus:ring-2"
                placeholder="e.g. 1800"
              />
              <p className="mt-1 text-xs text-slate-500">
                Optional. We&apos;ll also calculate this from the tools you add.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={goNext}
                disabled={!step1Valid}
                className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">AI tools</h2>
              <p className="mt-1 text-sm text-slate-600">
                Add subscriptions and API providers used by your team.
              </p>
            </div>

            <div className="space-y-4">
              {formState.tools.map((tool, index) => {
                const availablePlans =
                  tool.type === "subscription" &&
                  tool.toolName &&
                  plansByTool[tool.toolName as SubscriptionToolName]
                    ? plansByTool[tool.toolName as SubscriptionToolName]
                    : [];

                return (
                  <article
                    key={tool.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Tool {index + 1}
                      </h3>
                      {formState.tools.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTool(tool.id)}
                          className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`type-${tool.id}`}
                          className="block text-sm font-medium text-slate-900"
                        >
                          Tool category/type
                        </label>
                        <select
                          id={`type-${tool.id}`}
                          value={tool.type}
                          onChange={(e) =>
                            changeToolType(tool.id, e.target.value as ToolType)
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-400 focus:ring-2"
                        >
                          <option value="subscription">Subscription</option>
                          <option value="api">API</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`name-${tool.id}`}
                          className="block text-sm font-medium text-slate-900"
                        >
                          {tool.type === "subscription"
                            ? "Tool name"
                            : "Provider name"}
                        </label>
                        <select
                          id={`name-${tool.id}`}
                          value={tool.toolName}
                          onChange={(e) => {
                            const value = e.target.value;

                            if (tool.type === "subscription") {
                              updateTool(tool.id, {
                                toolName: value,
                                plan: "",
                                seats:
                                  tool.seats && tool.seats >= 1
                                    ? tool.seats
                                    : 1,
                              });
                              return;
                            }

                            updateTool(tool.id, { toolName: value });
                          }}
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-400 focus:ring-2"
                        >
                          <option value="">Select</option>
                          {(tool.type === "subscription"
                            ? subscriptionTools
                            : apiProviders
                          ).map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {tool.type === "subscription" && (
                        <>
                          <div>
                            <label
                              htmlFor={`plan-${tool.id}`}
                              className="block text-sm font-medium text-slate-900"
                            >
                              Plan
                            </label>
                            <select
                              id={`plan-${tool.id}`}
                              value={tool.plan ?? ""}
                              onChange={(e) =>
                                updateTool(tool.id, { plan: e.target.value })
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-400 focus:ring-2"
                              disabled={!tool.toolName}
                            >
                              <option value="">Select plan</option>
                              {availablePlans.map((plan) => (
                                <option key={plan} value={plan}>
                                  {plan}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor={`seats-${tool.id}`}
                              className="block text-sm font-medium text-slate-900"
                            >
                              Seats
                            </label>
                            <input
                              id={`seats-${tool.id}`}
                              type="number"
                              min={1}
                              value={tool.seats ?? ""}
                              onChange={(e) =>
                                updateTool(tool.id, {
                                  seats:
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                })
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-400 focus:ring-2"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                              How many paid seats are active?
                            </p>
                          </div>
                        </>
                      )}

                      <div>
                        <label
                          htmlFor={`monthly-${tool.id}`}
                          className="block text-sm font-medium text-slate-900"
                        >
                          {tool.type === "subscription"
                            ? "Monthly spend"
                            : "Monthly API spend"}
                        </label>
                        <input
                          id={`monthly-${tool.id}`}
                          type="number"
                          min={0}
                          value={
                            Number.isFinite(tool.monthlySpend)
                              ? tool.monthlySpend
                              : ""
                          }
                          onChange={(e) =>
                            updateTool(tool.id, {
                              monthlySpend:
                                e.target.value === ""
                                  ? 0
                                  : Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-400 focus:ring-2"
                        />
                        {tool.type === "api" && (
                          <p className="mt-1 text-xs text-slate-500">
                            Use your latest invoice or billing dashboard amount.
                          </p>
                        )}
                      </div>

                      {tool.type === "api" && (
                        <>
                          <div>
                            <label
                              htmlFor={`usage-${tool.id}`}
                              className="block text-sm font-medium text-slate-900"
                            >
                              Primary API usage
                            </label>
                            <select
                              id={`usage-${tool.id}`}
                              value={tool.apiUsage ?? ""}
                              onChange={(e) =>
                                updateTool(tool.id, {
                                  apiUsage: e.target.value as ApiUsage,
                                })
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-400 focus:ring-2"
                            >
                              <option value="">Select usage</option>
                              {apiUsageOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor={`model-${tool.id}`}
                              className="block text-sm font-medium text-slate-900"
                            >
                              Main model (optional)
                            </label>
                            <select
                              id={`model-${tool.id}`}
                              value={tool.mainModel ?? ""}
                              onChange={(e) =>
                                updateTool(tool.id, {
                                  mainModel: e.target.value,
                                })
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-400 focus:ring-2"
                            >
                              <option value="">Select model</option>
                              {modelOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    {showValidation && toolErrors[index].length > 0 && (
                      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-rose-600">
                        {toolErrors[index].map((error) => (
                          <li key={error}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addTool}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            >
              + Add another tool
            </button>

            <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              >
                Back
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={!step2Valid}
                className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Review</h2>
              <p className="mt-1 text-sm text-slate-600">
                Confirm your inputs before generating the audit.
              </p>
            </div>

            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Team size
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formState.teamSize}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Primary use case
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formState.primaryUseCase
                    ? useCaseLabels[formState.primaryUseCase]
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Total monthly spend
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatCurrency(totalMonthlySpend)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Total annual spend
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatCurrency(totalAnnualSpend)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Tools added
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formState.tools.length}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {formState.tools.map((tool, index) => (
                <article
                  key={tool.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {index + 1}. {tool.toolName || "Unnamed tool"}
                  </p>

                  {tool.type === "subscription" ? (
                    <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                      <p>
                        <span className="font-medium text-slate-900">
                          Plan:
                        </span>{" "}
                        {tool.plan || "Not set"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">
                          Seats:
                        </span>{" "}
                        {tool.seats ?? "Not set"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">
                          Monthly spend:
                        </span>{" "}
                        {formatCurrency(tool.monthlySpend)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                      <p>
                        <span className="font-medium text-slate-900">
                          Primary API usage:
                        </span>{" "}
                        {tool.apiUsage
                          ? apiUsageLabels[tool.apiUsage]
                          : "Not set"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">
                          Main model:
                        </span>{" "}
                        {tool.mainModel || "Not set"}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-medium text-slate-900">
                          Monthly API spend:
                        </span>{" "}
                        {formatCurrency(tool.monthlySpend)}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              >
                Back
              </button>
              {submitError && (
                <p className="mt-3 text-sm text-red-600">{submitError}</p>
              )}
              <button
                type="button"
                onClick={handleGenerateAudit}
                disabled={isSubmitting}
                className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white  disabled:cursor-not-allowed disabled:opacity-60 transition hover:bg-cyan-700"
              >
                {isSubmitting ? "Generating audit..." : "Generate audit"}
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Live summary
        </h3>

        <dl className="mt-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Tools added
            </dt>
            <dd className="mt-1 text-xl font-semibold text-slate-900">
              {formState.tools.length}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Total monthly spend
            </dt>
            <dd className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrency(totalMonthlySpend)}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Estimated annual spend
            </dt>
            <dd className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrency(totalAnnualSpend)}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Team size
            </dt>
            <dd className="mt-1 text-xl font-semibold text-slate-900">
              {formState.teamSize > 0 ? formState.teamSize : "-"}
            </dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}
