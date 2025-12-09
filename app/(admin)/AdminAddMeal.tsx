import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { useAdmin } from "../context/AdminContext";

/**
 * Screen that allows administrators to add new meals or products. The form
 * collects basic information like name, description, category, price, stock
 * and whether the dish is spicy. Upon submission the new meal is added to
 * the global list used throughout the app. Fields are reset afterwards.
 */
export default function AdminAddMeal() {
  const { addMeal } = useAdmin();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [spicy, setSpicy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAdd = () => {
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);
    if (!name || !description || !category || isNaN(priceNum) || isNaN(stockNum)) {
      return;
    }
    addMeal({
      name,
      description,
      category,
      price: priceNum,
      spicy,
      stock: stockNum,
    });
    setName("");
    setDescription("");
    setCategory("");
    setPrice("");
    setStock("");
    setSpicy(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Adicionar Refeição ou Produto</Text>
      <Text style={styles.subtitle}>
        Preenche os campos abaixo para adicionar uma nova entrada ao menu.
      </Text>
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
        placeholder="Stock inicial"
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
      {submitted && <Text style={styles.success}>Refeição adicionada!</Text>}
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Adicionar</Text>
      </TouchableOpacity>
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
});