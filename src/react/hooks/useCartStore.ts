// src/react/hooks/useCartStore.ts
import { useEffect, useMemo, useState } from "react";
import { useStores } from "../context/StoresContext";
import type { CartState } from "../../flux/stores/CartStore";

export function useCartStore() {
  const { cartStore } = useStores();
  const [snap, setSnap] = useState<CartState>(cartStore.getState());

  useEffect(() => {
    const onChange = () => setSnap(cartStore.getState());
    const unsubscribe = cartStore.addChangeListener(onChange);
    return unsubscribe;
  }, [cartStore]);

  const itemsSafe = snap?.items ?? [];
  const ordersSafe = snap?.orders ?? [];

  const totalItems = useMemo(() => itemsSafe.length, [itemsSafe]);
  const totalPrice = useMemo(
    () => itemsSafe.reduce((sum, m) => sum + (m.price ?? 0), 0),
    [itemsSafe]
  );

  return {
    ...snap,
    items: itemsSafe,
    cartItems: itemsSafe, // ✅ compat para Carrinho.tsx antigo
    orders: ordersSafe,
    totalItems,
    totalPrice,
  };
}
