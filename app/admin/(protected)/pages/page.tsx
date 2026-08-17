import Link from "next/link";
import { getAllPages } from "@/lib/db";
import DeletePageButton from "@/components/DeletePageButton";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await getAllPages();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Pages</h1>
          <p className="mt-1 text-sm text-ink/60">{pages.length} total</p>
        </div>
        <Link href="/admin/pages/new" className="btn-primary">
          Add page
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-walnut-100 bg-white/60">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-walnut-100 text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">URL</th>
              <th className="px-5 py-3 font-medium">In nav?</th>
              <th className="px-5 py-3 font-medium">Sections</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-walnut-100">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink/50">
                  No custom pages yet.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.slug}>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/pages/${page.slug}/edit`}
                      className="font-medium text-ink hover:text-walnut-600"
                    >
                      {page.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink/60">/{page.slug}</td>
                  <td className="px-5 py-3 text-ink/70">
                    {page.showInNav ? page.navLabel || page.title : "—"}
                  </td>
                  <td className="px-5 py-3 text-ink/70">{page.blocks.length}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/${page.slug}`}
                        target="_blank"
                        className="text-sm font-medium text-walnut-600 hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/pages/${page.slug}/edit`}
                        className="text-sm font-medium text-walnut-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeletePageButton slug={page.slug} title={page.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
