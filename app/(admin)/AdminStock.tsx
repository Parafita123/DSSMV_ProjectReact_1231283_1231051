import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

import { useAdminStore } from "../../src/react/hooks/useAdminStore";
import { AdminActions } from "../../src/flux/actions/admin.action";

export default function AdminStock() {
  const { meals } = useAdminStore();
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    void AdminActions.initMeals();
  }, []);

  const handleChange = (mealId: string, text: string) => {
    setEditValues((prev) => ({ ...prev, [mealId]: text }));
  };

  const handleSetStock = (mealId: string) => {
    const value = parseInt(editValues[mealId], 10);
    if (!isNaN(value)) {
      void AdminActions.updateStock(mealId, value, true);
      setEditValues((prev) => ({ ...prev, [mealId]: "" }));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gestão de Stock</Text>
      <Text style={styles.subtitle}>
        Ajusta as quantidades disponíveis de cada refeição ou produto. Quando o
        stock chegar a zero, a refeição fica indisponível no menu do cliente.
      </Text>

      {(meals ?? []).map((meal) => (
        <View key={meal.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealPrice}>{meal.price.toFixed(2)} €</Text>
          </View>

          <Text style={styles.mealCategory}>{meal.category}</Text>

          <View style={styles.stockRow}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => void AdminActions.updateStock(meal.id, -1)}
              disabled={(meal.stock ?? 0) <= 0}
            >
              <Text style={styles.adjustButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.stockValue}>{meal.stock ?? 0}</Text>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => void AdminActions.updateStock(meal.id, 1)}
            >
              <Text style={styles.adjustButtonText}>+</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.stockInput}
              keyboardType="numeric"
              placeholder="Definir"
              value={editValues[meal.id] ?? ""}
              onChangeText={(text) => handleChange(meal.id, text)}
            />

            <TouchableOpacity
              style={styles.setButton}
              onPress={() => handleSetStock(meal.id)}
            >
              <Text style={styles.setButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF6E5",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  mealPrice: {
    fontSize: 14,
    color: "#FF9F1C",
    fontWeight: "bold",
  },
  mealCategory: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
  },
  adjustButton: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  adjustButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  stockValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: "center",
  },
  stockInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 60,
    fontSize: 14,
    backgroundColor: "#FFF",
  },
  setButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  setButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
