import type { Product } from "@/lib/products";
import type { SiteSettings } from "@/lib/settings";
import type { PageBlock } from "@/lib/pages";
import type { Locale } from "@/lib/i18n/locale";
import { translateBatch } from "@/lib/translate";

// Translates admin-authored content (product copy, site settings text,
// CMS page blocks) for display, on top of the fixed UI dictionary in
// get-dictionary.ts. Never writes translations back to the database —
// the source of truth stays English/whatever the admin typed; this is a
// read-time overlay, cached by lib/translate.ts so repeat views are
// cheap. English is the identity case (no API calls at all).

// Batches every translatable string across a whole list of products into
// one API call (rather than one call per product), then reassembles.
export async function translateProducts(
  products: Product[],
  locale: Locale
): Promise<Product[]> {
  if (locale === "en" || products.length === 0) return products;

  // product.category is deliberately NOT translated here — it's fixed
  // vocabulary already covered by the UI dictionary (see ui-strings.ts)
  // and is used as-is in `?category=` URLs, so mutating it here would
  // break category filter links. Render category labels via t(category)
  // at the call site instead.
  const strings: string[] = [];
  for (const p of products) {
    strings.push(p.name, p.description);
    strings.push(...p.details);
    strings.push(p.materials.frame);
    if (p.materials.upholstery) strings.push(p.materials.upholstery);
    if (p.materials.legs) strings.push(p.materials.legs);
    if (p.materials.foamDensity) strings.push(p.materials.foamDensity);
    strings.push(...p.colors, ...p.materialOptions, ...p.woodOptions);
  }

  const translated = await translateBatch(strings, locale);
  const byOriginal = new Map<string, string>();
  strings.forEach((s, i) => byOriginal.set(s, translated[i]));
  const tr = (s: string) => byOriginal.get(s) ?? s;

  return products.map((p) => ({
    ...p,
    name: tr(p.name),
    description: tr(p.description),
    details: p.details.map(tr),
    materials: {
      frame: tr(p.materials.frame),
      upholstery: p.materials.upholstery ? tr(p.materials.upholstery) : p.materials.upholstery,
      legs: p.materials.legs ? tr(p.materials.legs) : p.materials.legs,
      foamDensity: p.materials.foamDensity ? tr(p.materials.foamDensity) : p.materials.foamDensity,
    },
    colors: p.colors.map(tr),
    materialOptions: p.materialOptions.map(tr),
    woodOptions: p.woodOptions.map(tr),
  }));
}

export async function translateProduct(product: Product, locale: Locale): Promise<Product> {
  const [translated] = await translateProducts([product], locale);
  return translated;
}

export async function translateSettings(
  settings: SiteSettings,
  locale: Locale
): Promise<SiteSettings> {
  if (locale === "en") return settings;

  // Excludes shortName (a single initial), email, and phone — those are
  // literal data, not prose, and must not be run through translation.
  const strings = [
    settings.tagline,
    settings.description,
    ...settings.address,
    settings.hero.heading,
    settings.hero.subheading,
    settings.hero.ctaLabel,
    settings.delivery.carryingFeeNote,
    settings.warranty.notCovered,
    ...settings.warranty.tiers.map((t) => t.part),
    ...settings.returns.conditions,
    settings.returns.customExclusion,
    settings.returns.whoPaysReturn,
    settings.returns.refundProcess,
    settings.returns.damagedProcedure,
    ...settings.paymentMethods,
    settings.contact.heading,
    settings.contact.subheading,
    settings.contact.hoursWeekday,
    settings.contact.hoursWeekend,
  ];

  const translated = await translateBatch(strings, locale);
  const byOriginal = new Map<string, string>();
  strings.forEach((s, i) => byOriginal.set(s, translated[i]));
  const tr = (s: string) => byOriginal.get(s) ?? s;

  return {
    ...settings,
    tagline: tr(settings.tagline),
    description: tr(settings.description),
    address: settings.address.map(tr),
    hero: {
      ...settings.hero,
      heading: tr(settings.hero.heading),
      subheading: tr(settings.hero.subheading),
      ctaLabel: tr(settings.hero.ctaLabel),
    },
    delivery: {
      ...settings.delivery,
      carryingFeeNote: tr(settings.delivery.carryingFeeNote),
    },
    warranty: {
      tiers: settings.warranty.tiers.map((t) => ({ ...t, part: tr(t.part) })),
      notCovered: tr(settings.warranty.notCovered),
    },
    returns: {
      ...settings.returns,
      conditions: settings.returns.conditions.map(tr),
      customExclusion: tr(settings.returns.customExclusion),
      whoPaysReturn: tr(settings.returns.whoPaysReturn),
      refundProcess: tr(settings.returns.refundProcess),
      damagedProcedure: tr(settings.returns.damagedProcedure),
    },
    paymentMethods: settings.paymentMethods.map(tr),
    contact: {
      heading: tr(settings.contact.heading),
      subheading: tr(settings.contact.subheading),
      hoursWeekday: tr(settings.contact.hoursWeekday),
      hoursWeekend: tr(settings.contact.hoursWeekend),
    },
  };
}

export async function translatePageBlocks(
  blocks: PageBlock[],
  locale: Locale
): Promise<PageBlock[]> {
  if (locale === "en" || blocks.length === 0) return blocks;

  const strings: string[] = [];
  for (const b of blocks) {
    if (b.type === "hero") {
      strings.push(b.heading, b.subheading);
      if (b.ctaLabel) strings.push(b.ctaLabel);
    } else {
      if (b.heading) strings.push(b.heading);
      strings.push(b.body);
    }
  }

  const translated = await translateBatch(strings, locale);
  const byOriginal = new Map<string, string>();
  strings.forEach((s, i) => byOriginal.set(s, translated[i]));
  const tr = (s: string) => byOriginal.get(s) ?? s;

  return blocks.map((b) => {
    if (b.type === "hero") {
      return {
        ...b,
        heading: tr(b.heading),
        subheading: tr(b.subheading),
        ctaLabel: b.ctaLabel ? tr(b.ctaLabel) : b.ctaLabel,
      };
    }
    return {
      ...b,
      heading: b.heading ? tr(b.heading) : b.heading,
      body: tr(b.body),
    };
  });
}

export async function translateLabels<T extends { label: string }>(
  items: T[],
  locale: Locale
): Promise<T[]> {
  if (locale === "en" || items.length === 0) return items;
  const translated = await translateBatch(
    items.map((i) => i.label),
    locale
  );
  return items.map((item, i) => ({ ...item, label: translated[i] }));
}
