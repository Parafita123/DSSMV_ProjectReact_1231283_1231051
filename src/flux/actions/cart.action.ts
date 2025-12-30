import { Dispatcher } from "../dispatcher/Dispatcher";
import type { Meal, Order } from "../types/cart.types";
import { insertRow } from "../../../app/supabase"; // ajusta se o teu path for outro

export const CartActionTypes = {
  INIT_ORDERS_REQUEST: "CART/INIT_ORDERS_REQUEST",
  INIT_ORDERS_SUCCESS: "CART/INIT_ORDERS_SUCCESS",
  INIT_ORDERS_FAILURE: "CART/INIT_ORDERS_FAILURE",

  ADD_TO_CART: "CART/ADD_TO_CART",
  REMOVE_ONE_FROM_CART: "CART/REMOVE_ONE_FROM_CART",
  CLEAR_CART: "CART/CLEAR_CART",
  PLACE_ORDER: "CART/PLACE_ORDER",
} as const;

export async function initOrders() {
  Dispatcher.dispatch({ type: CartActionTypes.INIT_ORDERS_REQUEST });
  try {
    // se já tens fetchTable<Order>, usa-a aqui
    const { fetchTable } = await import("../../../app/supabase");
    const orders = await fetchTable<Order>("orders", "*");
    Dispatcher.dispatch({
      type: CartActionTypes.INIT_ORDERS_SUCCESS,
      payload: { orders: orders ?? [] },
    });
  } catch (err: any) {
    Dispatcher.dispatch({
      type: CartActionTypes.INIT_ORDERS_FAILURE,
      payload: { error: err?.message || "Erro a carregar pedidos." },
    });
  }
}

export function addToCart(meal: Meal) {
  Dispatcher.dispatch({ type: CartActionTypes.ADD_TO_CART, payload: { meal } });
}

export function removeFromCart(mealId: string) {
  Dispatcher.dispatch({ type: CartActionTypes.REMOVE_ONE_FROM_CART, payload: { mealId } });
}

export function clearCart() {
  Dispatcher.dispatch({ type: CartActionTypes.CLEAR_CART });
}

export async function placeOrder(order: Order) {
  // 1) persistir na Supabase
  await insertRow("orders", order);

  // 2) atualizar store local
  Dispatcher.dispatch({ type: CartActionTypes.PLACE_ORDER, payload: { order } });
}
