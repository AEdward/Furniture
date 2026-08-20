"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Full-page notification list, shared by /admin/notifications and
// /account/notifications — the dropdown (NotificationBell) only shows
// the most recent handful.
export default function NotificationsList({
  apiBase,
}: {
  apiBase: "/api/admin/notifications" | "/api/account/notifications";
}) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[] | null>(null);

  useEffect(() => {
    fetch(apiBase, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setItems(data.notifications ?? []))
      .catch(() => setItems([]));
  }, [apiBase]);

  async function handleClick(item: NotificationItem) {
    if (!item.readAt) {
      setItems((prev) =>
        prev
          ? prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n))
          : prev
      );
      fetch(`${apiBase}/${item.id}`, { method: "PATCH" }).catch(() => {});
    }
    if (item.link) router.push(item.link);
  }

  async function handleMarkAllRead() {
    setItems((prev) => (prev ? prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) : prev));
    fetch(apiBase, { method: "POST" }).catch(() => {});
  }

  if (items === null) {
    return <p className="text-sm text-ink/50">Loading…</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-ink/50">No notifications yet.</p>;
  }

  const hasUnread = items.some((n) => !n.readAt);

  return (
    <div className="flex flex-col gap-3">
      {hasUnread && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-walnut-600 hover:underline"
          >
            Mark all read
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-walnut-100">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            className={`block w-full border-b border-walnut-50 px-4 py-4 text-left last:border-0 hover:bg-walnut-50 ${
              !item.readAt ? "bg-walnut-50/60" : "bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                {!item.readAt && <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-terracotta-500" />}
                <div className={item.readAt ? "pl-3.5" : ""}>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  {item.body && <p className="mt-1 text-sm text-ink/60">{item.body}</p>}
                </div>
              </div>
              <span className="flex-shrink-0 text-xs text-ink/40">{formatDate(item.createdAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
