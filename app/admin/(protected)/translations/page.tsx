import Link from "next/link";
import { getTranslationsForLang } from "@/lib/i18n/manage-translations";
import TranslationsEditor from "@/components/TranslationsEditor";
import type { TargetLang } from "@/lib/translate";

export const dynamic = "force-dynamic";

const LANG_LABELS: Record<TargetLang, string> = {
  am: "Amharic",
  om: "Afaan Oromoo",
};

export default async function AdminTranslationsPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const lang: TargetLang = searchParams.lang === "om" ? "om" : "am";
  const rows = await getTranslationsForLang(lang);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Translations</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink/60">
          Every English string shown on the storefront. There&apos;s no translation API involved —
          fill in Amharic and Afaan Oromoo by hand (or paste in text from a translator), and it
          appears on the site immediately.
        </p>
      </div>

      <div className="flex gap-2">
        {(Object.keys(LANG_LABELS) as TargetLang[]).map((l) => (
          <Link
            key={l}
            href={`/admin/translations?lang=${l}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              l === lang
                ? "bg-walnut-500 text-cream"
                : "border border-walnut-200 text-walnut-600 hover:bg-walnut-100"
            }`}
          >
            {LANG_LABELS[l]}
          </Link>
        ))}
      </div>

      <TranslationsEditor key={lang} initialRows={rows} />
    </div>
  );
}
