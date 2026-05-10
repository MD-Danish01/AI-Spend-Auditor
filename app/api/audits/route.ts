import { NextResponse } from "next/server";
import { calculateAudit } from "@/lib/audit-engine/calculateAudit";
import type { AuditInput } from "@/lib/audit-engine/types";

function isValidAuditInput(data: unknown): data is AuditInput {
  if (!data || typeof data !== "object") return false;

  const input = data as Partial<AuditInput>;

  return (
    typeof input.teamSize === "number" &&
    input.teamSize > 0 &&
    typeof input.primaryUseCase === "string" &&
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

    return NextResponse.json(
      {
        success: true,
        auditResult,
      },
      { status: 200 }
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