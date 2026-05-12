import test from "node:test";
import assert from "node:assert/strict";

import { calculateAudit } from '@/lib/audit-engine/calculateAudit';
import type { AuditInput } from "@/lib/audit-engine/types";

test("high API spend triggers Credex fit", () => {
  const input: AuditInput = {
    teamSize: 6,
    primaryUseCase: "coding",
    tools: [
      {
        id: "tool-1",
        type: "api",
        toolName: "OpenAI API",
        monthlySpend: 650,
        apiUsage: "product_features",
        mainModel: "GPT-4o / GPT-5 class",
      },
    ],
  };

  const result = calculateAudit(input);

  assert.equal(result.totalMonthlySpend, 650);
  assert.equal(result.credexFit, true);
  assert.ok(result.totalMonthlySavings > 0);
  assert.ok(result.recommendations.length > 0);
});

test("low spend does not manufacture large savings", () => {
  const input: AuditInput = {
    teamSize: 3,
    primaryUseCase: "mixed",
    tools: [
      {
        id: "tool-1",
        type: "subscription",
        toolName: "ChatGPT",
        plan: "Plus",
        seats: 1,
        monthlySpend: 20,
      },
      {
        id: "tool-2",
        type: "api",
        toolName: "OpenAI API",
        monthlySpend: 20,
        apiUsage: "experiments",
        mainModel: "Not sure",
      },
    ],
  };

  const result = calculateAudit(input);

  assert.equal(result.savingsLevel, "low");
  assert.equal(result.credexFit, false);
  assert.ok(result.totalMonthlySavings < 100);
});

test("extra paid seats generate a savings recommendation", () => {
  const input: AuditInput = {
    teamSize: 4,
    primaryUseCase: "coding",
    tools: [
      {
        id: "tool-1",
        type: "subscription",
        toolName: "Cursor",
        plan: "Teams",
        seats: 6,
        monthlySpend: 240,
      },
    ],
  };

  const result = calculateAudit(input);

  assert.ok(result.totalMonthlySavings > 0);
  assert.ok(
    result.recommendations.some((rec) =>
      rec.reason.toLowerCase().includes("seat")
    )
  );
});

test("overlapping coding tools create a review recommendation", () => {
  const input: AuditInput = {
    teamSize: 4,
    primaryUseCase: "coding",
    tools: [
      {
        id: "tool-1",
        type: "subscription",
        toolName: "Cursor",
        plan: "Teams",
        seats: 4,
        monthlySpend: 160,
      },
      {
        id: "tool-2",
        type: "subscription",
        toolName: "GitHub Copilot",
        plan: "Business",
        seats: 4,
        monthlySpend: 76,
      },
    ],
  };

  const result = calculateAudit(input);

  assert.ok(
    result.recommendations.some(
      (rec) =>
        rec.reason.toLowerCase().includes("overlap") ||
        rec.recommendedAction.toLowerCase().includes("review")
    )
  );
});

test("annual savings are calculated from monthly savings", () => {
  const input: AuditInput = {
    teamSize: 6,
    primaryUseCase: "coding",
    tools: [
      {
        id: "tool-1",
        type: "api",
        toolName: "OpenAI API",
        monthlySpend: 500,
        apiUsage: "product_features",
        mainModel: "GPT-4o / GPT-5 class",
      },
    ],
  };

  const result = calculateAudit(input);

  assert.equal(result.totalAnnualSavings, result.totalMonthlySavings * 12);
});