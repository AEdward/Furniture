"use client";

import { useState } from "react";

export default function SendPasswordResetButton({ customerId }: { customerId: number }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleClick() {
    setState("sending");
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/send-password-reset`, {
        method: "POST",
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "sending"}
        className="rounded-full border border-walnut-200 px-4 py-2 text-sm font-medium text-walnut-600 hover:bg-walnut-100"
      >
        {state === "sending" ? "Sending…" : "Send password reset code"}
      </button>
      {state === "sent" && <span className="text-sm text-green-700">Sent.</span>}
      {state === "error" && <span className="text-sm text-danger-500">Failed to send.</span>}
    </div>
  );
}
