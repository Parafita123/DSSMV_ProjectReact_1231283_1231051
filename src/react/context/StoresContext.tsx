// src/react/context/StoresContext.tsx
import React, { createContext, useContext, useMemo } from "react";

import { AuthStoreClass } from "../../flux/stores/AuthStore";
import { CartStoreClass } from "../../flux/stores/CartStore";
import { AdminStoreClass } from "../../flux/stores/AdminStore";

type Stores = {
  authStore: AuthStoreClass;
  cartStore: CartStoreClass;
  adminStore: AdminStoreClass;
};

const StoresContext = createContext<Stores | null>(null);

export function StoresProvider({ children }: { children: React.ReactNode }) {
  const stores = useMemo<Stores>(() => {
    // Instanciar 1x para não recriar stores a cada render
    return {
      authStore: new AuthStoreClass(),
      cartStore: new CartStoreClass(),
      adminStore: new AdminStoreClass(),
    };
  }, []);

  return <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>;
}

export function useStores() {
  const ctx = useContext(StoresContext);
  if (!ctx) {
    // Mensagem clara para debugging (em vez de "getState of undefined")
    throw new Error("useStores() called outside <StoresProvider>. Check app/_layout.tsx");
  }
  return ctx;
}
