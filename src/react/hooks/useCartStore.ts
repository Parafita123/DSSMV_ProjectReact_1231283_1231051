// src/react/hooks/useCartStore.ts
import { useEffect, useState } from "react";
import { CartStore } from "../../flux/stores/CartStore";

export function useCartStore() {
  const [snap, setSnap] = useState(CartStore.getState());

  useEffect(() => {
    const unsub = CartStore.subscribe(() => setSnap(CartStore.getState()));
    return () => unsub();
  }, []);

  return {
    cartItems: snap.cartItems,
    orders: snap.orders,
    totalItems: snap.cartItems.length,
  };
}
