import { siteConfig } from "@/lib/site-config";

// Placeholder logo mark styled after the real Zemenay logo (bold Z
// monogram, wide-tracked serif wordmark, charcoal + gold). Swap the
// <span> mark below for a real <Image> once the logo file is available.
export default function Logo({
  className,
  variant = "horizontal",
}: {
  className?: string;
  variant?: "horizontal" | "stacked";
}) {
  const mark = (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border-2 border-dashed border-terracotta-400 bg-ink font-serif text-lg font-bold text-terracotta-300">
      {siteConfig.shortName}
    </span>
  );

  const wordmark = (
    <span className="font-serif font-semibold uppercase tracking-[0.15em] text-ink">
      {siteConfig.name.replace(" Furniture", "")}
    </span>
  );

  if (variant === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-3 ${className ?? ""}`}>
        <span className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-terracotta-400 bg-ink font-serif text-3xl font-bold text-terracotta-300">
          {siteConfig.shortName}
        </span>
        <span className="text-center">
          <span className="block font-serif text-2xl font-semibold uppercase tracking-[0.15em] text-ink">
            {siteConfig.name.replace(" Furniture", "")}
          </span>
          <span className="mt-1 block text-xs font-medium uppercase tracking-[0.3em] text-ink/50">
            Furniture
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      {mark}
      {wordmark}
    </span>
  );
}
