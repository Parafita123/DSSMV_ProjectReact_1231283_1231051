import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Platform,
} from "react-native";

import { useAdminStore } from "../../src/react/hooks/useAdminStore";
import { AdminActions } from "../../src/flux/actions/admin.action";
import type { Meal } from "../../src/flux/types/cart.types";

export default function AdminAddMeal() {
  const { meals, error } = useAdminStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [spicy, setSpicy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setPrice("");
    setStock("");
    setSpicy(false);
    setEditingId(null);
  };

  const showWarn = (msg: string) => {
    if (Platform.OS === "web") {
      window.alert(msg);
      return;
    }
    Alert.alert("Aviso", msg);
  };

  const handleSave = async () => {
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (!name || !description || !category || isNaN(priceNum) || isNaN(stockNum)) {
      showWarn("Preenche todos os campos corretamente.");
      return;
    }

    if (editingId) {
      await AdminActions.updateMeal(editingId, {
        name,
        description,
        category,
        price: priceNum,
        stock: stockNum,
        spicy,
      } as Partial<Meal>);
    } else {
      await AdminActions.addMeal({
        name,
        description,
        category,
        price: priceNum,
        spicy,
        stock: stockNum,
        available: stockNum > 0,
      } as any);

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }

    resetForm();
  };

  const handleEdit = (meal: Meal) => {
    setEditingId(meal.id);
    setName(meal.name ?? "");
    setDescription(meal.description ?? "");
    setCategory(meal.category ?? "");
    setPrice((meal.price ?? 0).toString());
    setStock((meal.stock ?? 0).toString());
    setSpicy(!!meal.spicy);
  };

  const handleRemove = async (mealId: string) => {
    if (Platform.OS === "web") {
      const ok = window.confirm("Tens a certeza que queres remover esta refeição?");
      if (!ok) return;
      await AdminActions.removeMeal(mealId);
      return;
    }

    Alert.alert("Remover", "Tens a certeza que queres remover esta refeição?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          void AdminActions.removeMeal(mealId);
        },
      },
    ]);
  };

  const sortedMeals = useMemo(() => {
    return [...(meals ?? [])].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [meals]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gerir Refeições</Text>
      <Text style={styles.subtitle}>
        Lista de refeições existentes e formulário para adicionar/editar.
      </Text>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {/* Existing meals list */}
      {sortedMeals.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          {sortedMeals.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealCategory}>{meal.category}</Text>
              <Text style={styles.mealDesc}>{meal.description}</Text>

              <View style={styles.mealDetailsRow}>
                <Text style={styles.mealPrice}>{(meal.price ?? 0).toFixed(2)} €</Text>
                <Text style={styles.mealStock}>Stock: {meal.stock ?? 0}</Text>
              </View>

              <View style={styles.mealActionsRow}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(meal)}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemove(meal.id)}>
                  <Text style={styles.deleteButtonText}>Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Form fields for add/edit */}
      <TextInput
        style={styles.input}
        placeholder="Nome da refeição"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Categoria"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Preço (EUR)"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Stock"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Picante?</Text>
        <Switch
          value={spicy}
          onValueChange={setSpicy}
          trackColor={{ false: "#DDD", true: "#FF9F1C" }}
          thumbColor={spicy ? "#FF6F59" : "#FFF"}
        />
      </View>

      {submitted && !editingId && <Text style={styles.success}>Refeição adicionada!</Text>}

      <TouchableOpacity style={styles.addButton} onPress={handleSave}>
        <Text style={styles.addButtonText}>{editingId ? "Guardar" : "Adicionar"}</Text>
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: "#BDBDBD", marginTop: 8 }]}
          onPress={resetForm}
        >
          <Text style={styles.addButtonText}>Cancelar</Text>
        </TouchableOpacity>
      )}
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
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: "#FFF",
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 14,
    color: "#333",
    marginRight: 10,
  },
  success: {
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Styles for meal listing
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  mealCategory: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  mealDesc: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },
  mealDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealPrice: {
    fontSize: 14,
    color: "#FF9F1C",
    fontWeight: "bold",
  },
  mealStock: {
    fontSize: 12,
    color: "#333",
  },
  mealActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#FF6F59",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
