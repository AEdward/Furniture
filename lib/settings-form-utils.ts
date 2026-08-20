import type { SiteSettings } from "@/lib/settings";

// The settings PUT endpoint always takes the full SiteSettings object
// (see lib/validate-settings.ts) even though /admin/settings is now
// split into one page per section — each section's form sends this
// full body with only its own slice overridden, so unedited sections
// pass through unchanged. warranty.tiers and translation.languages
// need re-flattening to "label | value" line strings here since
// validate-settings' list-parsers expect that shape, not the
// structured objects SiteSettings itself stores them as.
export function settingsToApiBody(s: SiteSettings): Record<string, unknown> {
  return {
    name: s.name,
    shortName: s.shortName,
    tagline: s.tagline,
    description: s.description,
    email: s.email,
    phone: s.phone,
    telegramUsername: s.telegramUsername,
    address: s.address,
    freeShippingThreshold: s.freeShippingThreshold,
    hero: s.hero,
    delivery: s.delivery,
    assembly: s.assembly,
    warranty: {
      tiers: s.warranty.tiers.map((t) => `${t.part} | ${t.years}`),
      notCovered: s.warranty.notCovered,
    },
    returns: s.returns,
    paymentMethods: s.paymentMethods,
    contact: s.contact,
    bankDetails: s.bankDetails,
    translation: {
      enabled: s.translation.enabled,
      languages: s.translation.languages.map((l) => `${l.code} | ${l.label}`),
    },
  };
}
