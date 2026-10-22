export type Order = {
  id: string;
  createdAt: string;
  total: number;
  items: { slug: string; name: string; quantity: number; price: number }[];
  status: "Processing" | "Delivered";
};

const storageKey = "furniro-orders";

export function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order) {
  const orders = readOrders();
  localStorage.setItem(storageKey, JSON.stringify([order, ...orders]));
}
