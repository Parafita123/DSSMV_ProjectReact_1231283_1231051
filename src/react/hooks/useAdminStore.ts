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
