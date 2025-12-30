import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

//FLUX: usa orders globais do CartStore
import { getAllOrders } from "../../src/flux/stores/CartStore";

export default function AdminBilling() {
  const [timeframe, setTimeframe] = useState<number | "all">(7);

  const timeframes: { label: string; value: number | "all" }[] = [
    { label: "1 semana", value: 7 },
    { label: "1 mês", value: 30 },
    { label: "3 meses", value: 90 },
    { label: "6 meses", value: 180 },
    { label: "1 ano", value: 365 },
    { label: "All time", value: "all" },
  ];

  const total = useMemo(() => {
    const orders = getAllOrders();
    if (orders.length === 0) return 0;

    const now = new Date();
    const cutoff =
      timeframe === "all"
        ? null
        : new Date(now.getTime() - timeframe * 24 * 60 * 60 * 1000);

    const filtered = cutoff
      ? orders.filter((o: any) => {
          const d = new Date(o.createdAt);
          return !isNaN(d.getTime()) && d >= cutoff;
        })
      : orders;

    return filtered.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);
  }, [timeframe]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Faturação</Text>
      <Text style={styles.subtitle}>Escolhe o período para visualizar o total faturado.</Text>

      <View style={styles.buttonsRow}>
        {timeframes.map((tf) => (
          <TouchableOpacity
            key={tf.label}
            style={[
              styles.timeframeButton,
              timeframe === tf.value && styles.timeframeButtonActive,
            ]}
            onPress={() => setTimeframe(tf.value)}
          >
            <Text
              style={[
                styles.timeframeButtonText,
                timeframe === tf.value && styles.timeframeButtonTextActive,
              ]}
            >
              {tf.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total faturado:</Text>
        <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
      </View>

      <Text style={styles.note}>
        Esta faturação é calculada com base nos pedidos efetuados no menu do cliente.
        Promoções já vêm refletidas no total do pedido (o cliente adiciona com o preço já com desconto).
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF6E5",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  timeframeButton: {
    backgroundColor: "#FFF",
    borderColor: "#FF9F1C",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: 4,
  },
  timeframeButtonActive: {
    backgroundColor: "#FF9F1C",
  },
  timeframeButtonText: {
    color: "#FF9F1C",
    fontSize: 13,
    fontWeight: "bold",
  },
  timeframeButtonTextActive: {
    color: "#FFF",
  },
  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6F59",
  },
  note: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
});
