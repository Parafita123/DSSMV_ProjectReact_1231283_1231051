import { useEffect, useState } from "react";
import { AdminStore } from "../../flux/stores/AdminStore";

export function useAdminStore() {
  const [snap, setSnap] = useState(AdminStore.getState());

  useEffect(() => {
    const unsub = AdminStore.subscribe(() => setSnap(AdminStore.getState()));
    return unsub;
  }, []);

  return {
    reports: snap.reports,
    meals: snap.meals,
    clients: snap.clients,
  };
}
