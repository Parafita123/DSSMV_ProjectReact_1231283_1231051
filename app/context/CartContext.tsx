import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

export type Meal = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  spicy?: boolean;
  available: boolean;
  // How many units are currently in stock. When 0 the meal should be marked unavailable.
  stock?: number;
  // Optional promotion applied to the meal. If present and the current date is between
  // startAt and endAt then the price displayed to the client should reflect the discount.
  promo?: { discountPercent: number; startAt: string; endAt: string } | null;
};

export type Order = {
  id: string;
  items: Meal[];
  total: number;
  createdAt: string;
  /**
   * Email of the client that placed this order. Useful for admin views.
   */
  clientEmail: string;
};

type CartState = {
  cartItems: Meal[];
  orders: Order[];
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

// Keep a flat list of all orders placed across all users. When the app starts, we seed
// this list with the mock orders defined in the initial state. When new orders are
// placed via `placeOrder()`, they will be added to this list. Admin screens rely on
// this to calculate billing across the entire application.
const globalOrders: Order[] = [];

/**
 * Expose a helper to retrieve all orders. It returns a shallow copy so that
 * consumers cannot mutate the original array.
 */
export const getAllOrders = (): Order[] => {
  return [...globalOrders];
};

// 🔹 refeições de exemplo para o mock
const SAMPLE_MEALS: Meal[] = [
  {
    id: "1",
    name: "Frango Piri-Piri Pós-Galo",
    description: "Frango assado no carvão com molho picante da casa.",
    price: 9.5,
    category: "Especialidade da Casa",
    spicy: true,
    available: true,
  },
  {
    id: "2",
    name: "Hambúrguer do Galo",
    description: "Hambúrguer de frango crocante com queijo e molho especial.",
    price: 8.0,
    category: "Hambúrgueres",
    available: true,
  },
];

// 🔹 estado inicial por utilizador
const initialStateByUser: Record<string, CartState> = {
  "cliente.cheio@comidaposgalos.pt": {
    cartItems: [SAMPLE_MEALS[0]], // 1 refeição no carrinho
    orders: [
      {
        id: "MOCK-001",
        items: [SAMPLE_MEALS[0], SAMPLE_MEALS[1]],
        total: SAMPLE_MEALS[0].price + SAMPLE_MEALS[1].price,
        createdAt: new Date().toISOString(),
        clientEmail: "cliente.cheio@comidaposgalos.pt",
      },
    ],
  },
  "cliente.vazio@comidaposgalos.pt": {
    cartItems: [],
    orders: [],
  },
};

// Seed globalOrders with the orders from the initial state
Object.values(initialStateByUser).forEach((state) => {
  state.orders.forEach((order) => {
    globalOrders.push(order);
  });
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [stateByUser, setStateByUser] = useState<Record<string, CartState>>(
    initialStateByUser
  );

  const activeKey = user?.email ?? "__guest__";

  const activeState: CartState =
    stateByUser[activeKey] || { cartItems: [], orders: [] };

  const setActiveState = (updater: (current: CartState) => CartState) => {
    setStateByUser((prev) => {
      const current = prev[activeKey] || { cartItems: [], orders: [] };
      const updated = updater(current);
      return { ...prev, [activeKey]: updated };
    });
  };

  const addToCart = (meal: Meal) => {
    setActiveState((current) => ({
      ...current,
      cartItems: [...current.cartItems, meal],
    }));
  };

  const removeFromCart = (mealId: string) => {
  setActiveState((current) => {
    const index = current.cartItems.findIndex((m) => m.id === mealId);
    if (index === -1) return current;

    const updated = [...current.cartItems];
    updated.splice(index, 1); // remove só 1 ocorrência

    return {
      ...current,
      cartItems: updated,
    };
  });
};

  const clearCart = () => {
    setActiveState((current) => ({
      ...current,
      cartItems: [],
    }));
  };

  const placeOrder = () => {
    setActiveState((current) => {
      if (current.cartItems.length === 0) return current;

      const total = current.cartItems.reduce((sum, m) => sum + m.price, 0);
      // assign the order to the current user if present; otherwise mark as guest
      const clientEmail = user?.email ?? "__guest__";
      const newOrder: Order = {
        id: Date.now().toString(),
        items: current.cartItems,
        total,
        createdAt: new Date().toISOString(),
        clientEmail,
      };

      // Add to global list so that admin screens can access it
      globalOrders.unshift(newOrder);

      return {
        cartItems: [],
        orders: [newOrder, ...current.orders],
      };
    });
  };

  const value = useMemo(
    () => ({
      cartItems: activeState.cartItems,
      totalItems: activeState.cartItems.length,
      addToCart,
      removeFromCart,
      clearCart,
      orders: activeState.orders,
      placeOrder,
    }),
    [activeState]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return ctx;
};
