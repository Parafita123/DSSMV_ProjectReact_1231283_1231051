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

export type CartState = {
  cartItems: Meal[];
  orders: Order[];
};

export type CartStateByUser = Record<string, CartState>;
