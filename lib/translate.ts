import crypto from "node:crypto";
import { cache } from "react";
import mysql from "mysql2/promise";
import { getPool } from "@/lib/db-pool";
import { getSettings } from "@/lib/db";

// Translation, cached in the `translations` table (keyed by a hash of
// language + source text) so the same English string only needs
// resolving once per language — after that, every page load reads the
// cache. A row counts as genuinely translated only if its text differs
// from the English source; a row equal to its source is either a fresh
// placeholder or a string nobody has translated yet, and is retried
// below rather than treated as a hit.
//
// Two things can fill in a real translation:
//  1. An admin writes it directly at /admin/translations — this always
//     wins going forward, since a genuine translation is never re-sent
//     to the API.
//  2. The Google Cloud Translation API translates it automatically the
//     first time it's rendered in that language, if an admin has
//     turned this on (settings.translation.enabled) and
//     GOOGLE_TRANSLATE_API_KEY is configured.
// If auto-translation is off, unconfigured, or the request fails, the
// string is registered as an untranslated placeholder (so it still
// shows up in the admin editor) and passed through as English — a
// translation outage never breaks the storefront.
//
// Which languages exist at all (what LanguageSwitcher offers) is
// admin-configurable too — see settings.translation.languages — so a
// "target language" is just whatever string an admin typed as a code.

export type TargetLang = string;

const GOOGLE_TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate2";

// Deduped per request (this can be called many times per page: once
// via getDictionary, then again for products/settings/page blocks).
const getTranslationSettings = cache(async () => {
  try {
    const settings = await getSettings();
    return settings.translation;
  } catch {
    return { enabled: false, languages: [] as { code: string; label: string }[] };
  }
});

function hashFor(lang: string, text: string): string {
  return crypto.createHash("sha1").update(`${lang}::${text}`).digest("hex");
}

async function getCached(lang: string, texts: string[]): Promise<Map<string, string>> {
  if (texts.length === 0) return new Map();
  try {
    const db = getPool();
    const hashes = texts.map((t) => hashFor(lang, t));
    const [rows] = await db.query<mysql.RowDataPacket[]>(
      `SELECT source_hash, translated_text FROM translations WHERE lang = ? AND source_hash IN (${hashes
        .map(() => "?")
        .join(",")})`,
      [lang, ...hashes]
    );
    const byHash = new Map(rows.map((r) => [r.source_hash as string, r.translated_text as string]));
    const result = new Map<string, string>();
    for (const text of texts) {
      const hit = byHash.get(hashFor(lang, text));
      if (hit !== undefined) result.set(text, hit);
    }
    return result;
  } catch {
    // Cache table unreachable/missing — fall through to the English
    // pass-through below. A DB outage must never break the storefront.
    return new Map();
  }
}

async function storeCached(lang: string, pairs: [string, string][]): Promise<void> {
  if (pairs.length === 0) return;
  const db = getPool();
  const values = pairs.map(([source, translated]) => [
    hashFor(lang, source),
    lang,
    source,
    translated,
  ]);
  await db.query(
    `INSERT INTO translations (source_hash, lang, source_text, translated_text) VALUES ?
     ON DUPLICATE KEY UPDATE translated_text = VALUES(translated_text)`,
    [values]
  );
}

async function registerPlaceholders(lang: string, texts: string[]): Promise<void> {
  if (texts.length === 0) return;
  try {
    const db = getPool();
    const values = texts.map((source) => [hashFor(lang, source), lang, source, source]);
    // INSERT IGNORE: never clobber a row that's already there, whether
    // it's a genuine translation or an existing placeholder.
    await db.query(
      `INSERT IGNORE INTO translations (source_hash, lang, source_text, translated_text) VALUES ?`,
      [values]
    );
  } catch {
    // Best-effort — a failure here just means this string won't show up
    // in the admin editor yet. Never blocks rendering.
  }
}

async function callGoogleTranslate(texts: string[], target: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return texts;

  try {
    const res = await fetch(`${GOOGLE_TRANSLATE_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: texts, target, source: "en", format: "text" }),
    });
    if (!res.ok) return texts;
    const data = await res.json();
    const translations = data?.data?.translations;
    if (!Array.isArray(translations) || translations.length !== texts.length) return texts;
    return translations.map((t: { translatedText?: string }, i: number) =>
      typeof t.translatedText === "string" ? t.translatedText : texts[i]
    );
  } catch {
    return texts;
  }
}

/**
 * Resolves a batch of English strings to the target language. Cached
 * hits (genuine translations, whether admin-written or API-translated)
 * are returned as-is. Anything missing is sent to the Google Translate
 * API if auto-translation is enabled and configured; otherwise (or for
 * whatever the API doesn't resolve) it's registered as an untranslated
 * placeholder and passed through as English. Returns a same-length
 * array aligned with the input.
 */
export async function translateBatch(texts: string[], target: TargetLang): Promise<string[]> {
  const unique = Array.from(new Set(texts.filter((t) => t && t.trim())));
  if (unique.length === 0) return texts;

  const cached = await getCached(target, unique);
  const untranslated = unique.filter((t) => {
    const hit = cached.get(t);
    return hit === undefined || hit === t;
  });

  if (untranslated.length > 0) {
    const { enabled } = await getTranslationSettings();
    if (enabled) {
      const translated = await callGoogleTranslate(untranslated, target);
      const newPairs: [string, string][] = [];
      const stillMissing: string[] = [];
      untranslated.forEach((source, i) => {
        const translatedText = translated[i];
        cached.set(source, translatedText);
        if (translatedText !== source) {
          newPairs.push([source, translatedText]);
        } else {
          stillMissing.push(source);
        }
      });
      await storeCached(target, newPairs).catch(() => {});
      await registerPlaceholders(target, stillMissing);
    } else {
      await registerPlaceholders(target, untranslated);
      untranslated.forEach((t) => cached.set(t, t));
    }
  }

  return texts.map((t) => (t && t.trim() ? cached.get(t) ?? t : t));
}

export async function translateText(text: string, target: TargetLang): Promise<string> {
  const [result] = await translateBatch([text], target);
  return result;
}
