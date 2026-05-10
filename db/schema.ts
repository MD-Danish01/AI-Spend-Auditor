import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import type { AuditInput, AuditResult } from "@/lib/audit-engine/types";

export const audits = pgTable(
  "audits",
  {
    id: serial("id").primaryKey(),

    publicId: varchar("public_id", { length: 32 }).notNull().unique(),

    inputJson: jsonb("input_json").$type<AuditInput>().notNull(),

    resultJson: jsonb("result_json").$type<AuditResult>().notNull(),

    summary: text("summary"),

    summarySource: varchar("summary_source", { length: 32 })
      .notNull()
      .default("fallback"),

    totalMonthlySpend: integer("total_monthly_spend").notNull().default(0),

    totalMonthlySavings: integer("total_monthly_savings")
      .notNull()
      .default(0),

    totalAnnualSavings: integer("total_annual_savings").notNull().default(0),

    credexFit: boolean("credex_fit").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audits_public_id_idx").on(table.publicId),
    index("audits_created_at_idx").on(table.createdAt),
    index("audits_total_monthly_savings_idx").on(table.totalMonthlySavings),
  ]
);

export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),

    auditId: integer("audit_id")
      .notNull()
      .references(() => audits.id, { onDelete: "cascade" }),

    email: varchar("email", { length: 255 }).notNull(),

    companyName: varchar("company_name", { length: 255 }),

    role: varchar("role", { length: 120 }),

    teamSize: integer("team_size"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("leads_email_idx").on(table.email),
    index("leads_audit_id_idx").on(table.auditId),
  ]
);