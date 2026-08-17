import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FurnitureIcon from "@/components/FurnitureIcon";
import ProductCard from "@/components/ProductCard";
import AddToCartPanel from "@/components/AddToCartPanel";
import StarRating from "@/components/StarRating";
import RoomFitCalculator from "@/components/RoomFitCalculator";
import DeliveryEstimator from "@/components/DeliveryEstimator";
import {
  getCompleteTheRoomProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/db";
import { availabilityMessage, formatPrice } from "@/lib/products";
import {
  assemblyPolicy,
  deliveryPolicy,
  paymentMethods,
  returnsPolicy,
  warrantyPolicy,
} from "@/lib/policies";

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
  { href: "#room-fit", label: "Room Fit" },
];

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const completeTheRoom = await getCompleteTheRoomProducts(product);
  const d = product.dimensions;
  const m = product.materials;

  const availabilityColor =
    product.availability === "in_stock"
      ? "text-walnut-600"
      : product.availability === "made_to_order"
        ? "text-terracotta-500"
        : "text-ink/40";

  return (
    <div className="container-shop py-12">
      <nav className="mb-6 text-sm text-ink/50">
        <Link href="/shop" className="hover:text-walnut-600">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-walnut-600"
        >
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div
          className={`flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br ${product.gradient}`}
        >
          <FurnitureIcon
            name={product.icon}
            className="h-40 w-40 text-walnut-500/70 sm:h-56 sm:w-56"
          />
        </div>

        <div className="flex flex-col">
          <p className="section-label">{product.category}</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            <span className="text-ink/30">·</span>
            <span className="font-mono text-xs text-ink/40">SKU {product.sku}</span>
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
            {availabilityMessage(product)}
          </p>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/70">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCartPanel product={product} />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-walnut-100 pt-6 text-xs text-ink/60 sm:grid-cols-4">
            <a href="#delivery" className="hover:text-walnut-600">
              🚚 {deliveryPolicy.addisAbaba.minDays}–{deliveryPolicy.addisAbaba.maxDays} days
            </a>
            <a href="#materials" className="hover:text-walnut-600">
              🔧 {assemblyPolicy.installationAvailable ? "Assembly available" : "No assembly"}
            </a>
            <a href="#warranty" className="hover:text-walnut-600">
              🛡️ {warrantyPolicy.tiers[0].years}-year warranty
            </a>
            <a href="#returns" className="hover:text-walnut-600">
              ↩️ {returnsPolicy.periodDays}-day returns
            </a>
          </div>
        </div>
      </div>

      <nav className="sticky top-[73px] z-30 mt-16 flex flex-wrap gap-x-6 gap-y-2 border-y border-walnut-100 bg-cream/95 py-3 text-sm text-ink/60 backdrop-blur">
        {sectionNav.map((s) => (
          <a key={s.href} href={s.href} className="hover:text-walnut-600">
            {s.label}
          </a>
        ))}
      </nav>

      <section id="description" className="scroll-mt-32 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Description</h2>
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
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Dimensions</h2>
        <div className="max-w-md overflow-hidden rounded-xl border border-walnut-100">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-walnut-100">
              <tr className="bg-walnut-50/50">
                <td className="px-4 py-2.5 font-medium text-ink">Width</td>
                <td className="px-4 py-2.5 text-right text-ink/70">{d.widthCm} cm</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-ink">Depth</td>
                <td className="px-4 py-2.5 text-right text-ink/70">{d.depthCm} cm</td>
              </tr>
              <tr className="bg-walnut-50/50">
                <td className="px-4 py-2.5 font-medium text-ink">Height</td>
                <td className="px-4 py-2.5 text-right text-ink/70">{d.heightCm} cm</td>
              </tr>
              {d.seatHeightCm !== undefined && (
                <tr>
                  <td className="px-4 py-2.5 font-medium text-ink">Seat height</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">{d.seatHeightCm} cm</td>
                </tr>
              )}
              {d.seatDepthCm !== undefined && (
                <tr className="bg-walnut-50/50">
                  <td className="px-4 py-2.5 font-medium text-ink">Seat depth</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">{d.seatDepthCm} cm</td>
                </tr>
              )}
              {d.armHeightCm !== undefined && (
                <tr>
                  <td className="px-4 py-2.5 font-medium text-ink">Arm height</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">{d.armHeightCm} cm</td>
                </tr>
              )}
              {d.legHeightCm !== undefined && (
                <tr className="bg-walnut-50/50">
                  <td className="px-4 py-2.5 font-medium text-ink">Leg height</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">{d.legHeightCm} cm</td>
                </tr>
              )}
              {d.weightKg !== undefined && (
                <tr>
                  <td className="px-4 py-2.5 font-medium text-ink">Weight</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">{d.weightKg} kg</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-md text-xs text-ink/40">
          Package dimensions may differ slightly from assembled size — contact us if you need
          exact packing measurements for a tight stairwell or elevator.
        </p>
      </section>

      <section id="materials" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">
          Materials &amp; construction
        </h2>
        <div className="grid max-w-2xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-ink">Frame</p>
            <p className="text-ink/70">{m.frame}</p>
          </div>
          {m.upholstery && (
            <div>
              <p className="font-medium text-ink">Upholstery</p>
              <p className="text-ink/70">{m.upholstery}</p>
            </div>
          )}
          {m.legs && (
            <div>
              <p className="font-medium text-ink">Legs</p>
              <p className="text-ink/70">{m.legs}</p>
            </div>
          )}
          {m.foamDensity && (
            <div>
              <p className="font-medium text-ink">Foam</p>
              <p className="text-ink/70">{m.foamDensity}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {assemblyPolicy.requiredByDefault && (
            <p className="text-sm text-ink/70">
              🔧 Assembly required — typically about {assemblyPolicy.typicalMinutes} minutes.{" "}
              {assemblyPolicy.installationAvailable &&
                `Professional installation available for ${formatPrice(assemblyPolicy.installationFee)}.`}
            </p>
          )}
        </div>
      </section>

      <section id="delivery" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">
          Delivery &amp; installation
        </h2>
        <div className="max-w-md">
          <DeliveryEstimator />
        </div>
        <ul className="mt-6 max-w-md space-y-1.5 text-sm text-ink/70">
          <li>🔧 Installation fee: {formatPrice(deliveryPolicy.installationFee)}</li>
          <li>
            🏢 Carrying upstairs (no elevator): {formatPrice(deliveryPolicy.carryingFee)} —{" "}
            {deliveryPolicy.carryingFeeNote}
          </li>
        </ul>
      </section>

      <section id="warranty" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Warranty</h2>
        <div className="max-w-md overflow-hidden rounded-xl border border-walnut-100">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-walnut-100">
              {warrantyPolicy.tiers.map((t, i) => (
                <tr key={t.part} className={i % 2 === 0 ? "bg-walnut-50/50" : undefined}>
                  <td className="px-4 py-2.5 font-medium text-ink">{t.part}</td>
                  <td className="px-4 py-2.5 text-right text-ink/70">
                    {t.years} {t.years === 1 ? "year" : "years"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-md text-xs text-ink/50">
          <span className="font-medium text-ink/70">Not covered: </span>
          {warrantyPolicy.notCovered}
        </p>
      </section>

      <section id="returns" className="scroll-mt-32 border-t border-walnut-100 py-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Returns &amp; exchanges</h2>
        <div className="max-w-2xl text-sm text-ink/70">
          <p className="font-medium text-ink">
            {returnsPolicy.periodDays}-day returns
            {product.availability === "made_to_order" && " — with an exception for this item"}
          </p>
          {product.availability === "made_to_order" && (
            <p className="mt-1 text-terracotta-500">{returnsPolicy.customExclusion}</p>
          )}
          <ul className="mt-3 space-y-1.5">
            {returnsPolicy.conditions.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="text-terracotta-400">•</span>
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-medium text-ink">Who pays return shipping?</p>
              <p>{returnsPolicy.whoPaysReturn}</p>
            </div>
            <div>
              <p className="font-medium text-ink">Refund process</p>
              <p>{returnsPolicy.refundProcess}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="font-medium text-ink">Item arrived damaged?</p>
              <p>{returnsPolicy.damagedProcedure}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-2 text-sm font-medium text-ink">Payment methods</p>
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
        <h2 className="mb-1 font-serif text-xl font-semibold text-ink">Will it fit your room?</h2>
        <p className="mb-4 max-w-md text-sm text-ink/60">
          A quick check before you buy — not a substitute for measuring twice.
        </p>
        <div className="max-w-md">
          <RoomFitCalculator dimensions={d} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-10 border-t border-walnut-100 pt-10">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-ink">You may also like</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {completeTheRoom.length > 0 && (
        <section className="mt-16 border-t border-walnut-100 pt-10">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-ink">Complete the room</h2>
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
