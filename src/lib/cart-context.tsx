"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type ProductCategory = "oil-teneke" | "oil-pet" | "zeplin";

export type ProductOption = {
  id: string;
  category: ProductCategory;
  label: string;
  sublabel: string;
  price: number;
  basePrice?: number; // İndirimsiz fiyat (tasarruf hesabı için)
  unit: string;
  popular?: boolean;
  badge?: string;
  image?: string; // /products/... yolu (public/products klasörü)
};

export const PRODUCTS: ProductOption[] = [
  // Zeytinyağı — Teneke
  { id: "5l-teneke", category: "oil-teneke", label: "5 Litre", sublabel: "Teneke", price: 2000, unit: "₺400 / litre", popular: true, image: "/products/5l-teneke.jpg" },
  { id: "2x5l-teneke", category: "oil-teneke", label: "2× 5 Litre", sublabel: "Teneke paket", price: 3800, basePrice: 4000, unit: "₺380 / litre", badge: "İndirim", image: "/products/5l-teneke.jpg" },
  { id: "4x5l-teneke", category: "oil-teneke", label: "4× 5 Litre", sublabel: "Teneke paket", price: 7000, basePrice: 8000, unit: "₺350 / litre", badge: "En avantajlı", image: "/products/5l-teneke.jpg" },

  // Zeytinyağı — Pet ve teneke seçenekleri birlikte gösterilir
  { id: "1l-pet", category: "oil-teneke", label: "1 Litre", sublabel: "Pet şişe", price: 500, unit: "₺500 / litre", image: "/products/1l-pet.jpg" },
  { id: "2l-pet", category: "oil-teneke", label: "2 Litre", sublabel: "Pet şişe", price: 900, basePrice: 1000, unit: "₺450 / litre", image: "/products/2l-pet.jpg" },

  // Sele Zeytin — Az tuzlu, iri boy, yağlı sele zeytini
  { id: "1l-sele", category: "zeplin", label: "1 kg", sublabel: "Az tuzlu · İri boy · Yağlı sele zeytini", price: 400, unit: "₺400 / kg", image: "/products/1kg-sele.jpg" },
  { id: "3l-sele", category: "zeplin", label: "3 kg", sublabel: "Az tuzlu · İri boy · Yağlı sele zeytini", price: 700, unit: "₺233 / kg", image: "/products/3l-sele.jpg" },
  { id: "5l-sele", category: "zeplin", label: "5 kg", sublabel: "Az tuzlu · İri boy · Yağlı sele zeytini", price: 1500, unit: "₺300 / kg", image: "/products/5l-sele.jpg" },
];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  "oil-teneke": "Zeytinyağı — Teneke ve Pet Şişe",
  "oil-pet": "Zeytinyağı — Pet Şişe",
  zeplin: "Sele Zeytin",
};

export type CartItem = {
  product: ProductOption;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: ProductOption, qty: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  total: number;
  count: number;
  selectedProduct: ProductOption;
  setSelectedProduct: (p: ProductOption) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption>(PRODUCTS[0]);

  const addItem = (product: ProductOption, qty: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { product, qty }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.product.id !== id));

  const updateQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i
      )
    );

  const clear = () => setItems([]);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        updateQty,
        clear,
        open,
        close,
        total,
        count,
        selectedProduct,
        setSelectedProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
