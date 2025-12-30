// src/react/hooks/useCartStore.ts
import { useEffect, useMemo, useState } from "react";
import { useStores } from "../context/StoresContext";
import type { CartState } from "../../flux/stores/CartStore";

export function useCartStore() {
  const { cartStore } = useStores();

  const [snap, setSnap] = useState<CartState>(cartStore.getState());

  useEffect(() => {
    const onChange = () => setSnap(cartStore.getState());

    // ✅ BaseStore.addChangeListener devolve unsubscribe()
    const unsubscribe = cartStore.addChangeListener(onChange);
    return unsubscribe;
  }, [cartStore]);

  const totalItems = useMemo(() => cartStore.getTotalItems(), [snap.items]);
  const totalPrice = useMemo(() => cartStore.getTotalPrice(), [snap.items]);

  return {
    ...snap,
    totalItems,
    totalPrice,
  };
}
