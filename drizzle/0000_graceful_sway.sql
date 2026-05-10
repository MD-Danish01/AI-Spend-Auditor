CREATE TABLE "audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(32) NOT NULL,
	"input_json" jsonb NOT NULL,
	"result_json" jsonb NOT NULL,
	"summary" text,
	"summary_source" varchar(32) DEFAULT 'fallback' NOT NULL,
	"total_monthly_spend" integer DEFAULT 0 NOT NULL,
	"total_monthly_savings" integer DEFAULT 0 NOT NULL,
	"total_annual_savings" integer DEFAULT 0 NOT NULL,
	"credex_fit" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audits_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"audit_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"company_name" varchar(255),
	"role" varchar(120),
	"team_size" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audits_public_id_idx" ON "audits" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "audits_created_at_idx" ON "audits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audits_total_monthly_savings_idx" ON "audits" USING btree ("total_monthly_savings");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_audit_id_idx" ON "leads" USING btree ("audit_id");