import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CartContext, type CartLine } from "./cart-context.ts";

const storageKey = "furniro-cart";

function readLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readLines);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    return {
      lines,
      count,
      add(slug: string, quantity = 1) {
        setLines((current) => {
          const existing = current.find((line) => line.slug === slug);
          if (!existing) return [...current, { slug, quantity }];
          return current.map((line) =>
            line.slug === slug
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          );
        });
      },
      setQuantity(slug: string, quantity: number) {
        setLines((current) =>
          quantity < 1
            ? current.filter((line) => line.slug !== slug)
            : current.map((line) =>
                line.slug === slug ? { ...line, quantity } : line,
              ),
        );
      },
      remove(slug: string) {
        setLines((current) => current.filter((line) => line.slug !== slug));
      },
      clear() {
        setLines([]);
      },
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
