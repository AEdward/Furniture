"use client";

import { useT } from "@/lib/i18n/context";

function Star({ fill }: { fill: number }) {
  const id = `star-clip-${Math.round(fill * 100)}`;
  return (
    <svg viewBox="0 0 20 20" className="h-full w-full">
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={20 * fill} height="20" />
        </clipPath>
      </defs>
      <path
        d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        className="text-walnut-300"
      />
      <path
        d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5Z"
        fill="currentColor"
        clipPath={`url(#${id})`}
        className="text-terracotta-400"
      />
    </svg>
  );
}

export default function StarRating({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const t = useT();
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={starSize}>
            <Star fill={Math.max(0, Math.min(1, rating - i))} />
          </div>
        ))}
      </div>
      <span className="text-sm text-ink/60">
        {rating.toFixed(1)}
        {reviewCount !== undefined && ` (${t("{count} reviews", { count: reviewCount })})`}
      </span>
    </div>
  );
}
