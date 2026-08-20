"use client";

import { useState } from "react";
import Image from "next/image";
import { useT } from "@/lib/i18n/context";

export default function BankReceiptUpload({
  orderId,
  customerEmail,
  initialReceiptUrl,
  alreadyPaid,
}: {
  orderId: number;
  customerEmail: string;
  initialReceiptUrl: string | null;
  alreadyPaid: boolean;
}) {
  const t = useT();
  const [receiptUrl, setReceiptUrl] = useState(initialReceiptUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", customerEmail);

    try {
      const res = await fetch(`/api/orders/${orderId}/receipt`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("Failed to upload receipt."));
        return;
      }
      setReceiptUrl(data.url);
    } catch {
      setError(t("Network error — please try again."));
    } finally {
      setUploading(false);
    }
  }

  if (alreadyPaid) return null;

  return (
    <div className="mt-4 border-t border-walnut-100 pt-4">
      <p className="font-medium text-ink">{t("Upload your transfer receipt")}</p>
      <p className="mt-1 text-xs text-ink/50">
        {t("A photo or screenshot of the transfer confirmation helps us verify payment faster.")}
      </p>

      {receiptUrl && (
        <a
          href={receiptUrl}
          target="_blank"
          rel="noreferrer"
          className="relative mt-3 block h-28 w-28 overflow-hidden rounded-lg border border-walnut-100"
        >
          <Image src={receiptUrl} alt={t("Uploaded receipt")} fill className="object-cover" />
        </a>
      )}

      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-walnut-300 px-4 py-2 text-xs font-medium text-ink hover:bg-walnut-50">
        {uploading
          ? t("Uploading…")
          : receiptUrl
            ? t("Replace receipt")
            : t("Choose receipt image")}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
      </label>

      {error && <p className="mt-2 text-xs text-danger-500">{error}</p>}
    </div>
  );
}
