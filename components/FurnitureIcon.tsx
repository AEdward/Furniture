import type { IconName } from "@/lib/products";

const paths: Record<IconName, JSX.Element> = {
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
  sofa: (
    <>
      <rect x="2" y="7" width="20" height="9" rx="2" />
      <rect x="0.8" y="12" width="3.2" height="7" rx="1" />
      <rect x="20" y="12" width="3.2" height="7" rx="1" />
      <path d="M2 16h20" />
      <path d="M5 21v1M19 21v1" />
    </>
  ),
  "sectional-sofa": (
    <>
      <rect x="2" y="7" width="14" height="9" rx="2" />
      <rect x="0.8" y="12" width="3.2" height="7" rx="1" />
      <rect x="14" y="10" width="8" height="11" rx="2" />
      <path d="M2 16h14" />
      <path d="M5 21v1M19 21v1" />
    </>
  ),
  "dining-table": (
    <>
      <rect x="2" y="5" width="20" height="3" rx="0.5" />
      <path d="M4 8v11M20 8v11" />
      <path d="M7 8v8M17 8v8" />
    </>
  ),
  "dining-chair": (
    <>
      <rect x="6" y="3" width="12" height="9" rx="1" />
      <path d="M6 12h12v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3" />
      <path d="M7 16v5M17 16v5" />
    </>
  ),
  bed: (
    <>
      <rect x="2" y="9" width="20" height="8" rx="1" />
      <rect x="2" y="4" width="4" height="13" rx="1" />
      <path d="M2 13h20" />
      <path d="M4 17v3M20 17v3" />
    </>
  ),
  "center-table": (
    <>
      <rect x="2" y="9" width="20" height="2.2" rx="1" />
      <rect x="5" y="15" width="14" height="1.6" rx="0.6" />
      <path d="M4.5 11.2v9M19.5 11.2v9" />
    </>
  ),
  "tv-stand": (
    <>
      <rect x="1.5" y="9" width="21" height="7" rx="1" />
      <path d="M8 9v7M16 9v7" />
      <circle cx="4.5" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="19.5" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M4 16v2.5M20 16v2.5" />
    </>
  ),
  "wall-drawer": (
    <>
      <rect x="2" y="6" width="20" height="6" rx="1" />
      <path d="M2 9h20" />
      <circle cx="7" cy="9" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="17" cy="9" r="0.6" fill="currentColor" stroke="none" />
      <path d="M9 2.5h6" />
    </>
  ),
  nightstand: (
    <>
      <rect x="5" y="3" width="14" height="16" rx="1" />
      <path d="M5 8h14M5 13h14" />
      <circle cx="12" cy="5.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M7 19v2M17 19v2" />
    </>
  ),
  "office-desk": (
    <>
      <rect x="2" y="6" width="20" height="2.2" rx="0.5" />
      <path d="M4 8.2v11M20 8.2v11" />
      <rect x="14.5" y="8.2" width="5.5" height="6" rx="0.5" />
      <circle cx="17" cy="10.5" r="0.5" fill="currentColor" stroke="none" />
    </>
  ),
  "office-chair": (
    <>
      <rect x="6" y="2" width="12" height="9" rx="1.5" />
      <rect x="7" y="12" width="10" height="3.2" rx="1" />
      <path d="M12 15.2v4" />
      <path d="M8 22l4-2.8 4 2.8" />
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
