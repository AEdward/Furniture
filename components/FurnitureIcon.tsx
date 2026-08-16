import type { IconName } from "@/lib/products";

const paths: Record<IconName, JSX.Element> = {
  sofa: (
    <>
      <path d="M6 13v6a2 2 0 0 0 2 2h1v-3h6v3h1a2 2 0 0 0 2-2v-6" />
      <path d="M4 13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H4v-3Z" />
      <path d="M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
      <path d="M4 16H2v-2a1 1 0 0 1 1-1h1" />
      <path d="M20 16h2v-2a1 1 0 0 0-1-1h-1" />
    </>
  ),
  armchair: (
    <>
      <path d="M7 12V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
      <path d="M5 12a2 2 0 0 0-2 2v3h2M19 12a2 2 0 0 1 2 2v3h-2" />
      <path d="M5 17v3a1 1 0 0 0 1 1h1v-2h10v2h1a1 1 0 0 0 1-1v-3" />
      <path d="M5 17h14v-3a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3Z" />
    </>
  ),
  "coffee-table": (
    <>
      <rect x="3" y="8" width="18" height="3" rx="0.5" />
      <path d="M5 11v8M19 11v8M9 11v6M15 11v6" />
    </>
  ),
  "dining-table": (
    <>
      <rect x="2" y="7" width="20" height="2.5" rx="0.5" />
      <path d="M4.5 9.5 3 20M19.5 9.5 21 20M9 9.5v6M15 9.5v6" />
    </>
  ),
  "dining-chair": (
    <>
      <path d="M6 3h12l-1.2 8H7.2L6 3Z" />
      <path d="M7 11v4h10v-4" />
      <path d="M8 15 6.5 21M16 15l1.5 6" />
    </>
  ),
  bed: (
    <>
      <path d="M3 21v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 18h18" />
      <path d="M5 12V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
      <path d="M13 9V7a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5" />
      <path d="M3 21v1.5M21 21v1.5" />
    </>
  ),
  nightstand: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M5 11h14M9 7.5h2M9 14.5h2" />
    </>
  ),
  wardrobe: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M12 3v18" />
      <path d="M9.5 11v1.5M14.5 11v1.5" />
    </>
  ),
  desk: (
    <>
      <path d="M3 8h18v2.5H3z" />
      <path d="M5 10.5V20M19 10.5V20" />
      <rect x="14" y="10.5" width="5" height="6" rx="0.5" />
    </>
  ),
  "office-chair": (
    <>
      <rect x="7" y="4" width="10" height="7" rx="1.5" />
      <path d="M8 11v3h8v-3" />
      <path d="M12 14v4" />
      <path d="M12 18l-5 3M12 18l5 3M12 18l-6-1M12 18l6-1" />
    </>
  ),
  bookshelf: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M4 8h16M4 13h16M4 18h16" />
    </>
  ),
  "outdoor-chair": (
    <>
      <path d="M6 4h9l-1 8H7L6 4Z" />
      <path d="M7 12v3h7v-3" />
      <path d="M8 15 6 21M13 15l2 6" />
      <path d="M6 4 4 6M15 4l2 2" />
    </>
  ),
  "outdoor-table": (
    <>
      <circle cx="12" cy="9" r="8" transform="scale(1,0.28) translate(0,-2)" />
      <ellipse cx="12" cy="8" rx="9" ry="2.5" />
      <path d="M6 9v9M18 9v9" />
    </>
  ),
  lamp: (
    <>
      <path d="M8 3h8l3 7H5l3-7Z" />
      <path d="M12 10v9" />
      <path d="M7 21h10" />
    </>
  ),
  bench: (
    <>
      <rect x="3" y="9" width="18" height="2.5" rx="0.5" />
      <path d="M5.5 11.5 4 20M18.5 11.5 20 20" />
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
