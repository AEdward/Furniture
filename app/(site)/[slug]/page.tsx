import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageBySlug } from "@/lib/db";
import { getLocale } from "@/lib/i18n/get-locale";
import { translatePageBlocks } from "@/lib/i18n/translate-content";
import { translateText } from "@/lib/translate";

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

  const locale = getLocale();
  const [title, blocks] = await Promise.all([
    locale === "en" ? page.title : translateText(page.title, locale),
    translatePageBlocks(page.blocks, locale),
  ]);

  return (
    <div>
      {blocks.length === 0 ? (
        <div className="container-shop py-16">
          <h1 className="font-serif text-3xl font-semibold text-ink">{title}</h1>
        </div>
      ) : (
        <BlockRenderer blocks={blocks} />
      )}
    </div>
  );
}
