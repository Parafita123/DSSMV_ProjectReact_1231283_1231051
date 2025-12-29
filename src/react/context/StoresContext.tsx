import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { AuthStore, AuthStoreClass } from "../../flux/stores/AuthStore";
import { CartStore, CartStoreClass } from "../../flux/stores/CartStore";
import { AdminStore, AdminStoreClass } from "../../flux/stores/AdminStore";

type Stores = {
  authStore: AuthStoreClass;
  cartStore: CartStoreClass;
  adminStore: AdminStoreClass;
};

const StoresContext = createContext<Stores | null>(null);

export function StoresProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      authStore: AuthStore,
      cartStore: CartStore,
      adminStore: AdminStore,
    }),
    []
  );

  return <StoresContext.Provider value={value}>{children}</StoresContext.Provider>;
}

export function useStores() {
  const ctx = useContext(StoresContext);
  if (!ctx) throw new Error("useStores deve ser usado dentro de StoresProvider");
  return ctx;
}
