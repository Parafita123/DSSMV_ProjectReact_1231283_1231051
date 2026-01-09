import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { useCartStore } from "../../../src/react/hooks/useCartStore";
import { removeFromCart, clearCart, placeOrder } from "../../../src/flux/actions/cart.action";
import type { Meal, Order } from "../../../src/flux/types/cart.types";
import { useAuthStore } from "../../../src/react/hooks/useAuthStore";

export default function Carrinho() {
  const { currentUser } = useAuthStore();
  const router = useRouter();

  // ✅ o store guarda "items"
  const { items } = useCartStore();
  const cartItems = items ?? [];

  const total = useMemo(
    () => cartItems.reduce((sum, m) => sum + (m.price ?? 0), 0),
    [cartItems]
  );

  const handleFinalizar = () => {
    if (cartItems.length === 0) return;

    const order: Order = {
      id: Date.now().toString(),
      items: cartItems,
      total,
      createdAt: new Date().toISOString(),
      clientEmail: currentUser?.email ?? "__guest__",
    };

    placeOrder(order);
    router.push("/Conta");
  };

  const renderItem = ({ item, index }: { item: Meal; index: number }) => (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{Number(item.price ?? 0).toFixed(2)} €</Text>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(index)}   // ✅ por índice
      >
        <Text style={styles.removeButtonText}>Remover</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrinho</Text>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>
          Ainda não tens refeições no carrinho. Adiciona a partir das Refeições Disponíveis.
        </Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, idx) => `${item.id}-${idx}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.clearButton} onPress={() => clearCart()}>
              <Text style={styles.clearButtonText}>Limpar Carrinho</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.finishButton} onPress={handleFinalizar}>
              <Text style={styles.finishButtonText}>Finalizar Pedido</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF6E5", padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: "bold", color: "#FF6F59", marginBottom: 16 },
  emptyText: { fontSize: 14, color: "#555" },
  listContent: { paddingBottom: 16 },
  itemRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF",
    borderRadius: 12, padding: 12, marginBottom: 8, elevation: 2,
  },
  itemName: { fontSize: 15, fontWeight: "bold", color: "#333" },
  itemPrice: { fontSize: 13, color: "#FF9F1C" },
  removeButton: { backgroundColor: "#FF6F59", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  removeButtonText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, marginBottom: 8 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#333" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#FF9F1C" },
  actionsRow: { flexDirection: "row", justifyContent: "space-between" },
  clearButton: {
    flex: 1, backgroundColor: "#BDBDBD", paddingVertical: 12,
    borderRadius: 10, alignItems: "center", marginRight: 8,
  },
  clearButtonText: { color: "#fff", fontWeight: "bold" },
  finishButton: { flex: 1, backgroundColor: "#FF6F59", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  finishButtonText: { color: "#fff", fontWeight: "bold" },
});
