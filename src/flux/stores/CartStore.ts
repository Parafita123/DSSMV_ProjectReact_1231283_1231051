

import { BaseStore } from "./BaseStore";
import { Dispatcher } from "../dispatcher/Dispatcher";
import { CartActionTypes } from "../actions/cart.action";
import type { CartStateByUser, CartState, Meal, Order } from "../types/cart.types";
import { AuthStore } from "./AuthStore";
import { AdminStore } from "./AdminStore";

const DEFAULT_STATE: CartState = { cartItems: [], orders: [] };

const globalOrders: Order[] = [];
export const getAllOrders = () => [...globalOrders];

export class CartStoreClass extends BaseStore {
  private stateByUser: CartStateByUser = {};

  constructor() {
    super();

    Dispatcher.register(this.onDispatch.bind(this));
  }

  private getActiveKey() {
    return AuthStore.getCurrentUser()?.email ?? "__guest__";
  }

  public getState(): CartState {
    const key = this.getActiveKey();
    return this.stateByUser[key] ?? DEFAULT_STATE;
  }

  public getOrders(): Order[] {
    return this.getState().orders;
  }

  public getCartItems(): Meal[] {
    return this.getState().cartItems;
  }

  public getTotalItems(): number {
    return this.getState().cartItems.length;
  }

  private setForKey(key: string, next: CartState) {
    this.stateByUser = { ...this.stateByUser, [key]: next };
    this.emitChange();
  }

  private onDispatch(action: any) {
    const key = this.getActiveKey();
    const current = this.stateByUser[key] ?? DEFAULT_STATE;

    switch (action.type) {
      case CartActionTypes.ADD_TO_CART: {
        const meal: Meal = action.payload.meal;
        this.setForKey(key, { ...current, cartItems: [...current.cartItems, meal] });
        return;
      }

      case CartActionTypes.REMOVE_ONE_FROM_CART: {
        const mealId: string = action.payload.mealId;
        const idx = current.cartItems.findIndex((m) => m.id === mealId);
        if (idx === -1) return;

        const updated = [...current.cartItems];
        updated.splice(idx, 1);

        this.setForKey(key, { ...current, cartItems: updated });
        return;
      }

      case CartActionTypes.CLEAR_CART: {
        this.setForKey(key, { ...current, cartItems: [] });
        return;
      }

      case CartActionTypes.PLACE_ORDER: {
        const order: Order = action.payload.order;

        //Side-effect: atualizar stock no AdminStore (continua igual à lógica antiga)
        order.items.forEach((m) => {
          if (m.id) AdminStore.updateStock(m.id, -1);
        });

        //globalOrders para billing/admin
        globalOrders.unshift(order);

        this.setForKey(key, { cartItems: [], orders: [order, ...current.orders] });
        return;
      }

      default:
        return;
    }
  }
}

export const CartStore = new CartStoreClass();
