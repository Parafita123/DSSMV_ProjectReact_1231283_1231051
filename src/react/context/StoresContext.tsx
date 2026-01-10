import React, { createContext, useContext, useMemo } from "react";

// ✅ IMPORTAR AS INSTÂNCIAS SINGLETON (não as classes)
import { AuthStore } from "../../flux/stores/AuthStore";
import { CartStore } from "../../flux/stores/CartStore";
import { AdminStore } from "../../flux/stores/AdminStore";

type Stores = {
  authStore: typeof AuthStore;
  cartStore: typeof CartStore;
  adminStore: typeof AdminStore;
};

const StoresContext = createContext<Stores | null>(null);

export function StoresProvider({ children }: { children: React.ReactNode }) {
  // ✅ usar sempre as mesmas instâncias (singletons)
  const stores = useMemo<Stores>(() => {
    return {
      authStore: AuthStore,
      cartStore: CartStore,
      adminStore: AdminStore,
    };
  }, []);

  return <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>;
}

export function useStores() {
  const ctx = useContext(StoresContext);
  if (!ctx) {
    throw new Error("useStores() called outside <StoresProvider>. Check app/_layout.tsx");
  }
  return ctx;
}
