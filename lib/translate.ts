import crypto from "node:crypto";
import mysql from "mysql2/promise";
import { getPool } from "@/lib/db-pool";

// Manual translation, cached in the `translations` table. Amharic and
// Oromo text is written by an admin (see /admin/translations), not
// fetched from a live API — there's no external service to configure or
// pay for. Every English string this site displays gets a row per
// target language, keyed by a hash of (lang, source text). A string
// with no admin-supplied translation yet reads as English pass-through,
// and this module registers a placeholder row for it (translated_text =
// source_text) so it shows up in the admin editor to fill in. A DB
// outage never breaks the storefront — it just means everything reads
// as English for that request.

export type TargetLang = "am" | "om";

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
    // pass-through in translateBatch. A DB outage must never break the
    // storefront.
    return new Map();
  }
}

async function registerMissing(lang: string, texts: string[]): Promise<void> {
  if (texts.length === 0) return;
  try {
    const db = getPool();
    const values = texts.map((source) => [hashFor(lang, source), lang, source, source]);
    // INSERT IGNORE: if a row already exists for this hash — whether
    // it's still an untranslated placeholder or an admin has already
    // filled it in — leave it alone. Never clobber a saved translation.
    await db.query(
      `INSERT IGNORE INTO translations (source_hash, lang, source_text, translated_text) VALUES ?`,
      [values]
    );
  } catch {
    // Best-effort — a failure here just means this string won't show up
    // in the admin editor yet (it'll register on a later request).
    // Never blocks rendering.
  }
}

/**
 * Resolves a batch of English strings to the target language using the
 * DB-backed manual translation table. Any string with no saved
 * translation yet is registered as a placeholder (for the admin editor)
 * and passed through as English. Returns a same-length array aligned
 * with the input.
 */
export async function translateBatch(texts: string[], target: TargetLang): Promise<string[]> {
  const unique = Array.from(new Set(texts.filter((t) => t && t.trim())));
  if (unique.length === 0) return texts;

  const cached = await getCached(target, unique);
  const missing = unique.filter((t) => !cached.has(t));
  if (missing.length > 0) {
    await registerMissing(target, missing);
  }

  return texts.map((t) => (t && t.trim() ? cached.get(t) ?? t : t));
}

export async function translateText(text: string, target: TargetLang): Promise<string> {
  const [result] = await translateBatch([text], target);
  return result;
}
