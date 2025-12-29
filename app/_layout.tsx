// app/_layout.tsx
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { StoresProvider } from "../src/react/context/StoresContext";

import { AuthActions } from "../src/flux/actions/auth.action";
import { AdminActions } from "../src/flux/actions/admin.action";

export default function RootLayout() {
  useEffect(() => {
    //Carrega users (login)
    AuthActions.init();

    //Carrega refeições para o ecrã "Refeições"
    AdminActions.initMeals();
  }, []);

  return (
    <StoresProvider>
      <Stack />
    </StoresProvider>
  );
}
