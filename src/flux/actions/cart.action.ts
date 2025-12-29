import { Dispatcher } from "../dispatcher/Dispatcher";
import type { Meal, Order } from "../types/cart.types";

export const CartActionTypes = {
  ADD_TO_CART: "CART/ADD_TO_CART",
  REMOVE_ONE_FROM_CART: "CART/REMOVE_ONE_FROM_CART",
  CLEAR_CART: "CART/CLEAR_CART",
  PLACE_ORDER: "CART/PLACE_ORDER",
} as const;

export function addToCart(meal: Meal) {
  Dispatcher.dispatch({ type: CartActionTypes.ADD_TO_CART, payload: { meal } });
}

export function removeFromCart(mealId: string) {
  Dispatcher.dispatch({ type: CartActionTypes.REMOVE_ONE_FROM_CART, payload: { mealId } });
}

export function clearCart() {
  Dispatcher.dispatch({ type: CartActionTypes.CLEAR_CART });
}

export function placeOrder(order: Order) {
  Dispatcher.dispatch({ type: CartActionTypes.PLACE_ORDER, payload: { order } });
}
