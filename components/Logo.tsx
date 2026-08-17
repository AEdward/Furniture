import Image from "next/image";

export default function Logo({
  className,
  variant = "horizontal",
  name = "Zemenay Furniture",
}: {
  className?: string;
  variant?: "horizontal" | "stacked";
  name?: string;
}) {
  if (variant === "stacked") {
    return (
      <span className={`inline-flex items-center justify-center ${className ?? ""}`}>
        <Image
          src="/brand/zemenay-logo-full-transparent.png"
          alt={name}
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
        {name.replace(" Furniture", "")}
      </span>
    </span>
  );
}
