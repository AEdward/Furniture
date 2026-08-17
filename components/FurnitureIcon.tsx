import type { IconName } from "@/lib/products";

const paths: Record<IconName, JSX.Element> = {
  "single-door": (
    <>
      <rect x="6" y="2" width="12" height="20" rx="1" />
      <circle cx="15.2" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <path d="M6 2v20" />
    </>
  ),
  "double-door": (
    <>
      <rect x="2.5" y="2" width="9" height="20" rx="1" />
      <rect x="12.5" y="2" width="9" height="20" rx="1" />
      <circle cx="10.3" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13.7" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  "sliding-door": (
    <>
      <path d="M3 3h14v18H3z" />
      <path d="M7 3h14v18H7z" />
      <path d="M9.5 21v2M9.5 1v2" />
      <path d="M17 12l3 0M18.3 10.5 20 12l-1.7 1.5" />
    </>
  ),
  "base-cabinet": (
    <>
      <path d="M3 6h18" />
      <rect x="3" y="6" width="18" height="13" rx="0.5" />
      <path d="M12 6v13" />
      <circle cx="10" cy="12.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="12.5" r="0.7" fill="currentColor" stroke="none" />
      <path d="M4 19v2M20 19v2" />
    </>
  ),
  "wall-cabinet": (
    <>
      <rect x="3" y="4" width="18" height="10" rx="0.5" />
      <path d="M12 4v10" />
      <circle cx="10" cy="9" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="9" r="0.7" fill="currentColor" stroke="none" />
      <path d="M5 14v3M19 14v3" />
    </>
  ),
  "kitchen-island": (
    <>
      <path d="M3 5h18" />
      <rect x="3" y="5" width="18" height="9" rx="0.5" />
      <path d="M6 14v5M18 14v5" />
      <path d="M7 8.5h4M7 11h4" />
      <path d="M14 8.5h4M14 11h4" />
    </>
  ),
  "pantry-cabinet": (
    <>
      <rect x="5" y="2" width="14" height="20" rx="1" />
      <circle cx="16.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <path d="M8 6h4M8 10h4M8 14h4M8 18h4" />
    </>
  ),
  wardrobe: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M12 3v18" />
      <path d="M9.5 11v1.5M14.5 11v1.5" />
    </>
  ),
  "sliding-wardrobe": (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 3v18M21 3v18" />
      <path d="M8 3v18M16 3v18" />
      <path d="M6.5 1.5h3M14.5 1.5h3" />
    </>
  ),
};

export default function FurnitureIcon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
