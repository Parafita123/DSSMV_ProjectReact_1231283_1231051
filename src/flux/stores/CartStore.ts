// src/flux/stores/CartStore.ts
import { BaseStore } from "./BaseStore";
import { Dispatcher } from "../dispatcher/Dispatcher";
import type { Meal, Order } from "../types/cart.types";

// ✅ Fonte de verdade: estado da store
export const getAllOrders = () => [...CartStore.getState().orders];

export type CartState = {
  items: Meal[];
  orders: Order[];
  loading: boolean;
  error: string | null;
};

export class CartStoreClass extends BaseStore {
  private state: CartState = {
    items: [],
    orders: [],
    loading: false,
    error: null,
  };

  constructor() {
    super();
    Dispatcher.register(this.onDispatch.bind(this));
  }

  public getState(): CartState {
    return this.state;
  }

  private setState(next: Partial<CartState>) {
    this.state = { ...this.state, ...next };
    this.emitChange();
  }

  public getTotalItems(): number {
    return this.state.items.length;
  }

  public getTotalPrice(): number {
    return this.state.items.reduce((sum, m) => sum + (m.price ?? 0), 0);
  }

  private onDispatch(action: any) {
    switch (action.type) {
      case "CART/SET_LOADING":
        this.setState({ loading: !!action.payload?.loading });
        return;

      case "CART/SET_ERROR":
        this.setState({ error: action.payload?.error ?? null });
        return;

      case "CART/ADD_ITEM": {
        const meal: Meal | undefined = action.payload?.meal;
        if (!meal) return;
        this.setState({ items: [...this.state.items, meal], error: null });
        return;
      }

      case "CART/REMOVE_ITEM": {
        const index: number | undefined = action.payload?.index;
        if (typeof index !== "number") return;

        const copy = [...this.state.items];
        if (index < 0 || index >= copy.length) return;

        copy.splice(index, 1);
        this.setState({ items: copy, error: null });
        return;
      }

      case "CART/CLEAR":
        this.setState({ items: [], error: null });
        return;

      // ✅ usado para “hidratar” orders (por ex: carregadas no arranque)
      case "CART/SET_ORDERS": {
        const orders: Order[] = action.payload?.orders ?? [];
        this.setState({ orders, error: null });
        return;
      }

      case "CART/ADD_ORDER": {
        const order: Order | undefined = action.payload?.order;
        if (!order) return;

        // ✅ ordem mais recente primeiro + limpa carrinho
        this.setState({
          orders: [order, ...this.state.orders],
          items: [],
          error: null,
        });
        return;
      }

      default:
        return;
    }
  }
}

export const CartStore = new CartStoreClass();
