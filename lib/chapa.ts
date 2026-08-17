// Chapa (chapa.co) payment integration — Ethiopia-focused hosted
// checkout. We use the redirect flow: initialize a transaction
// server-side, send the customer to Chapa's hosted checkout_url, and
// they land back on our return_url when done. Payment is only ever
// treated as real after independently calling verifyChapaTransaction()
// against Chapa's own API — never by trusting a webhook payload or a
// query string on its own (either could be spoofed; a re-verified
// result from Chapa's API can't be).

const CHAPA_API_BASE = "https://api.chapa.co/v1";

export class ChapaError extends Error {}

export function isChapaConfigured(): boolean {
  return Boolean(process.env.CHAPA_SECRET_KEY);
}

function secretKey(): string {
  const key = process.env.CHAPA_SECRET_KEY;
  if (!key) {
    throw new ChapaError(
      "Online payment isn't set up yet — CHAPA_SECRET_KEY is missing."
    );
  }
  return key;
}

export type InitializeInput = {
  amount: number; // ETB, major unit (matches formatPrice — no cents)
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  txRef: string;
  callbackUrl: string;
  returnUrl: string;
  title: string;
  description: string;
};

export async function initializeChapaTransaction(
  input: InitializeInput
): Promise<{ checkoutUrl: string }> {
  const res = await fetch(`${CHAPA_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(input.amount),
      currency: "ETB",
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone_number: input.phone,
      tx_ref: input.txRef,
      callback_url: input.callbackUrl,
      return_url: input.returnUrl,
      // Chapa caps title at 16 chars and rejects most punctuation in it.
      customization: {
        title: input.title.slice(0, 16),
        description: input.description.slice(0, 60),
      },
    }),
  });

  const data = await res.json().catch(() => null);
  const checkoutUrl = data?.data?.checkout_url;
  if (!res.ok || data?.status !== "success" || typeof checkoutUrl !== "string") {
    throw new ChapaError(
      typeof data?.message === "string" ? data.message : "Could not start payment with Chapa."
    );
  }
  return { checkoutUrl };
}

export type VerifyResult = {
  success: boolean;
  status: string;
  amount?: number;
  currency?: string;
};

export async function verifyChapaTransaction(txRef: string): Promise<VerifyResult> {
  const res = await fetch(
    `${CHAPA_API_BASE}/transaction/verify/${encodeURIComponent(txRef)}`,
    { headers: { Authorization: `Bearer ${secretKey()}` } }
  );
  const data = await res.json().catch(() => null);
  const status: string | undefined = data?.data?.status ?? data?.status;

  return {
    success: res.ok && status === "success",
    status: status ?? "unknown",
    amount: data?.data?.amount !== undefined ? Number(data.data.amount) : undefined,
    currency: data?.data?.currency,
  };
}
