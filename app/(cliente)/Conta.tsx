import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useCart, Order } from "../context/CartContext";

export default function Conta() {
  const { orders } = useCart();

  const renderOrder = ({ item }: { item: Order }) => {
    const date = new Date(item.createdAt);
    return (
      <View style={styles.orderCard}>
        <Text style={styles.orderTitle}>
          Pedido #{item.id} - {item.total.toFixed(2)} €
        </Text>
        <Text style={styles.orderDate}>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>
        <Text style={styles.orderItemsTitle}>Refeições:</Text>
        {item.items.map((meal, index) => (
          <Text key={index} style={styles.orderItem}>
            • {meal.name} ({meal.price.toFixed(2)} €)
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>A Minha Conta</Text>

      <Text style={styles.info}>
        Aqui vais poder visualizar e editar os teus dados pessoais, como:
      </Text>

      <View style={styles.list}>
        <Text style={styles.item}>• Nome</Text>
        <Text style={styles.item}>• Email</Text>
        <Text style={styles.item}>• Morada</Text>
        <Text style={styles.item}>• Histórico de pedidos</Text>
      </View>

      <Text style={styles.historyTitle}>Pedidos efetuados</Text>

      {orders.length === 0 ? (
        <Text style={styles.noOrders}>Ainda não fizeste nenhum pedido.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.historyList}
        />
      )}

      <Text style={styles.footer}>
        No futuro, estes dados podem ser guardados numa base de dados via API,
        permitindo também calcular faturamento na área de admin.
      </Text>
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
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: "#444",
    marginBottom: 20,
  },
  list: {
    marginLeft: 10,
    marginBottom: 20,
  },
  item: {
    fontSize: 16,
    marginBottom: 8,
    color: "#FF9F1C",
    fontWeight: "bold",
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  noOrders: {
    fontSize: 14,
    color: "#555",
  },
  historyList: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  orderItemsTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 2,
  },
  orderItem: {
    fontSize: 13,
    color: "#555",
  },
  footer: {
    marginTop: 20,
    fontSize: 13,
    color: "#666",
  },
});
