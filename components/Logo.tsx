// Golden Wood Furniture wordmark, per the brand style guide v1.0: a
// gold foil gradient (Foil Gold -> Antique Gold -> Deep Bronze) on
// Anton display type, with an italic Cormorant Garamond "Furniture"
// subline and a double underline beneath it. Built as text/CSS rather
// than a raster image — crisp at any size, and doesn't depend on a
// logo file being uploaded.
const GOLD_GRADIENT = "bg-gradient-to-r from-terracotta-200 via-terracotta-400 to-terracotta-600 bg-clip-text text-transparent";

function Mark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-terracotta-400/60 ${
        light ? "bg-white/10 backdrop-blur-sm" : "bg-walnut-500"
      } ${className ?? "h-9 w-9"}`}
    >
      <span className={`font-serif text-sm tracking-tight ${GOLD_GRADIENT}`}>GW</span>
    </span>
  );
}

export default function Logo({
  className,
  variant = "horizontal",
  name = "Golden Wood Furniture",
  light = false,
}: {
  className?: string;
  variant?: "horizontal" | "stacked";
  name?: string;
  // For use over a dark hero image (transparent header) — lightens
  // the mark's background so it doesn't blend into the photo.
  light?: boolean;
}) {
  const wordmark = name.replace(" Furniture", "").toUpperCase();

  if (variant === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center ${className ?? ""}`}>
        <Mark className="h-12 w-12 rounded-xl" light={light} />
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
      <Mark light={light} />
      <span className={`font-serif text-xl tracking-tight ${GOLD_GRADIENT}`}>
        {wordmark}
      </span>
    </span>
  );
}
