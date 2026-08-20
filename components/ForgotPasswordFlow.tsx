"use client";

import { useState } from "react";
import Link from "next/link";

// Shared two-step "forgot password" flow (request a code, then enter it
// with a new password) for both the customer and admin login systems —
// only the API endpoints and the "back to sign in" link differ.
export default function ForgotPasswordFlow({
  forgotApiBase,
  resetApiBase,
  loginHref,
  title = "Reset your password",
}: {
  forgotApiBase: string;
  resetApiBase: string;
  loginHref: string;
  title?: string;
}) {
  const [step, setStep] = useState<"request" | "reset" | "done">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(forgotApiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setInfo(data.message ?? "If that email has an account, we've sent a reset code to it.");
      setStep("reset");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(resetApiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setStep("done");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl font-semibold text-ink">Password updated</h1>
        <p className="mt-2 text-sm text-ink/60">You can now sign in with your new password.</p>
        <Link href={loginHref} className="btn-primary mt-6 inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>

      {step === "request" ? (
        <>
          <p className="mt-1 text-sm text-ink/60">
            Enter your email and we'll send you a verification code.
          </p>
          <form onSubmit={handleRequestCode} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>
            {error && <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Sending…" : "Send code"}
            </button>
          </form>
        </>
      ) : (
        <>
          {info && <p className="mt-2 rounded-lg bg-walnut-50 px-4 py-3 text-sm text-ink/70">{info}</p>}
          <form onSubmit={handleReset} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              Verification code
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 tracking-[0.3em] focus:border-walnut-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              New password
              <input
                required
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Confirm new password
              <input
                required
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>
            {error && <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Saving…" : "Reset password"}
            </button>
            <button
              type="button"
              onClick={() => setStep("request")}
              className="text-sm text-ink/50 hover:text-walnut-600"
            >
              Didn't get a code? Try again
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-sm text-ink/60">
        <Link href={loginHref} className="font-medium text-walnut-600 hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
