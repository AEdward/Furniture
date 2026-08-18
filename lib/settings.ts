// Site-wide settings: name/tagline/contact info, the home page hero, and
// delivery/assembly/warranty/returns/payment policy. Stored as one JSON
// blob in the `settings` table (key = "site") so it's editable from
// /admin/settings instead of living in static code files.

export type SiteSettings = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string[];
  freeShippingThreshold: number;

  hero: {
    heading: string;
    subheading: string;
    imageUrl: string | null;
    ctaLabel: string;
    ctaHref: string;
  };

  delivery: {
    addisMinDays: number;
    addisMaxDays: number;
    addisFee: number;
    otherMinDays: number;
    otherMaxDays: number;
    otherFee: number;
    freeDeliveryThreshold: number;
    installationFee: number;
    carryingFee: number;
    carryingFeeNote: string;
  };

  assembly: {
    requiredByDefault: boolean;
    typicalMinutes: number;
    installationAvailable: boolean;
    installationFee: number;
  };

  warranty: {
    tiers: { part: string; years: number }[];
    notCovered: string;
  };

  returns: {
    periodDays: number;
    conditions: string[];
    customExclusion: string;
    whoPaysReturn: string;
    refundProcess: string;
    damagedProcedure: string;
  };

  paymentMethods: string[];

  contact: {
    heading: string;
    subheading: string;
    hoursWeekday: string;
    hoursWeekend: string;
  };

  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    instructions: string;
  };

  translation: {
    enabled: boolean;
    languages: { code: string; label: string }[];
  };
};

export const DEFAULT_SETTINGS: SiteSettings = {
  name: "Zemenay Furniture",
  shortName: "Z",
  tagline: "Custom furniture, doors, cabinets & closets, built to fit.",
  description:
    "Zemenay Furniture — solid materials, honest prices, and doors, kitchen cabinets, closets, sofas, dining sets, and beds built to last a lifetime.",
  email: "hello@zemenayfurniture.com",
  phone: "(555) 555-0148",
  address: ["Addis Ababa, Ethiopia"],
  freeShippingThreshold: 50000,

  hero: {
    heading: "Furniture, doors, and cabinetry built to fit your space.",
    subheading:
      "Solid materials, honest prices, and craftsmanship built to be lived with — not just looked at. Browse the collection or ask about a custom build.",
    imageUrl: null,
    ctaLabel: "Shop the collection",
    ctaHref: "/shop",
  },

  delivery: {
    addisMinDays: 2,
    addisMaxDays: 5,
    addisFee: 500,
    otherMinDays: 5,
    otherMaxDays: 10,
    otherFee: 1200,
    freeDeliveryThreshold: 50000,
    installationFee: 800,
    carryingFee: 300,
    carryingFeeNote: "Per floor above ground level, if there's no elevator.",
  },

  assembly: {
    requiredByDefault: true,
    typicalMinutes: 45,
    installationAvailable: true,
    installationFee: 800,
  },

  warranty: {
    tiers: [
      { part: "Frame & core material", years: 5 },
      { part: "Finish & hardware", years: 2 },
      { part: "Sliding tracks & mechanisms", years: 1 },
    ],
    notCovered:
      "Normal wear and tear, warping from extreme humidity, damage from improper installation by others, and finish damage not reported within 48 hours.",
  },

  returns: {
    periodDays: 14,
    conditions: [
      "Item must be unused and in its original packaging",
      "Proof of purchase (order number or receipt) required",
      "Custom or made-to-order pieces are final sale unless damaged on arrival",
    ],
    customExclusion:
      "Made-to-order and custom-configured pieces can't be returned unless they arrive damaged or defective.",
    whoPaysReturn:
      "We cover return delivery for damaged or incorrect items; change-of-mind returns are paid by the customer.",
    refundProcess:
      "Refunds are issued to the original payment method within 5–7 working days of the item passing inspection.",
    damagedProcedure:
      "Photograph the damage and contact us within 48 hours of delivery — we'll arrange a free replacement or repair.",
  },

  paymentMethods: ["Telebirr", "Chapa", "CBE Birr", "Bank transfer", "Card", "Cash on delivery"],

  contact: {
    heading: "Contact us",
    subheading: "Get in touch",
    hoursWeekday: "Mon–Fri: 10am–6pm",
    hoursWeekend: "Sat–Sun: 11am–5pm",
  },

  bankDetails: {
    bankName: "Commercial Bank of Ethiopia",
    accountName: "Zemenay Furniture PLC",
    accountNumber: "1000000000000",
    branch: "Bole Branch",
    instructions:
      "Please include your order number as the transfer reference, then send a screenshot of the receipt to our phone number so we can confirm and start preparing your order.",
  },

  translation: {
    enabled: true,
    languages: [
      { code: "am", label: "አማርኛ" },
      { code: "om", label: "Afaan Oromoo" },
    ],
  },
};

export function mergeSettings(partial: Partial<SiteSettings>): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    hero: { ...DEFAULT_SETTINGS.hero, ...partial.hero },
    delivery: { ...DEFAULT_SETTINGS.delivery, ...partial.delivery },
    assembly: { ...DEFAULT_SETTINGS.assembly, ...partial.assembly },
    warranty: { ...DEFAULT_SETTINGS.warranty, ...partial.warranty },
    returns: { ...DEFAULT_SETTINGS.returns, ...partial.returns },
    contact: { ...DEFAULT_SETTINGS.contact, ...partial.contact },
    bankDetails: { ...DEFAULT_SETTINGS.bankDetails, ...partial.bankDetails },
    translation: { ...DEFAULT_SETTINGS.translation, ...partial.translation },
  };
}
