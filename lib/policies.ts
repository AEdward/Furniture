// Store-wide policies shown on every product page. Placeholder values —
// replace with the real company's actual delivery/warranty/returns terms.

export const deliveryPolicy = {
  addisAbaba: { minDays: 2, maxDays: 5, fee: 500 },
  otherCities: { minDays: 5, maxDays: 10, fee: 1200 },
  freeDeliveryThreshold: 50000,
  installationFee: 800,
  carryingFee: 300,
  carryingFeeNote: "Per floor above ground level, if there's no elevator.",
};

export const assemblyPolicy = {
  requiredByDefault: true,
  typicalMinutes: 30,
  installationAvailable: true,
  installationFee: 800,
};

export const warrantyPolicy = {
  tiers: [
    { part: "Frame", years: 5 },
    { part: "Foam & cushioning", years: 2 },
    { part: "Fabric & upholstery", years: 1 },
    { part: "Hardware & mechanisms", years: 1 },
  ],
  notCovered:
    "Normal wear and tear, fading from direct sunlight, damage from misuse, and stains from spills not reported within 48 hours.",
};

export const returnsPolicy = {
  periodDays: 14,
  conditions: [
    "Item must be unused and in its original packaging",
    "Proof of purchase (order number or receipt) required",
    "Custom or made-to-order pieces are final sale unless damaged on arrival",
  ],
  customExclusion:
    "Made-to-order and custom-configured furniture can't be returned unless it arrives damaged or defective.",
  whoPaysReturn:
    "We cover return delivery for damaged or incorrect items; change-of-mind returns are paid by the customer.",
  refundProcess:
    "Refunds are issued to the original payment method within 5–7 working days of the item passing inspection.",
  damagedProcedure:
    "Photograph the damage and contact us within 48 hours of delivery — we'll arrange a free replacement or pickup.",
};

export const paymentMethods = [
  "Telebirr",
  "Chapa",
  "CBE Birr",
  "Bank transfer",
  "Card",
  "Cash on delivery",
];

export function formatDeliveryEstimate(city: "addis" | "other"): string {
  const p = city === "addis" ? deliveryPolicy.addisAbaba : deliveryPolicy.otherCities;
  return `${p.minDays}–${p.maxDays} working days`;
}
