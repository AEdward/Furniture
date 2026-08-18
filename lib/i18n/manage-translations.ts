import crypto from "node:crypto";
import mysql from "mysql2/promise";
import { getPool } from "@/lib/db-pool";
import { UI_STRINGS } from "@/lib/i18n/ui-strings";
import type { TargetLang } from "@/lib/translate";

// Admin-facing CRUD for the translation table (see lib/translate.ts for
// the read-time lookup/auto-translate this feeds). Lets an admin fill
// in or correct text for every English string the site can show, for
// any admin-configured language — an edit here always sticks, even
// when automatic Google Translate is on (see settings.translation).

export type TranslationRow = {
  id: number;
  sourceText: string;
  translatedText: string;
  needsTranslation: boolean;
};

function hashFor(lang: string, text: string): string {
  return crypto.createHash("sha1").update(`${lang}::${text}`).digest("hex");
}

// Guarantees every known UI string has at least a placeholder row for
// this language before we list them, so the editor always shows the
// full current vocabulary — including strings added to ui-strings.ts
// since the table was last populated — without needing a separate
// seed/migration step.
async function ensureUiStringsRegistered(lang: TargetLang): Promise<void> {
  const db = getPool();
  const values = UI_STRINGS.map((source) => [hashFor(lang, source), lang, source, source]);
  await db.query(
    `INSERT IGNORE INTO translations (source_hash, lang, source_text, translated_text) VALUES ?`,
    [values]
  );
}

export async function getTranslationsForLang(lang: TargetLang): Promise<TranslationRow[]> {
  await ensureUiStringsRegistered(lang);
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT id, source_text, translated_text FROM translations
     WHERE lang = ?
     ORDER BY (translated_text = source_text) DESC, source_text ASC`,
    [lang]
  );
  return rows.map((r) => ({
    id: r.id as number,
    sourceText: r.source_text as string,
    translatedText: r.translated_text as string,
    needsTranslation: r.translated_text === r.source_text,
  }));
}

export class TranslationError extends Error {}

export async function updateTranslationText(id: number, translatedText: string): Promise<void> {
  const trimmed = translatedText.trim();
  if (!trimmed) {
    throw new TranslationError("Translation can't be empty.");
  }
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE translations SET translated_text = ? WHERE id = ?",
    [trimmed, id]
  );
  if (result.affectedRows === 0) {
    throw new TranslationError("Translation not found.");
  }
}
