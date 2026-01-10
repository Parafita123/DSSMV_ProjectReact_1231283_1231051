import { Stack } from "expo-router";
import React, { useEffect } from "react";

import { StoresProvider } from "../src/react/context/StoresContext";

import { AuthActions } from "../src/flux/actions/auth.action";
import { AdminActions } from "../src/flux/actions/admin.action";

function Bootstrap() {
  useEffect(() => {
    AuthActions.init();
    AdminActions.initMeals();
  }, []);

  return <Stack />;
}

export default function RootLayout() {
  return (
    <StoresProvider>
      <Bootstrap />
    </StoresProvider>
  );
}
