import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import AddToCartPanel from "@/components/AddToCartPanel";
import { VariantImageProvider } from "@/components/VariantImageContext";
import StarRating from "@/components/StarRating";
import RoomFitCalculator from "@/components/RoomFitCalculator";
import DeliveryEstimator from "@/components/DeliveryEstimator";
import ProductReviews from "@/components/ProductReviews";
import WishlistButton from "@/components/WishlistButton";
import {
  getApprovedReviews,
  getCompleteTheRoomProducts,
  getProductBySlug,
  getRelatedProducts,
  getSettings,
  getWishlistProductIds,
} from "@/lib/db";
import { getCurrentCustomer } from "@/lib/customers";
import { formatPrice } from "@/lib/products";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createT } from "@/lib/i18n/t";
import { translateProduct, translateProducts, translateSettings } from "@/lib/i18n/translate-content";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

const sectionNav = [
  { href: "#description", label: "Description" },
  { href: "#dimensions", label: "Dimensions" },
  { href: "#materials", label: "Materials" },
  { href: "#delivery", label: "Delivery" },
  { href: "#warranty", label: "Warranty" },
  { href: "#returns", label: "Returns" },
  { href: "#room-fit", label: "Fit Check" },
  { href: "#reviews", label: "Reviews" },
];

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const productRaw = await getProductBySlug(params.slug);
  if (!productRaw) notFound();

  const locale = await getLocale();
  const [relatedRaw, completeTheRoomRaw, settingsRaw, dict, reviews, customer] = await Promise.all([
    getRelatedProducts(productRaw),
    getCompleteTheRoomProducts(productRaw),
    getSettings(),
    getDictionary(locale),
    getApprovedReviews(productRaw.id),
    getCurrentCustomer(),
  ]);
  const wishlistedIds = customer ? await getWishlistProductIds(customer.id) : [];
  const t = createT(dict);
  const [product, related, completeTheRoom, settings] = await Promise.all([
    translateProduct(productRaw, locale),
    translateProducts(relatedRaw, locale),
    translateProducts(completeTheRoomRaw, locale),
    translateSettings(settingsRaw, locale),
  ]);
  const d = product.dimensions;
  const m = product.materials;
  const { delivery, assembly, warranty, returns, paymentMethods } = settings;

  const availabilityColor =
    product.availability === "in_stock"
      ? "text-walnut-600"
      : product.availability === "made_to_order"
        ? "text-terracotta-500"
        : "text-ink/40";

  const availabilityText =
    product.availability === "made_to_order"
      ? product.leadTimeDays
        ? t("Made to order — available in {days} working days", { days: product.leadTimeDays })
        : t("Made to order")
      : product.availability === "out_of_stock"
        ? t("Out of stock")
        : product.stock > 0 && product.stock <= 5
          ? t("Only {stock} left in stock", { stock: product.stock })
          : t("In stock");

  const availabilitySchema =
    product.availability === "in_stock"
      ? "https://schema.org/InStock"
      : product.availability === "made_to_order"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/OutOfStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: [product.imageUrl, ...(product.images ?? [])].filter(Boolean),
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "ETB",
      price: product.price,
      availability: availabilitySchema,
    },
  };

  return (
    <div className="container-shop py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 text-sm text-ink/50">
        <Link href="/shop" className="hover:text-walnut-600">
          {t("Shop")}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-walnut-600"
        >
          {t(product.category)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <VariantImageProvider>
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={[product.imageUrl, ...(product.images ?? [])].filter(
            (url): url is string => !!url
          )}
          name={product.name}
          icon={product.icon}
          gradient={product.gradient}
        />

        <div className="flex flex-col">
          <p className="section-label">{t(product.category)}</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            <span className="text-ink/30">·</span>
            <span className="font-mono text-xs text-ink/40">{t("SKU {sku}", { sku: product.sku })}</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-walnut-600">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-ink/40 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className={`mt-2 text-sm font-medium ${availabilityColor}`}>
            {availabilityText}
          </p>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/70">
            {product.description}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <AddToCartPanel product={product} />
            <WishlistButton
              productSlug={product.slug}
              initialWishlisted={wishlistedIds.includes(product.id)}
              loggedIn={!!customer}
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-walnut-100 pt-6 text-xs text-ink/60 sm:grid-cols-4">
            <a href="#delivery" className="hover:text-walnut-600">
              🚚 {t("{min}–{max} days", { min: delivery.addisMinDays, max: delivery.addisMaxDays })}
            </a>
            <a href="#materials" className="hover:text-walnut-600">
              🔧 {assembly.installationAvailable ? t("Installation available") : t("Self-install")}
            </a>
            <a href="#warranty" className="hover:text-walnut-600">
              🛡️ {t("{years}-year warranty", { years: warranty.tiers[0].years })}
            </a>
            <a href="#returns" className="hover:text-walnut-600">
              ↩️ {t("{days}-day returns", { days: returns.periodDays })}
            </a>
          </div>
        </div>
      </div>
      </VariantImageProvider>

      <nav className="sticky top-[73px] z-30 mt-16 flex flex-wrap gap-x-6 gap-y-2 border-y border-walnut-100 bg-cream/95 py-3 text-sm text-ink/60 backdrop-blur">
        {sectionNav.map((s) => (
          <a key={s.href} href={s.href} className="hover:text-walnut-600">
            {t(s.label)}
          </a>
        ))}
      </nav>

      <section id="description" className="scroll-mt-32 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">{t("Description")}</h2>
        <p className="max-w-2xl text-base leading-relaxed text-ink/70">{product.description}</p>
        <ul className="mt-4 max-w-2xl space-y-1.5 text-sm text-ink/70">
          {product.details.map((detail) => (
            <li key={detail} className="flex gap-2">
              <span className="text-terracotta-400">•</span>
              {detail}
            </li>
          ))}
        </ul>
      </section>

      <section id="dimensions" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">{t("Dimensions")}</h2>
        <div className="max-w-md overflow-hidden rounded-xl border border-walnut-100">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-walnut-100">
              <tr className="bg-walnut-50/50">
                <td className="px-4 py-2.5 font-medium text-ink">{t("Width")}</td>
                <td className="px-4 py-2.5 text-right text-ink/70">{d.widthCm} cm</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-ink">{t("Depth")}</td>
                <td className="px-4 py-2.5 text-right text-ink/70">{d.depthCm} cm</td>
              </tr>
              <tr className="bg-walnut-50/50">
                <td className="px-4 py-2.5 font-medium text-ink">{t("Height")}</td>
                <td className="px-4 py-2.5 text-right text-ink/70">{d.heightCm} cm</td>
              </tr>
              {d.seatHeightCm !== undefined && (
                <tr>
                  <td className="px-4 py-2.5 font-medium text-ink">{t("Seat height")}</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">{d.seatHeightCm} cm</td>
                </tr>
              )}
              {d.seatDepthCm !== undefined && (
                <tr className="bg-walnut-50/50">
                  <td className="px-4 py-2.5 font-medium text-ink">{t("Seat depth")}</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">{d.seatDepthCm} cm</td>
                </tr>
              )}
              {d.armHeightCm !== undefined && (
                <tr>
                  <td className="px-4 py-2.5 font-medium text-ink">{t("Arm height")}</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">{d.armHeightCm} cm</td>
                </tr>
              )}
              {d.legHeightCm !== undefined && (
                <tr className="bg-walnut-50/50">
                  <td className="px-4 py-2.5 font-medium text-ink">{t("Leg height")}</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">{d.legHeightCm} cm</td>
                </tr>
              )}
              {d.weightKg !== undefined && (
                <tr>
                  <td className="px-4 py-2.5 font-medium text-ink">{t("Weight")}</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">{d.weightKg} kg</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-md text-xs text-ink/40">
          {t(
            "Custom sizes are available on made-to-order pieces — contact us with your exact opening or space measurements."
          )}
        </p>
      </section>

      <section id="materials" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">
          {t("Materials & construction")}
        </h2>
        <div className="grid max-w-2xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-ink">{t("Core material")}</p>
            <p className="text-ink/70">{m.frame}</p>
          </div>
          {m.upholstery && (
            <div>
              <p className="font-medium text-ink">{t("Finish")}</p>
              <p className="text-ink/70">{m.upholstery}</p>
            </div>
          )}
          {m.legs && (
            <div>
              <p className="font-medium text-ink">{t("Hardware")}</p>
              <p className="text-ink/70">{m.legs}</p>
            </div>
          )}
          {m.foamDensity && (
            <div>
              <p className="font-medium text-ink">{t("Additional spec")}</p>
              <p className="text-ink/70">{m.foamDensity}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {assembly.requiredByDefault && (
            <p className="text-sm text-ink/70">
              🔧 {t("Installation required — typically about {minutes} minutes.", {
                minutes: assembly.typicalMinutes,
              })}{" "}
              {assembly.installationAvailable &&
                t("Professional installation available for {fee}.", {
                  fee: formatPrice(assembly.installationFee),
                })}
            </p>
          )}
        </div>
      </section>

      <section id="delivery" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">
          {t("Delivery & installation")}
        </h2>
        <div className="max-w-md">
          <DeliveryEstimator delivery={delivery} />
        </div>
        <ul className="mt-6 max-w-md space-y-1.5 text-sm text-ink/70">
          <li>🔧 {t("Installation fee: {fee}", { fee: formatPrice(delivery.installationFee) })}</li>
          <li>
            🏢 {t("Carrying upstairs (no elevator): {fee} —", { fee: formatPrice(delivery.carryingFee) })}{" "}
            {delivery.carryingFeeNote}
          </li>
        </ul>
      </section>

      <section id="warranty" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">{t("Warranty")}</h2>
        <div className="max-w-md overflow-hidden rounded-xl border border-walnut-100">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-walnut-100">
              {warranty.tiers.map((tier, i) => (
                <tr key={tier.part} className={i % 2 === 0 ? "bg-walnut-50/50" : undefined}>
                  <td className="px-4 py-2.5 font-medium text-ink">{tier.part}</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">
                    {tier.years} {tier.years === 1 ? t("year") : t("years")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-md text-xs text-ink/50">
          <span className="font-medium text-ink/70">{t("Not covered:")} </span>
          {warranty.notCovered}
        </p>
      </section>

      <section id="returns" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">{t("Returns & exchanges")}</h2>
        <div className="max-w-2xl text-sm text-ink/70">
          <p className="font-medium text-ink">
            {t("{days}-day returns", { days: returns.periodDays })}
            {product.availability === "made_to_order" && t(" — with an exception for this item")}
          </p>
          {product.availability === "made_to_order" && (
            <p className="mt-1 text-danger-500">{returns.customExclusion}</p>
          )}
          <ul className="mt-3 space-y-1.5">
            {returns.conditions.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="text-terracotta-400">•</span>
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-medium text-ink">{t("Who pays return shipping?")}</p>
              <p>{returns.whoPaysReturn}</p>
            </div>
            <div>
              <p className="font-medium text-ink">{t("Refund process")}</p>
              <p>{returns.refundProcess}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="font-medium text-ink">{t("Item arrived damaged?")}</p>
              <p>{returns.damagedProcedure}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-2 text-sm font-medium text-ink">{t("Payment methods")}</p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="rounded-full border border-walnut-200 px-3 py-1.5 text-xs text-ink/70"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="room-fit" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-1 font-serif text-xl font-semibold text-ink">
          {t("Will it fit your space?")}
        </h2>
        <p className="mb-4 max-w-md text-sm text-ink/60">
          {t("A quick check before you buy — not a substitute for measuring twice.")}
        </p>
        <div className="max-w-md">
          <RoomFitCalculator dimensions={d} />
        </div>
      </section>

      <section id="reviews" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-6 font-serif text-xl font-semibold text-ink">{t("Reviews")}</h2>
        <div className="max-w-2xl">
          <ProductReviews productSlug={product.slug} reviews={reviews} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-10 border-t border-walnut-100 pt-10">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-ink">{t("You may also like")}</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {completeTheRoom.length > 0 && (
        <section className="mt-16 border-t border-walnut-100 pt-10">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-ink">{t("Complete the project")}</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {completeTheRoom.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
