"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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

const POLL_MS = 30000;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Polling-based notification bell shared by the admin nav and the
// storefront account dropdown — apiBase picks which inbox
// (/api/admin/notifications or /api/account/notifications).
export default function NotificationBell({
  apiBase,
  dark = false,
  align = "right",
}: {
  apiBase: "/api/admin/notifications" | "/api/account/notifications";
  dark?: boolean;
  // Which edge of the bell button the dropdown hangs from — "left"
  // keeps it on-screen when the bell sits near the left edge of a
  // narrow container (the admin sidebar), "right" (default) suits a
  // bell near the top-right of a wide page (the storefront header).
  align?: "left" | "right";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(apiBase, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Silent — a failed poll just tries again next interval.
    }
  }, [apiBase]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleOpen(item: NotificationItem) {
    if (!item.readAt) {
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      fetch(`${apiBase}/${item.id}`, { method: "PATCH" }).catch(() => {});
    }
    setOpen(false);
    if (item.link) router.push(item.link);
  }

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);
    fetch(apiBase, { method: "POST" }).catch(() => {});
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
          dark
            ? "border-walnut-200/40 text-walnut-50 hover:bg-white/10"
            : "border-walnut-200 text-walnut-600 hover:bg-walnut-100"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-walnut-100 bg-white shadow-xl ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-walnut-100 px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-walnut-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink/50">No notifications yet.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpen(item)}
                  className={`block w-full border-b border-walnut-50 px-4 py-3 text-left text-sm last:border-0 hover:bg-walnut-50 ${
                    !item.readAt ? "bg-walnut-50/60" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!item.readAt && <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-terracotta-500" />}
                    <div className={item.readAt ? "pl-3.5" : ""}>
                      <p className="font-medium text-ink">{item.title}</p>
                      {item.body && <p className="mt-0.5 text-xs text-ink/60">{item.body}</p>}
                      <p className="mt-1 text-[11px] text-ink/40">{timeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-walnut-100 px-4 py-2 text-center">
            <Link
              href={apiBase.startsWith("/api/admin") ? "/admin/notifications" : "/account/notifications"}
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-walnut-600 hover:underline"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
