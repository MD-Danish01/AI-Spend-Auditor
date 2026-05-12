# PROMPTS.md

## 1. Purpose

The LLM is used only to rewrite already-calculated audit results into a short, user-facing summary. All pricing, savings, and recommendations are computed deterministically by the audit engine before any AI call is made.

## 2. Provider and model

Provider: Groq
Model: llama-3.3-70b-versatile

## 3. System prompt

```text
You are writing a concise user-facing AI spend audit summary for a founder, CTO, or engineering manager. The audit math has already been calculated by deterministic business rules. Your job is only to explain the result clearly in plain English. Write one paragraph only, between 80 and 120 words. Use a professional, practical tone. Do not invent numbers, tools, discounts, company type, or recommendations. Do not guarantee savings. Do not mention internal fields, JSON, variable names, or implementation details. Never mention terms such as credexFit, resultJson, savingsLevel, monthlySavings, totalMonthlySavings, primaryUseCase, or JSON. Use phrases like "this audit" or "your AI stack", not "our audit". Mention discounted AI or cloud credits only when the provided savings context explicitly says it is appropriate. If savings are low, be honest and say spend looks mostly efficient.
```

## 4. User prompt shape

The app sends sanitized data in this shape:

```json
{
  "teamSize": 0,
  "useCaseLabel": "",
  "totalMonthlySpend": 0,
  "totalMonthlySavings": 0,
  "totalAnnualSavings": 0,
  "savingsRatePercent": 0,
  "savingsContext": "",
  "nextBestAction": "",
  "topRecommendations": [
    {
      "toolName": "",
      "action": "",
      "estimatedMonthlySavings": 0,
      "reason": ""
    }
  ]
}
```

## 5. Example sanitized prompt payload

```json
{
  "teamSize": 8,
  "useCaseLabel": "product engineering",
  "totalMonthlySpend": 1240,
  "totalMonthlySavings": 210,
  "totalAnnualSavings": 2520,
  "savingsRatePercent": 17,
  "savingsContext": "High-savings opportunity detected. It is appropriate to mention discounted AI/cloud credits.",
  "nextBestAction": "Review high-spend API providers and compare plan tiers.",
  "topRecommendations": [
    {
      "toolName": "OpenAI API",
      "action": "Review plan and apply usage caps",
      "estimatedMonthlySavings": 140,
      "reason": "High API spend detected with potential tier optimization."
    }
  ]
}
```

## 6. Forbidden terms guard

The app checks LLM output for forbidden internal terms and falls back if any are detected.

## 7. Fallback behavior

The deterministic fallback summary is used when:

- API key is missing
- Groq request fails
- Output is empty
- Output contains forbidden internal terms

## 8. Prompt versioning

The prompt is versioned in code to make changes explicit and reviewable. When the prompt changes, the version is bumped and recorded with the audit result so summaries can be traced to the prompt used.

## 9. JSON schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AuditSummaryPrompt",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "teamSize",
    "useCaseLabel",
    "totalMonthlySpend",
    "totalMonthlySavings",
    "totalAnnualSavings",
    "savingsRatePercent",
    "savingsContext",
    "nextBestAction",
    "topRecommendations"
  ],
  "properties": {
    "teamSize": { "type": "number" },
    "useCaseLabel": { "type": "string" },
    "totalMonthlySpend": { "type": "number" },
    "totalMonthlySavings": { "type": "number" },
    "totalAnnualSavings": { "type": "number" },
    "savingsRatePercent": { "type": "number" },
    "savingsContext": { "type": "string" },
    "nextBestAction": { "type": "string" },
    "topRecommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "toolName",
          "action",
          "estimatedMonthlySavings",
          "reason"
        ],
        "properties": {
          "toolName": { "type": "string" },
          "action": { "type": "string" },
          "estimatedMonthlySavings": { "type": "number" },
          "reason": { "type": "string" }
        }
      }
    }
  }
}
```

## 10. What AI does not do

- No pricing math
- No savings math
- No recommendation logic
- No database decisions
- No lead scoring logic
