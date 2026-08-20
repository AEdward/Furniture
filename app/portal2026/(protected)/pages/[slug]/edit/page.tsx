import { notFound } from "next/navigation";
import PageBlockEditor from "@/components/PageBlockEditor";
import { getPageBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditPagePage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getPageBySlug(params.slug);
  if (!page) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-semibold text-ink">Edit {page.title}</h1>
      <PageBlockEditor mode="edit" initial={page} />
    </div>
  );
}
