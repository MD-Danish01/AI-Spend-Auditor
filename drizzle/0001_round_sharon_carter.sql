CREATE TYPE "public"."summary_source" AS ENUM('fallback', 'llm');--> statement-breakpoint
ALTER TABLE "audits" ALTER COLUMN "summary_source" SET DEFAULT 'fallback'::"public"."summary_source";--> statement-breakpoint
ALTER TABLE "audits" ALTER COLUMN "summary_source" SET DATA TYPE "public"."summary_source" USING "summary_source"::"public"."summary_source";