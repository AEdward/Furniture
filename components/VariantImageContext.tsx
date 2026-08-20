"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Lets AddToCartPanel (which owns the selected color/material/wood) and
// ProductGallery (which owns the displayed image) — two sibling client
// components under the same server-rendered product page — share which
// image to show when a variant has one, without threading the state
// through the server component in between. No-ops gracefully if used
// outside a provider, so neither component hard-depends on the other
// existing on the page.
type Ctx = { variantImageUrl: string | null; setVariantImageUrl: (url: string | null) => void };

const VariantImageContext = createContext<Ctx>({
  variantImageUrl: null,
  setVariantImageUrl: () => {},
});

export function VariantImageProvider({ children }: { children: ReactNode }) {
  const [variantImageUrl, setVariantImageUrl] = useState<string | null>(null);
  return (
    <VariantImageContext.Provider value={{ variantImageUrl, setVariantImageUrl }}>
      {children}
    </VariantImageContext.Provider>
  );
}

export function useVariantImage() {
  return useContext(VariantImageContext);
}
