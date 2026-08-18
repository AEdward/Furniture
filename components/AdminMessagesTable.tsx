"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactMessage } from "@/lib/db";

export default function AdminMessagesTable({
  initialMessages,
}: {
  initialMessages: ContactMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function handleExpand(message: ContactMessage) {
    const opening = expandedId !== message.id;
    setExpandedId(opening ? message.id : null);
    if (opening && !message.readAt) {
      const res = await fetch(`/api/admin/messages/${message.id}`, { method: "PATCH" });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, readAt: new Date().toISOString() } : m))
        );
        router.refresh();
      }
    }
  }

  async function handleDelete(message: ContactMessage) {
    if (!confirm(`Delete message from ${message.name}? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/messages/${message.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete message.");
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== message.id));
    router.refresh();
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-walnut-100 bg-white/60 p-8 text-center text-sm text-ink/50">
        No messages yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => {
        const isExpanded = expandedId === message.id;
        const isUnread = !message.readAt;
        return (
          <div
            key={message.id}
            className={`rounded-2xl border bg-white/60 transition-colors ${
              isUnread ? "border-walnut-400" : "border-walnut-100"
            }`}
          >
            <button
              type="button"
              onClick={() => handleExpand(message)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <div className="flex min-w-0 items-center gap-3">
                {isUnread && (
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-walnut-500" aria-label="Unread" />
                )}
                <div className="min-w-0">
                  <p className={`truncate text-sm ${isUnread ? "font-semibold text-ink" : "font-medium text-ink/80"}`}>
                    {message.name}
                    <span className="ml-2 font-normal text-ink/50">{message.email}</span>
                  </p>
                  {!isExpanded && (
                    <p className="truncate text-sm text-ink/50">{message.message}</p>
                  )}
                </div>
              </div>
              <span className="flex-shrink-0 text-xs text-ink/40">
                {new Date(message.createdAt).toLocaleDateString()}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-walnut-100 px-5 py-4">
                <p className="whitespace-pre-wrap text-sm text-ink/80">{message.message}</p>
                <div className="mt-4 flex items-center gap-4">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message")}`}
                    className="text-sm font-medium text-walnut-600 hover:underline"
                  >
                    Reply by email
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(message)}
                    className="text-sm font-medium text-danger-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
