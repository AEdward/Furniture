import crypto from "node:crypto";
import mysql from "mysql2/promise";
import { getPool } from "@/lib/db-pool";

// Machine translation, cached in the `translations` table so the same
// English string is only sent to the API once per target language —
// after that, every page load reads the cached row. Falls back to
// returning the original English text (never throws) if the API key
// isn't configured or the request fails, so a translation outage never
// breaks the storefront.

export type TargetLang = "am" | "om";

const GOOGLE_TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate2";

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
    // Cache table unreachable/missing — fall through to calling the API
    // (or, if that also fails/isn't configured, to the English pass-through
    // in translateBatch). A cache outage must never break the storefront.
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

async function callGoogleTranslate(texts: string[], target: TargetLang): Promise<string[]> {
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
 * Translates a batch of English strings into the target language, using
 * the DB cache first and only calling the translation API for the
 * strings that aren't cached yet. Returns a same-length array aligned
 * with the input — untranslatable/empty entries pass through unchanged.
 */
export async function translateBatch(texts: string[], target: TargetLang): Promise<string[]> {
  const unique = Array.from(new Set(texts.filter((t) => t && t.trim())));
  if (unique.length === 0) return texts;

  const cached = await getCached(target, unique);
  const missing = unique.filter((t) => !cached.has(t));

  if (missing.length > 0) {
    const translated = await callGoogleTranslate(missing, target);
    const newPairs: [string, string][] = [];
    missing.forEach((source, i) => {
      const translatedText = translated[i];
      cached.set(source, translatedText);
      if (translatedText !== source) newPairs.push([source, translatedText]);
    });
    // Only worth caching rows that actually changed (i.e. the API key
    // was configured and returned something) — pass-throughs would just
    // bloat the table for no benefit.
    await storeCached(target, newPairs).catch(() => {});
  }

  return texts.map((t) => (t && t.trim() ? cached.get(t) ?? t : t));
}

export async function translateText(text: string, target: TargetLang): Promise<string> {
  const [result] = await translateBatch([text], target);
  return result;
}

export function isTranslationConfigured(): boolean {
  return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);
}
