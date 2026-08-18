import Link from "next/link";
import { getTranslationsForLang } from "@/lib/i18n/manage-translations";
import { getSettings } from "@/lib/db";
import TranslationsEditor from "@/components/TranslationsEditor";

export const dynamic = "force-dynamic";

export default async function AdminTranslationsPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const settings = await getSettings();
  const languages = settings.translation.languages;

  if (languages.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Translations</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink/60">
            No languages are configured yet.{" "}
            <Link href="/admin/settings" className="font-medium text-walnut-600 hover:underline">
              Add one in Settings
            </Link>
            , under &ldquo;Language &amp; translation&rdquo;.
          </p>
        </div>
      </div>
    );
  }

  const lang = languages.some((l) => l.code === searchParams.lang)
    ? (searchParams.lang as string)
    : languages[0].code;
  const rows = await getTranslationsForLang(lang);
  const apiKeyConfigured = Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Translations</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink/60">
          Every English string shown on the storefront, per language.{" "}
          {settings.translation.enabled
            ? "Automatic translation via Google Translate is on — new strings translate themselves the first time they're viewed. Anything you edit below is never overwritten."
            : "Automatic translation is off — fill in text by hand below, or turn it on in Settings."}
        </p>
        {settings.translation.enabled && !apiKeyConfigured && (
          <p className="mt-2 max-w-2xl rounded-lg bg-terracotta-50 px-3 py-2 text-xs text-terracotta-600">
            GOOGLE_TRANSLATE_API_KEY isn&apos;t set, so automatic translation can&apos;t run yet —
            new strings will show as English until it&apos;s configured, or you fill them in by
            hand below.
          </p>
        )}
        <p className="mt-2 text-xs text-ink/40">
          Manage which languages are offered, and turn automatic translation on or off, in{" "}
          <Link href="/admin/settings" className="font-medium text-walnut-600 hover:underline">
            Settings
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {languages.map((l) => (
          <Link
            key={l.code}
            href={`/admin/translations?lang=${l.code}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              l.code === lang
                ? "bg-walnut-500 text-cream"
                : "border border-walnut-200 text-walnut-600 hover:bg-walnut-100"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <TranslationsEditor key={lang} initialRows={rows} />
    </div>
  );
}
