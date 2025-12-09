import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAdmin } from "../context/AdminContext";

/**
 * Screen for managing promotions/events. Administrators can assign a discount
 * percentage to a meal for a fixed period (defaults to 7 days from the
 * current date). Active promotions are displayed with their discount and
 * expiration date. Promotions can be removed at any time.
 */
export default function AdminEvents() {
  const { meals, addPromotion, removePromotion } = useAdmin();
  // local state to hold discount input per meal
  const [discounts, setDiscounts] = useState<Record<string, string>>({});

  const handleChange = (mealId: string, value: string) => {
    setDiscounts((prev) => ({ ...prev, [mealId]: value }));
  };

  const handleAddPromo = (mealId: string) => {
    const value = parseFloat(discounts[mealId]);
    if (isNaN(value) || value <= 0) return;
    const now = new Date();
    const startAt = now.toISOString();
    const endAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    addPromotion(mealId, value, startAt, endAt);
    setDiscounts((prev) => ({ ...prev, [mealId]: "" }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gestão de Promoções</Text>
      <Text style={styles.subtitle}>
        Atribui descontos às refeições por um período limitado. Os clientes
        verão o preço reduzido durante a promoção.
      </Text>
      {meals.map((meal) => {
        const promoActive =
          meal.promo && new Date(meal.promo.endAt) > new Date();
        return (
          <View key={meal.id} style={styles.card}>
            <Text style={styles.mealName}>{meal.name}</Text>
            {promoActive ? (
              <View style={styles.promoInfo}>
                <Text style={styles.promoText}>
                  {meal.promo!.discountPercent}% de desconto até
                </Text>
                <Text style={styles.promoDate}>
                  {new Date(meal.promo!.endAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePromotion(meal.id)}
                >
                  <Text style={styles.removeButtonText}>Remover</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.addPromoRow}>
                <TextInput
                  style={styles.discountInput}
                  placeholder="% desconto"
                  keyboardType="numeric"
                  value={discounts[meal.id] ?? ""}
                  onChangeText={(txt) => handleChange(meal.id, txt)}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddPromo(meal.id)}
                >
                  <Text style={styles.addButtonText}>Promover</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF6E5",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  promoInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  promoDate: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  removeButton: {
    backgroundColor: "#FF6F59",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  addPromoRow: {
    flexDirection: "row",
    alignItems: "center",
    // Remove gap property; not supported on older React Native versions.
    // gap: 8,
  },
  discountInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 80,
    fontSize: 14,
    backgroundColor: "#FFF",
  },
  addButton: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});