"use client";

import { useT } from "@/lib/i18n/context";

export default function TelegramButton({ username }: { username: string }) {
  const t = useT();
  const handle = username.trim().replace(/^@/, "");
  if (!handle) return null;

  return (
    <a
      href={`https://t.me/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("Chat on Telegram")}
      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#26A5E4] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M21.05 3.87 2.98 10.86c-1.23.49-1.22 1.17-.22 1.47l4.63 1.45 1.78 5.4c.22.6.4.83.81.83.44 0 .63-.2.87-.44l2.09-2.03 4.35 3.21c.8.44 1.38.22 1.58-.74l2.87-13.5c.29-1.18-.44-1.71-1.19-1.64Zm-11.2 10.8-.77 4.32-1.6-5 9.5-6.03c.31-.19.59-.09.36.13L9.85 14.67Z" />
      </svg>
    </a>
  );
}
