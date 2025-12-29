// src/react/hooks/useAuthStore.ts
import { useEffect, useMemo, useState } from "react";
import { useStores } from "../context/StoresContext";

export function useAuthStore() {
  const { authStore } = useStores();

  // snapshot inicial
  const [snap, setSnap] = useState(() => authStore.getState());

  useEffect(() => {
    // subscreve mudanças do store
    const unsub = authStore.subscribe(() => {
      setSnap(authStore.getState());
    });

    // cleanup
    return unsub;
  }, [authStore]);

  const currentUser = useMemo(() => authStore.getCurrentUser(), [
    snap.currentEmail,
    snap.users,
  ]);

  return {
    ...snap,
    currentUser,
  };
}
