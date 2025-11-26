import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Meal, useCart } from "../../context/CartContext";

const MOCK_MEALS: Meal[] = [
  {
    id: "1",
    name: "Frango Piri-Piri Pós-Galo",
    description: "Frango assado no carvão com molho picante da casa.",
    price: 9.5,
    category: "Especialidade da Casa",
    spicy: true,
    available: true,
  },
  {
    id: "2",
    name: "Hambúrguer do Galo",
    description: "Hambúrguer de frango crocante com queijo e molho especial.",
    price: 8.0,
    category: "Hambúrgueres",
    available: true,
  },
  {
    id: "3",
    name: "Menu Almoço Pós-Galo",
    description: "Prato do dia + bebida + café.",
    price: 7.5,
    category: "Menu do Dia",
    available: true,
  },
  {
    id: "4",
    name: "Salada Fit da Capoeira",
    description: "Mix de verdes, frango grelhado e molho de iogurte.",
    price: 7.0,
    category: "Saladas",
    available: false,
  },
];

const RefeicoesScreen: React.FC = () => {
  const [meals] = useState<Meal[]>(MOCK_MEALS);
  const { addToCart } = useCart();

  const renderMeal = ({ item }: { item: Meal }) => {
    return (
      <View style={[styles.card, !item.available && styles.cardUnavailable]}>
        <View style={styles.cardHeader}>
          <Text style={styles.mealName}>{item.name}</Text>
          <Text style={styles.mealPrice}>{item.price.toFixed(2)} €</Text>
        </View>

        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.mealDescription}>{item.description}</Text>

        <View style={styles.tagsRow}>
          {item.spicy && (
            <Text style={[styles.tag, styles.tagSpicy]}>Picante 🌶️</Text>
          )}
          <Text
            style={[
              styles.tag,
              item.available ? styles.tagAvailable : styles.tagUnavailable,
            ]}
          >
            {item.available ? "Disponível" : "Indisponível"}
          </Text>
        </View>

        <TouchableOpacity
          disabled={!item.available}
          style={[
            styles.addButton,
            !item.available && styles.addButtonDisabled,
          ]}
          onPress={() => addToCart(item)}
        >
          <Text style={styles.addButtonText}>
            {item.available ? "Adicionar ao Pedido" : "Indisponível"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Refeições Disponíveis</Text>
      <Text style={styles.subtitle}>
        Estes dados são apenas de exemplo. No futuro, vão ser carregados de uma
        API com os menus reais da ComidaPósGalos.
      </Text>

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={renderMeal}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default RefeicoesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6E5",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF6F59",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardUnavailable: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mealName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
    color: "#333",
  },
  mealPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9F1C",
  },
  category: {
    fontSize: 12,
    color: "#FF9F1C",
    marginTop: 4,
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
    color: "#fff",
  },
  tagSpicy: {
    backgroundColor: "#FF6F59",
  },
  tagAvailable: {
    backgroundColor: "#4CAF50",
  },
  tagUnavailable: {
    backgroundColor: "#9E9E9E",
  },
  addButton: {
    backgroundColor: "#FF6F59",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
