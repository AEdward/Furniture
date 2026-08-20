"use client";

import { useState } from "react";
import Image from "next/image";
import FurnitureIcon from "@/components/FurnitureIcon";
import type { IconName } from "@/lib/products";
import { useVariantImage } from "@/components/VariantImageContext";

export default function ProductGallery({
  images,
  name,
  icon,
  gradient,
}: {
  images: string[];
  name: string;
  icon: IconName;
  gradient: string;
}) {
  const [active, setActive] = useState(0);
  const { variantImageUrl, setVariantImageUrl } = useVariantImage();
  // A selected color/material/wood option with its own photo takes over
  // the hero image until the shopper picks a thumbnail themselves.
  const activeImage = variantImageUrl ?? images[active];

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient}`}
      >
        {activeImage ? (
          <Image
            src={activeImage}
            alt={name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <FurnitureIcon name={icon} className="h-40 w-40 text-walnut-500/70 sm:h-56 sm:w-56" />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => {
                setActive(i);
                setVariantImageUrl(null);
              }}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? "border-walnut-500" : "border-transparent hover:border-walnut-200"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
