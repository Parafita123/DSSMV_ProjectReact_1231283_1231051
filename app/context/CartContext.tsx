import React, { createContext, useContext, useMemo, useReducer, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useAdmin } from "./AdminContext";

export type Meal = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  spicy?: boolean;
  available: boolean;
  stock?: number;
  promo?: { discountPercent: number; startAt: string; endAt: string } | null;
};

export type Order = {
  id: string;
  items: Meal[];
  total: number;
  createdAt: string;
  clientEmail: string;
};

type CartState = {
  cartItems: Meal[];
  orders: Order[];
};

type StateByUser = Record<string, CartState>;

type CartAction =
  | { type: "ADD_TO_CART"; payload: { key: string; meal: Meal } }
  | { type: "REMOVE_ONE_FROM_CART"; payload: { key: string; mealId: string } }
  | { type: "CLEAR_CART"; payload: { key: string } }
  | { type: "PLACE_ORDER"; payload: { key: string; order: Order } };

type CartContextType = {
  cartItems: Meal[];
  totalItems: number;
  addToCart: (meal: Meal) => void;
  removeFromCart: (mealId: string) => void; // remove 1 ocorrência
  clearCart: () => void;
  orders: Order[];
  placeOrder: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const globalOrders: Order[] = [];
export const getAllOrders = (): Order[] => [...globalOrders];

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

const initialStateByUser: StateByUser = {
  "cheio@gmail.com": {
    cartItems: [SAMPLE_MEALS[0]],
    orders: [
      {
        id: "MOCK-001",
        items: [SAMPLE_MEALS[0], SAMPLE_MEALS[1]],
        total: SAMPLE_MEALS[0].price + SAMPLE_MEALS[1].price,
        createdAt: new Date().toISOString(),
        clientEmail: "cheio@gmail.com",
      },
    ],
  },
  "vazio@gmail.com": {
    cartItems: [],
    orders: [],
  },
};

Object.values(initialStateByUser).forEach((s) => s.orders.forEach((o) => globalOrders.push(o)));

function cartReducer(state: StateByUser, action: CartAction): StateByUser {
  const key = action.payload.key;
  const current = state[key] || { cartItems: [], orders: [] };

  switch (action.type) {
    case "ADD_TO_CART": {
      return {
        ...state,
        [key]: { ...current, cartItems: [...current.cartItems, action.payload.meal] },
      };
    }

    case "REMOVE_ONE_FROM_CART": {
      const idx = current.cartItems.findIndex((m) => m.id === action.payload.mealId);
      if (idx === -1) return state;

      const updated = [...current.cartItems];
      updated.splice(idx, 1);

      return { ...state, [key]: { ...current, cartItems: updated } };
    }

    case "CLEAR_CART":
      return { ...state, [key]: { ...current, cartItems: [] } };

    case "PLACE_ORDER":
      return {
        ...state,
        [key]: {
          cartItems: [],
          orders: [action.payload.order, ...current.orders],
        },
      };

    default:
      return state;
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { updateStock } = useAdmin();

  const [stateByUser, dispatch] = useReducer(cartReducer, initialStateByUser);

  const activeKey = user?.email ?? "__guest__";
  const activeState = stateByUser[activeKey] || { cartItems: [], orders: [] };

  const addToCart = (meal: Meal) => {
    dispatch({ type: "ADD_TO_CART", payload: { key: activeKey, meal } });
  };

  const removeFromCart = (mealId: string) => {
    dispatch({ type: "REMOVE_ONE_FROM_CART", payload: { key: activeKey, mealId } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART", payload: { key: activeKey } });
  };

  const placeOrder = () => {
    if (activeState.cartItems.length === 0) return;

    // Side-effect 1: atualizar stock no admin (fora do reducer)
    activeState.cartItems.forEach((meal) => {
      if (meal.id) updateStock(meal.id, -1);
    });

    const total = activeState.cartItems.reduce((sum, m) => sum + m.price, 0);
    const clientEmail = user?.email ?? "__guest__";

    const newOrder: Order = {
      id: Date.now().toString(),
      items: activeState.cartItems,
      total,
      createdAt: new Date().toISOString(),
      clientEmail,
    };

    // Side-effect 2: lista global para faturação/admin
    globalOrders.unshift(newOrder);

    dispatch({ type: "PLACE_ORDER", payload: { key: activeKey, order: newOrder } });
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

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de um CartProvider");
  return ctx;
};
  