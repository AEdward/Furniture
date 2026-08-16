import { siteConfig } from "@/lib/site-config";

// Placeholder logo mark. Swap the <span> block below for an <Image>
// once a real logo file is available — keep the same wrapper classes.
export default function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-dashed border-walnut-400 text-[11px] font-bold uppercase tracking-wider text-walnut-500">
        {siteConfig.shortName}
      </span>
      <span className="font-serif text-2xl font-semibold tracking-tight text-walnut-600">
        {siteConfig.name}
      </span>
    </span>
  );
}
