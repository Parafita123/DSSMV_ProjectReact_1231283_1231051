// src/react/hooks/useAuthStore.ts
import { useEffect, useMemo, useState } from "react";
import { useStores } from "../context/StoresContext";
import type { AuthState } from "../../flux/stores/AuthStore";

export function useAuthStore() {
  const { authStore } = useStores();

  const [snap, setSnap] = useState<AuthState>(authStore.getState());

  useEffect(() => {
    const onChange = () => setSnap(authStore.getState());

    // ✅ BaseStore agora devolve unsubscribe function (não boolean)
    const unsubscribe = authStore.addChangeListener(onChange);
    return unsubscribe;
  }, [authStore]);

  const currentUser = useMemo(() => authStore.getCurrentUser(), [snap.currentEmail, snap.users]);

  return {
    ...snap,
    currentUser,
  };
}
