import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  weight_grams?: number;
  package_width_cm?: number;
  package_height_cm?: number;
  package_depth_cm?: number;
};

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (i: Omit<CartItem, "quantity">) => void;
  setQty: (id: string, q: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};
const CartContext = createContext<Ctx | null>(null);
const KEY = "sunshine-moon-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      add: (i) =>
        setItems((prev) => {
          const f = prev.find((p) => p.product_id === i.product_id);
          return f
            ? prev.map((p) => (p.product_id === i.product_id ? { ...p, quantity: p.quantity + 1 } : p))
            : [...prev, { ...i, quantity: 1 }];
        }),
      setQty: (id, q) =>
        setItems((prev) =>
          q <= 0 ? prev.filter((p) => p.product_id !== id) : prev.map((p) => (p.product_id === id ? { ...p, quantity: q } : p)),
        ),
      clear: () => setItems([]),
      open,
      setOpen,
    }),
    [items, open],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
