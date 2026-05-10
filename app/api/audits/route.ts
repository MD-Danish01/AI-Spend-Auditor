import { NextResponse } from "next/server";
import { calculateAudit } from "@/lib/audit-engine/calculateAudit";
import { db } from "@/lib/db";
import { audits } from "@/db/schema";
import type { AuditInput, AuditResult } from "@/lib/audit-engine/types";

function createPublicId() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 12);
}

function createFallbackSummary(result: AuditResult) {
  if (result.credexFit) {
    return `Your AI stack shows a meaningful savings opportunity. The audit found potential savings of $${result.totalMonthlySavings}/month, or $${result.totalAnnualSavings}/year. The biggest opportunities are in the recommendations below. ${result.nextBestAction}`;
  }

  return `Your AI spend looks mostly efficient, with estimated savings of $${result.totalMonthlySavings}/month. The recommendations below can still help you monitor usage, reduce waste, and keep your AI stack aligned with your team size and use case.`;
}

function isValidAuditInput(data: unknown): data is AuditInput {
  if (!data || typeof data !== "object") {
    return false;
  }

  const input = data as Partial<AuditInput>;

  return (
    typeof input.teamSize === "number" &&
    input.teamSize > 0 &&
    typeof input.primaryUseCase === "string" &&
    input.primaryUseCase.length > 0 &&
    Array.isArray(input.tools) &&
    input.tools.length > 0
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isValidAuditInput(body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid audit input. Please check team size, use case, and tools.",
        },
        { status: 400 }
      );
    }

    const auditResult = calculateAudit(body);
    const summary = createFallbackSummary(auditResult);
    const publicId = createPublicId();

    const inserted = await db
      .insert(audits)
      .values({
        publicId,
        inputJson: body,
        resultJson: auditResult,
        summary,
        summarySource: "fallback",
        totalMonthlySpend: auditResult.totalMonthlySpend,
        totalMonthlySavings: auditResult.totalMonthlySavings,
        totalAnnualSavings: auditResult.totalAnnualSavings,
        credexFit: auditResult.credexFit,
      })
      .returning({ publicId: audits.publicId });

    return NextResponse.json(
      {
        success: true,
        publicId: inserted[0].publicId,
        redirectUrl: `/audit/${inserted[0].publicId}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to generate audit:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while generating the audit.",
      },
      { status: 500 }
    );
  }
}
