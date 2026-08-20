import Image from "next/image";

// Golden Wood Furniture wordmark: the real icon artwork
// (public/brand/golden-wood-icon.png) as the mark, paired with a gold
// foil gradient (Foil Gold -> Antique Gold -> Deep Bronze) Anton
// wordmark and an italic Cormorant Garamond "Furniture" subline, per
// the brand style guide v1.0.
const GOLD_GRADIENT = "bg-gradient-to-r from-terracotta-200 via-terracotta-400 to-terracotta-600 bg-clip-text text-transparent";

function Mark({ className }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-lg ${className ?? "h-9 w-9"}`}>
      <Image src="/brand/golden-wood-icon.png" alt="" fill sizes="48px" className="object-cover" priority />
    </span>
  );
}

export default function Logo({
  className,
  variant = "horizontal",
  name = "Golden Wood Furniture",
}: {
  className?: string;
  variant?: "horizontal" | "stacked";
  name?: string;
  // Kept for callers that still pass it (e.g. the transparent header
  // over the hero image) — the real icon artwork reads fine on both
  // light and dark backgrounds, so it's a no-op now.
  light?: boolean;
}) {
  const wordmark = name.replace(" Furniture", "").toUpperCase();

  if (variant === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center ${className ?? ""}`}>
        <Mark className="h-16 w-16 rounded-xl" />
        <span className={`mt-3 font-serif text-3xl tracking-tight ${GOLD_GRADIENT}`}>
          {wordmark}
        </span>
        <span className="mt-1 font-accent text-sm italic uppercase tracking-[0.35em] text-walnut-300">
          Furniture
        </span>
        <span className="mt-2 flex flex-col gap-0.5">
          <span className="h-px w-16 bg-gradient-to-r from-transparent via-terracotta-400 to-transparent" />
          <span className="h-px w-16 bg-gradient-to-r from-transparent via-terracotta-400 to-transparent" />
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Mark />
      <span className={`font-serif text-xl tracking-tight ${GOLD_GRADIENT}`}>
        {wordmark}
      </span>
    </span>
  );
}
