import Link from "next/link";

export default function AuditNotFound() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16 text-center">
        <div className="w-full rounded-4xl border border-slate-200 bg-white px-8 py-12 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">
            AI Spend Auditor
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Audit not found
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            This public audit link does not exist or may have been removed.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/audit/new"
              className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Start free audit
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
