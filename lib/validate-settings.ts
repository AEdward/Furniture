import type { SiteSettings } from "@/lib/settings";

export class SettingsValidationError extends Error {}

function str(v: unknown, field: string, required = true): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (required && !s) throw new SettingsValidationError(`${field} is required.`);
  return s;
}

function num(v: unknown, field: string): number {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new SettingsValidationError(`${field} must be a number.`);
  return n;
}

function list(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    return v.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(-[A-Z]{2})?$/;

// "code | Label" per line, e.g. "am | አማርኛ"
function parseLanguages(v: unknown): { code: string; label: string }[] {
  const lines = list(v);
  const seen = new Set<string>();
  const result: { code: string; label: string }[] = [];
  for (const line of lines) {
    const [codeRaw, label] = line.split("|").map((s) => s.trim());
    const code = (codeRaw || "").toLowerCase();
    if (!code || !label) {
      throw new SettingsValidationError(
        `Languages must be formatted as "code | Label" — got "${line}".`
      );
    }
    if (code === "en") {
      throw new SettingsValidationError(
        `"en" is reserved for English (the site's source language) and can't be added as a target language.`
      );
    }
    if (!LANGUAGE_CODE_PATTERN.test(code)) {
      throw new SettingsValidationError(
        `"${code}" isn't a valid language code — use e.g. "am", "fr", "pt-BR".`
      );
    }
    if (seen.has(code)) continue;
    seen.add(code);
    result.push({ code, label });
  }
  return result;
}

// "Part name | years" per line
function parseTiers(v: unknown): { part: string; years: number }[] {
  const lines = list(v);
  return lines.map((line) => {
    const [part, years] = line.split("|").map((s) => s.trim());
    const y = Number(years);
    if (!part || !Number.isFinite(y)) {
      throw new SettingsValidationError(
        `Warranty tiers must be formatted as "Part name | years" — got "${line}".`
      );
    }
    return { part, years: y };
  });
}

export function parseSettingsInput(body: unknown): Partial<SiteSettings> {
  if (typeof body !== "object" || body === null) {
    throw new SettingsValidationError("Invalid request body.");
  }
  const b = body as Record<string, unknown>;

  return {
    name: str(b.name, "Site name"),
    shortName: str(b.shortName, "Short name"),
    tagline: str(b.tagline, "Tagline"),
    description: str(b.description, "Description"),
    email: str(b.email, "Email"),
    phone: str(b.phone, "Phone"),
    telegramUsername: str(b.telegramUsername, "Telegram username", false)
      .replace(/^https?:\/\/t\.me\//i, "")
      .replace(/^@/, ""),
    address: list(b.address),
    freeShippingThreshold: num(b.freeShippingThreshold, "Free shipping threshold"),

    hero: {
      heading: str((b.hero as Record<string, unknown>)?.heading, "Hero heading"),
      subheading: str((b.hero as Record<string, unknown>)?.subheading, "Hero subheading"),
      imageUrl:
        typeof (b.hero as Record<string, unknown>)?.imageUrl === "string" &&
        (b.hero as Record<string, unknown>).imageUrl
          ? ((b.hero as Record<string, unknown>).imageUrl as string)
          : null,
      ctaLabel: str((b.hero as Record<string, unknown>)?.ctaLabel, "Hero button label"),
      ctaHref: str((b.hero as Record<string, unknown>)?.ctaHref, "Hero button link"),
    },

    delivery: {
      addisMinDays: num((b.delivery as Record<string, unknown>)?.addisMinDays, "Addis min days"),
      addisMaxDays: num((b.delivery as Record<string, unknown>)?.addisMaxDays, "Addis max days"),
      addisFee: num((b.delivery as Record<string, unknown>)?.addisFee, "Addis fee"),
      otherMinDays: num((b.delivery as Record<string, unknown>)?.otherMinDays, "Other cities min days"),
      otherMaxDays: num((b.delivery as Record<string, unknown>)?.otherMaxDays, "Other cities max days"),
      otherFee: num((b.delivery as Record<string, unknown>)?.otherFee, "Other cities fee"),
      freeDeliveryThreshold: num(
        (b.delivery as Record<string, unknown>)?.freeDeliveryThreshold,
        "Free delivery threshold"
      ),
      installationFee: num((b.delivery as Record<string, unknown>)?.installationFee, "Installation fee"),
      carryingFee: num((b.delivery as Record<string, unknown>)?.carryingFee, "Carrying fee"),
      carryingFeeNote: str((b.delivery as Record<string, unknown>)?.carryingFeeNote, "Carrying fee note", false),
    },

    assembly: {
      requiredByDefault: Boolean((b.assembly as Record<string, unknown>)?.requiredByDefault),
      typicalMinutes: num((b.assembly as Record<string, unknown>)?.typicalMinutes, "Typical install minutes"),
      installationAvailable: Boolean((b.assembly as Record<string, unknown>)?.installationAvailable),
      installationFee: num((b.assembly as Record<string, unknown>)?.installationFee, "Installation fee"),
    },

    warranty: {
      tiers: parseTiers((b.warranty as Record<string, unknown>)?.tiers),
      notCovered: str((b.warranty as Record<string, unknown>)?.notCovered, "Not covered text", false),
    },

    returns: {
      periodDays: num((b.returns as Record<string, unknown>)?.periodDays, "Return period days"),
      conditions: list((b.returns as Record<string, unknown>)?.conditions),
      customExclusion: str((b.returns as Record<string, unknown>)?.customExclusion, "Custom exclusion", false),
      whoPaysReturn: str((b.returns as Record<string, unknown>)?.whoPaysReturn, "Who pays return", false),
      refundProcess: str((b.returns as Record<string, unknown>)?.refundProcess, "Refund process", false),
      damagedProcedure: str((b.returns as Record<string, unknown>)?.damagedProcedure, "Damaged procedure", false),
    },

    paymentMethods: list(b.paymentMethods),

    contact: {
      heading: str((b.contact as Record<string, unknown>)?.heading, "Contact page heading"),
      subheading: str((b.contact as Record<string, unknown>)?.subheading, "Contact page subheading"),
      hoursWeekday: str((b.contact as Record<string, unknown>)?.hoursWeekday, "Weekday hours", false),
      hoursWeekend: str((b.contact as Record<string, unknown>)?.hoursWeekend, "Weekend hours", false),
    },

    bankDetails: {
      bankName: str((b.bankDetails as Record<string, unknown>)?.bankName, "Bank name", false),
      accountName: str((b.bankDetails as Record<string, unknown>)?.accountName, "Account name", false),
      accountNumber: str((b.bankDetails as Record<string, unknown>)?.accountNumber, "Account number", false),
      branch: str((b.bankDetails as Record<string, unknown>)?.branch, "Branch", false),
      instructions: str((b.bankDetails as Record<string, unknown>)?.instructions, "Bank transfer instructions", false),
    },

    translation: {
      enabled: Boolean((b.translation as Record<string, unknown>)?.enabled),
      languages: parseLanguages((b.translation as Record<string, unknown>)?.languages),
    },
  };
}
