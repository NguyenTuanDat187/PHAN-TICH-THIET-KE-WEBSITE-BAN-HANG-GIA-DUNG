import { createContext } from "react";

export type CartLine = {
  slug: string;
  quantity: number;
};

export type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);
