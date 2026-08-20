"use client";

import { useState } from "react";

// Change-password and change-email (OTP-verified) forms, shared by the
// customer /account/settings page and the admin /admin/profile page —
// only the API base paths differ.
export default function AccountSettingsPanel({
  currentEmail,
  changePasswordApi,
  requestEmailChangeApi,
  confirmEmailChangeApi,
}: {
  currentEmail: string;
  changePasswordApi: string;
  requestEmailChangeApi: string;
  confirmEmailChangeApi: string;
}) {
  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Email
  const [emailStep, setEmailStep] = useState<"idle" | "code-sent">("idle");
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSubmitting(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      const res = await fetch(changePasswordApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error ?? "Something went wrong.");
        return;
      }
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setPasswordSubmitting(false);
    }
  }

  async function handleRequestEmailCode(e: React.FormEvent) {
    e.preventDefault();
    setEmailSubmitting(true);
    setEmailError(null);
    try {
      const res = await fetch(requestEmailChangeApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error ?? "Something went wrong.");
        return;
      }
      setEmailStep("code-sent");
    } finally {
      setEmailSubmitting(false);
    }
  }

  async function handleConfirmEmailChange(e: React.FormEvent) {
    e.preventDefault();
    setEmailSubmitting(true);
    setEmailError(null);
    try {
      const res = await fetch(confirmEmailChangeApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, code: emailCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error ?? "Something went wrong.");
        return;
      }
      setEmailSuccess(true);
      setEmailStep("idle");
      setEmailCode("");
    } finally {
      setEmailSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-walnut-100 bg-white/60 p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">Change email</h2>
        <p className="mt-1 text-sm text-ink/60">Current: {currentEmail}</p>

        {emailSuccess && (
          <p className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
            Email updated. Use your new email next time you sign in.
          </p>
        )}

        {emailStep === "idle" ? (
          <form onSubmit={handleRequestEmailCode} className="mt-4 flex flex-col gap-3 sm:max-w-sm">
            <label className="flex flex-col gap-1.5 text-sm">
              New email
              <input
                required
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2 text-sm"
              />
            </label>
            {emailError && <p className="text-sm text-danger-500">{emailError}</p>}
            <button type="submit" disabled={emailSubmitting} className="btn-primary self-start">
              {emailSubmitting ? "Sending…" : "Send verification code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmEmailChange} className="mt-4 flex flex-col gap-3 sm:max-w-sm">
            <p className="text-sm text-ink/60">We sent a code to {newEmail}.</p>
            <label className="flex flex-col gap-1.5 text-sm">
              Verification code
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2 text-sm tracking-[0.3em]"
              />
            </label>
            {emailError && <p className="text-sm text-danger-500">{emailError}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={emailSubmitting} className="btn-primary">
                {emailSubmitting ? "Confirming…" : "Confirm change"}
              </button>
              <button type="button" onClick={() => setEmailStep("idle")} className="text-sm text-ink/50 hover:text-walnut-600">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-walnut-100 bg-white/60 p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">Change password</h2>

        {passwordSuccess && (
          <p className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Password updated.</p>
        )}

        <form onSubmit={handlePasswordSubmit} className="mt-4 flex flex-col gap-3 sm:max-w-sm">
          <label className="flex flex-col gap-1.5 text-sm">
            Current password
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-lg border border-walnut-200 px-3 py-2 text-sm"
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
              className="rounded-lg border border-walnut-200 px-3 py-2 text-sm"
            />
          </label>
          {passwordError && <p className="text-sm text-danger-500">{passwordError}</p>}
          <button type="submit" disabled={passwordSubmitting} className="btn-primary self-start">
            {passwordSubmitting ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
