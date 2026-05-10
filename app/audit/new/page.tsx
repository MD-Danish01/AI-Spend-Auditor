import Link from "next/link";
import SpendForm from "@/components/SpendForm";

export default function NewAuditPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          Back to homepage
        </Link>

        <header className="mt-6 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Build your AI spend profile
          </h1>
          <p className="mt-3 text-lg leading-8 text-slate-600">
            Add your team context and AI tools. We&apos;ll use this to estimate
            overspending, plan-fit issues, and savings opportunities.
          </p>
        </header>

        <div className="mt-10">
          <SpendForm />
        </div>
      </div>
    </main>
  );
}
