import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.metaDescription ?? undefined,
  };
}

export default async function CmsPage({ params }: { params: { slug: string } }) {
  const page = await getPageBySlug(params.slug);
  if (!page) notFound();

  return (
    <div>
      {page.blocks.length === 0 ? (
        <div className="container-shop py-16">
          <h1 className="font-serif text-3xl font-semibold text-ink">{page.title}</h1>
        </div>
      ) : (
        <BlockRenderer blocks={page.blocks} />
      )}
    </div>
  );
}
