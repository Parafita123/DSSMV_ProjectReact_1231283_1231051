// src/flux/actions/cart.action.ts
import { Dispatcher } from "../dispatcher/Dispatcher";
import type { Meal, Order } from "../types/cart.types";

export const CartActionTypes = {
  SET_LOADING: "CART/SET_LOADING",
  SET_ERROR: "CART/SET_ERROR",
  ADD_ITEM: "CART/ADD_ITEM",
  REMOVE_ITEM: "CART/REMOVE_ITEM",
  CLEAR: "CART/CLEAR",
  SET_ORDERS: "CART/SET_ORDERS",
  ADD_ORDER: "CART/ADD_ORDER",
} as const;

export function addToCart(meal: Meal) {
  Dispatcher.dispatch({
    type: CartActionTypes.ADD_ITEM,
    payload: { meal },
  });
}

// ⚠️ O teu CartStore remove por INDEX, não por id.
export function removeFromCart(index: number) {
  Dispatcher.dispatch({
    type: CartActionTypes.REMOVE_ITEM,
    payload: { index },
  });
}

export function clearCart() {
  Dispatcher.dispatch({
    type: CartActionTypes.CLEAR,
  });
}

export function placeOrder(order: Order) {
  Dispatcher.dispatch({
    type: CartActionTypes.ADD_ORDER,
    payload: { order },
  });
}
