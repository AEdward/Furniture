import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export default function Logo({
  className,
  variant = "horizontal",
}: {
  className?: string;
  variant?: "horizontal" | "stacked";
}) {
  if (variant === "stacked") {
    return (
      <span className={`inline-flex items-center justify-center ${className ?? ""}`}>
        <Image
          src="/brand/zemenay-logo-full-transparent.png"
          alt={siteConfig.name}
          width={645}
          height={452}
          priority
          className="h-32 w-auto"
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Image
        src="/brand/zemenay-mark-transparent.png"
        alt=""
        width={352}
        height={352}
        priority
        className="h-9 w-9"
      />
      <span className="font-serif text-2xl font-semibold uppercase tracking-[0.15em] text-ink">
        {siteConfig.shortName === "Z" ? "Zemenay" : siteConfig.name}
      </span>
    </span>
  );
}
