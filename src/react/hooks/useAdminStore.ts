// src/react/hooks/useAdminStore.ts
import { useEffect, useMemo, useState } from "react";
import { useStores } from "../context/StoresContext";
import type { AdminState } from "../../flux/stores/AdminStore";

export function useAdminStore() {
  const { adminStore } = useStores();

  const [snap, setSnap] = useState<AdminState>(adminStore.getState());

  useEffect(() => {
    const onChange = () => setSnap(adminStore.getState());
    const unsubscribe = adminStore.addChangeListener(onChange);
    return unsubscribe;
  }, [adminStore]);

  // Garantir sempre arrays (evita crashes e “não aparece nada” por undefined)
  const meals = useMemo(() => snap.meals ?? [], [snap.meals]);
  const clients = useMemo(() => snap.clients ?? [], [snap.clients]);
  const reports = useMemo(() => snap.reports ?? [], [snap.reports]);
  const employees = useMemo(() => snap.employees ?? [], [snap.employees]);

  return {
    ...snap,
    meals,
    clients,
    reports,
    employees,
  };
}
