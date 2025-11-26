import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

export type Meal = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  spicy?: boolean;
  available: boolean;
};

export type Order = {
  id: string;
  items: Meal[];
  total: number;
  createdAt: string;
};

type CartContextType = {
  cartItems: Meal[];
  totalItems: number;
  addToCart: (meal: Meal) => void;
  removeFromCart: (mealId: string) => void;
  clearCart: () => void;
  orders: Order[];
  placeOrder: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<Meal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (meal: Meal) => {
    setCartItems((prev) => [...prev, meal]);
  };

  const removeFromCart = (mealId: string) => {
    setCartItems((prev) => prev.filter((m) => m.id !== mealId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.length;

  const placeOrder = () => {
    if (cartItems.length === 0) return;

    const total = cartItems.reduce((sum, m) => sum + m.price, 0);

    const newOrder: Order = {
      id: Date.now().toString(),
      items: cartItems,
      total,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
  };

  const value = useMemo(
    () => ({
      cartItems,
      totalItems,
      addToCart,
      removeFromCart,
      clearCart,
      orders,
      placeOrder,
    }),
    [cartItems, totalItems, orders]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
};
