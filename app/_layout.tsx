import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AdminProvider } from "./context/AdminContext";

export default function RootLayout() {
  return (
    <AuthProvider>
  <AdminProvider>
    <CartProvider>
      <Stack />
    </CartProvider>
  </AdminProvider>
</AuthProvider>
  );
}
