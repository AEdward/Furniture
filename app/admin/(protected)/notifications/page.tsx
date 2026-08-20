import NotificationsList from "@/components/NotificationsList";

export const dynamic = "force-dynamic";

export default function AdminNotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink/60">Activity across orders, messages, reviews, and stock.</p>
      </div>
      <NotificationsList apiBase="/api/admin/notifications" />
    </div>
  );
}
