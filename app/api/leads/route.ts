import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { audits, leads } from "@/db/schema";
import { sendAuditConfirmationEmail } from "@/lib/email";
import type { AuditResult } from "@/lib/audit-engine/types";

type LeadPayload = {
  publicId?: string;
  email?: string;
  companyName?: string;
  role?: string;
  teamSize?: string | number;
  website?: string;
};

function isValidEmail(email: string) {
  return email.includes("@") && email.trim().length > 3;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadPayload;
    const publicId = typeof body.publicId === "string" ? body.publicId.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
    const role = typeof body.role === "string" ? body.role.trim() : "";
    const website = typeof body.website === "string" ? body.website.trim() : "";

    if (website) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "Audit reference is required" },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    let parsedTeamSize: number | null = null;
    if (body.teamSize !== undefined && body.teamSize !== null && `${body.teamSize}`.trim() !== "") {
      const candidate = Number(body.teamSize);
      if (!Number.isFinite(candidate) || candidate <= 0) {
        return NextResponse.json(
          { success: false, error: "Team size must be a positive number" },
          { status: 400 }
        );
      }
      parsedTeamSize = Math.round(candidate);
    }

    const audit = await db.query.audits.findFirst({
      where: eq(audits.publicId, publicId),
    });

    if (!audit) {
      return NextResponse.json(
        { success: false, error: "Audit not found" },
        { status: 404 }
      );
    }

    await db.insert(leads).values({
      auditId: audit.id,
      email,
      companyName: companyName || null,
      role: role || null,
      teamSize: parsedTeamSize,
    });

    const result = audit.resultJson as AuditResult;
    const emailResult = await sendAuditConfirmationEmail({
      to: email,
      publicId,
      totalMonthlySavings: result.totalMonthlySavings,
      totalAnnualSavings: result.totalAnnualSavings,
      credexFit: result.credexFit,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: true,
          emailSent: false,
          warning: "Lead saved, but confirmation email could not be sent.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, emailSent: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to save lead:", error);

    return NextResponse.json(
      { success: false, error: "Could not save your report. Please try again." },
      { status: 500 }
    );
  }
}
