import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useCart, Meal } from "../../context/CartContext";

export default function Carrinho() {
  const router = useRouter();
  const { cartItems, removeFromCart, clearCart, placeOrder } = useCart();

  const total = cartItems.reduce((sum, m) => sum + m.price, 0);

  const handleFinalizar = () => {
    if (cartItems.length === 0) return;
    placeOrder();
    router.push("/Conta");
  };

  const renderItem = ({ item }: { item: Meal }) => (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price.toFixed(2)} €</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
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
          Ainda não tens refeições no carrinho. Adiciona a partir das
          Refeições Disponíveis.
        </Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id + Math.random().toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
              <Text style={styles.clearButtonText}>Limpar Carrinho</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinalizar}
            >
              <Text style={styles.finishButtonText}>Finalizar Pedido</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6E5",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#555",
  },
  listContent: {
    paddingBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  itemPrice: {
    fontSize: 13,
    color: "#FF9F1C",
  },
  removeButton: {
    backgroundColor: "#FF6F59",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9F1C",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // Remove gap property as it is not supported in React Native versions prior to 0.71.
    // gap: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#BDBDBD",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  finishButton: {
    flex: 1,
    backgroundColor: "#FF6F59",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  finishButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
