import { getAllContactMessages } from "@/lib/db";
import AdminMessagesTable from "@/components/AdminMessagesTable";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getAllContactMessages();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Messages</h1>
        <p className="mt-1 text-sm text-ink/60">
          Submissions from the site's contact form. {messages.length} total.
        </p>
      </div>

      <AdminMessagesTable initialMessages={messages} />
    </div>
  );
}
