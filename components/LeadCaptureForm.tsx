"use client";

import { useState } from "react";

type LeadCaptureFormProps = {
  publicId: string;
  credexFit: boolean;
};

type FormState = {
  email: string;
  companyName: string;
  role: string;
  teamSize: string;
  website: string;
};

function getInitialFormState(): FormState {
  return {
    email: "",
    companyName: "",
    role: "",
    teamSize: "",
    website: "",
  };
}

export default function LeadCaptureForm({
  publicId,
  credexFit,
}: LeadCaptureFormProps) {
  const [formState, setFormState] = useState<FormState>(getInitialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  function validateForm() {
    const trimmedEmail = formState.email.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return "Please enter a valid email address.";
    }

    if (formState.teamSize.trim() !== "") {
      const parsedTeamSize = Number(formState.teamSize);
      if (!Number.isFinite(parsedTeamSize) || parsedTeamSize <= 0) {
        return "Team size must be a positive number if provided.";
      }
    }

    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccess(false);
      setSuccessMessage("");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess(false);
      setSuccessMessage("");

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId,
          email: formState.email.trim(),
          companyName: formState.companyName.trim(),
          role: formState.role.trim(),
          teamSize: formState.teamSize.trim(),
          website: formState.website,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not save your report. Please try again.");
      }

      setSuccess(true);
      setSuccessMessage(
        data.emailSent === false
          ? "Thanks — your report was saved. The confirmation email could not be sent, but your public report link still works."
          : "Thanks — your report has been saved and emailed to you."
      );
      setFormState(getInitialFormState());
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save your report. Please try again."
      );
      setSuccess(false);
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Save report
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {credexFit
                ? "Want to explore these savings?"
                : "Want this report in your inbox?"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {credexFit
                ? "Save this audit and share your details so the team can follow up on high-value AI infrastructure savings opportunities."
                : "Get a copy of this audit and receive updates when new AI cost optimizations apply to your stack."}
            </p>
            <p className="mt-5 text-sm text-slate-500">
              Public audit links do not include your email, company name, or role.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              type="text"
              name="website"
              value={formState.website}
              onChange={(event) => updateField("website", event.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div>
              <label
                htmlFor="lead-email"
                className="block text-sm font-medium text-slate-900"
              >
                Email address
              </label>
              <input
                id="lead-email"
                type="email"
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500"
                placeholder="you@company.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="lead-company"
                  className="block text-sm font-medium text-slate-900"
                >
                  Company name optional
                </label>
                <input
                  id="lead-company"
                  type="text"
                  value={formState.companyName}
                  onChange={(event) => updateField("companyName", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label
                  htmlFor="lead-role"
                  className="block text-sm font-medium text-slate-900"
                >
                  Role optional
                </label>
                <input
                  id="lead-role"
                  type="text"
                  value={formState.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500"
                  placeholder="CTO"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="lead-team-size"
                className="block text-sm font-medium text-slate-900"
              >
                Team size optional
              </label>
              <input
                id="lead-team-size"
                type="number"
                min={1}
                value={formState.teamSize}
                onChange={(event) => updateField("teamSize", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500"
                placeholder="12"
              />
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}
            {success && (
              <p className="text-sm text-emerald-600">{successMessage}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving..."
                  : credexFit
                    ? "Save report and explore savings"
                    : "Email my report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
