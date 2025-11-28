import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

export default function RootLayout() {
  return (
    <AuthProvider>
    <CartProvider>
      <Stack />
    </CartProvider>
    </AuthProvider>
  );
}
