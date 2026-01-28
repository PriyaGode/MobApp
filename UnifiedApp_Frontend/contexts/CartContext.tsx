import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { ProductInfo } from "../screens/productData";

export type CartItem = {
  id: string;
  name: string;
  unit: string;
  priceLabel: string;
  priceValue: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: ProductInfo, quantity?: number) => void;
  adjustQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totals: {
    subtotal: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
  };
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: ProductInfo, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          unit: product.unit,
          priceLabel: product.price,
          priceValue: product.priceValue,
          image: product.cardImage,
          quantity,
        },
      ];
    });
  };

  const adjustQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      // Update quantity; if it drops to 0 or below, remove the item entirely
      return prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = parseFloat(
      items
        .reduce((sum, item) => sum + item.priceValue * item.quantity, 0)
        .toFixed(2)
    );
    const shipping = items.length ? 5 : 0;
    const taxes = items.length
      ? parseFloat((subtotal * 0.05).toFixed(2))
      : 0;
    const grandTotal = parseFloat((subtotal + shipping + taxes).toFixed(2));
    return { subtotal, shipping, taxes, grandTotal };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, adjustQuantity, clearCart, totals }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
