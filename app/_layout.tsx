import { Stack } from "expo-router";
import React, { useEffect } from "react";

import { StoresProvider } from "../src/react/context/StoresContext";

// Actions (carregar dados iniciais)
import { AuthActions } from "../src/flux/actions/auth.action";
import { AdminActions } from "../src/flux/actions/admin.action";

export default function RootLayout() {
  useEffect(() => {
    // carrega users
    AuthActions.init();

    // carrega meals (para Cliente e Admin)
    AdminActions.initMeals();
  }, []);

  return (
    <StoresProvider>
      <Stack />
    </StoresProvider>
  );
}
