"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/products";

export type CartLine = {
  slug: string;
  variant?: string;
  name: string;
  price: number;
  icon: Product["icon"];
  gradient: string;
  quantity: number;
};

function lineKey(slug: string, variant?: string): string {
  return variant ? `${slug}::${variant}` : slug;
}

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number, variant?: string) => void;
  removeItem: (slug: string, variant?: string) => void;
  updateQuantity: (slug: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  isReady: boolean;
  // Identifies "this browser's current checkout attempt" so a retry
  // after a failed/abandoned payment updates the same draft order
  // server-side instead of creating a new one. Persists indefinitely —
  // it doesn't need to rotate, since the server only ever reuses an
  // order that's still 'pending' (see createOrder in lib/db.ts).
  cartSessionId: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "furniture-shop-cart";
const SESSION_STORAGE_KEY = "furniture-shop-cart-session-id";

function readOrCreateCartSessionId(): string {
  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `cs-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage unavailable (private browsing, etc.) — checkout still
    // works, it just can't dedupe retries into the same draft order.
    return "";
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [cartSessionId, setCartSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    } finally {
      setCartSessionId(readOrCreateCartSessionId() || null);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, isReady]);

  const addItem = useCallback((product: Product, quantity = 1, variant?: string) => {
    setLines((prev) => {
      const key = lineKey(product.slug, variant);
      const existing = prev.find((l) => lineKey(l.slug, l.variant) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l.slug, l.variant) === key
            ? { ...l, quantity: l.quantity + quantity }
            : l
        );
      }
      return [
        ...prev,
        {
          slug: product.slug,
          variant,
          name: product.name,
          price: product.price,
          icon: product.icon,
          gradient: product.gradient,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((slug: string, variant?: string) => {
    const key = lineKey(slug, variant);
    setLines((prev) => prev.filter((l) => lineKey(l.slug, l.variant) !== key));
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number, variant?: string) => {
    const key = lineKey(slug, variant);
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => lineKey(l.slug, l.variant) !== key)
        : prev.map((l) => (lineKey(l.slug, l.variant) === key ? { ...l, quantity } : l))
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity * l.price, 0),
    [lines]
  );

  const value: CartContextValue = {
    lines,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isReady,
    cartSessionId,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
