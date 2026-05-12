import { Resend } from "resend";

type SendAuditConfirmationEmailInput = {
  to: string;
  publicId: string;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  credexFit: boolean;
};

function formatCurrency(value: number) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

export async function sendAuditConfirmationEmail(
  input: SendAuditConfirmationEmailInput
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY is not set" };
  }

  if (!from) {
    return { success: false, error: "EMAIL_FROM is not set" };
  }

  if (!appUrl) {
    return { success: false, error: "NEXT_PUBLIC_APP_URL is not set" };
  }

  const resend = new Resend(apiKey);
  const auditUrl = `${appUrl}/audit/${input.publicId}`;
  const monthlySavings = formatCurrency(input.totalMonthlySavings);
  const annualSavings = formatCurrency(input.totalAnnualSavings);
  const savingsNote = input.credexFit
    ? "Your audit shows a meaningful AI infrastructure savings opportunity. Reviewing high-spend tools and discounted AI/cloud credits may help capture more of this savings."
    : "Your current AI spend does not show a major high-savings opportunity yet. Keep monitoring usage as your team grows.";

  const html = `
    <div style="background:#f8fafc;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0891b2;">
          AI Spend Auditor
        </p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;font-weight:700;color:#0f172a;">
          Your AI Spend Audit report is ready
        </h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
          Your audit is available at the link below. Estimated savings from your current AI stack are <strong>${monthlySavings}/month</strong> and <strong>${annualSavings}/year</strong>.
        </p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
          ${savingsNote}
        </p>
        <div style="margin:0 0 24px;">
          <a href="${auditUrl}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 18px;border-radius:9999px;">
            Open your audit report
          </a>
        </div>
        <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#64748b;">
          Report link: <a href="${auditUrl}" style="color:#0891b2;text-decoration:none;">${auditUrl}</a>
        </p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">
          Privacy note: this public report does not include your email, company name, or role.
        </p>
      </div>
    </div>
  `;

  const text = [
    "Your AI Spend Audit report is ready",
    "",
    `Estimated monthly savings: ${monthlySavings}`,
    `Estimated annual savings: ${annualSavings}`,
    "",
    savingsNote,
    "",
    `Open your report: ${auditUrl}`,
    "",
    "Privacy note: this public report does not include your email, company name, or role.",
  ].join("\n");

  try {
    await resend.emails.send({
      from,
      to: input.to,
      subject: "Your AI Spend Audit report is ready",
      html,
      text,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send audit confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send confirmation email",
    };
  }
}
