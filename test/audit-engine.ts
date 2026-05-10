import { calculateAudit } from '@/lib/audit-engine/calculateAudit';
import type { AuditInput } from "@/lib/audit-engine/types";

const testInput: AuditInput = {
    teamSize: 6,
    primaryUseCase: "coding",
    estimatedTotalMonthlySpend: 990,
    tools: [
        {
            id: "tool-1",
            type: "subscription",
            toolName: "Cursor",
            plan: "Teams",
            seats: 6,
            monthlySpend: 240,
        },
        {
            id: "tool-2",
            type: "subscription",
            toolName: "ChatGPT",
            plan: "Business",
            seats: 4,
            monthlySpend: 100,
        },
        {
            id: "tool-3",
            type: "api",
            toolName: "OpenAI API",
            monthlySpend: 650,
            apiUsage: "product_features",
            mainModel: "GPT-4o / GPT-5 class",
        },
    ],
};

export function audit() {
    console.log('Auditing...');

    const auditResult = calculateAudit(testInput);

    console.log('Audit result:', auditResult);

}

audit();