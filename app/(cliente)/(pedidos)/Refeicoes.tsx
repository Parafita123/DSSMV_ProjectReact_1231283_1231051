import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Meal, useCart } from "../../context/CartContext";
import { useAdmin } from "../../context/AdminContext";

/*
 * Instead of relying on hardcoded mock meals, we fetch the list of meals
 * directly from the AdminContext. This allows the admin to add new
 * meals, update stock and create promotions that are immediately
 * reflected in the client interface. A promotion is considered active
 * when the current time is between startAt and endAt. If active, the
 * discount is applied to the displayed price and flagged with a tag.
 */

const RefeicoesScreen: React.FC = () => {
  const { meals } = useAdmin();
  const { addToCart } = useCart();

  const renderMeal = ({ item }: { item: Meal }) => {
    // Determine if there's an active promotion and calculate discounted price
    let isPromo = false;
    let promoPrice = item.price;
    if (item.promo) {
      const now = new Date();
      const start = new Date(item.promo.startAt);
      const end = new Date(item.promo.endAt);
      if (now >= start && now <= end) {
        isPromo = true;
        promoPrice = item.price * (1 - item.promo.discountPercent / 100);
      }
    }
    // When adding to cart, we create a copy of the meal and override the price
    const handleAdd = () => {
      const mealToAdd: Meal = { ...item, price: promoPrice };
      addToCart(mealToAdd);
    };
    return (
      <View style={[styles.card, !item.available && styles.cardUnavailable]}>
        <View style={styles.cardHeader}>
          <Text style={styles.mealName}>{item.name}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            {isPromo ? (
              <>
                <Text style={[styles.mealPrice, styles.originalPrice]}> 
                  {item.price.toFixed(2)} €
                </Text>
                <Text style={styles.mealPrice}>{promoPrice.toFixed(2)} €</Text>
              </>
            ) : (
              <Text style={styles.mealPrice}>{item.price.toFixed(2)} €</Text>
            )}
          </View>
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
          {isPromo && (
            <Text style={[styles.tag, styles.tagPromo]}>Promoção</Text>
          )}
        </View>

        <TouchableOpacity
          disabled={!item.available}
          style={[
            styles.addButton,
            !item.available && styles.addButtonDisabled,
          ]}
          onPress={handleAdd}
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
        O menu abaixo reflete os dados geridos pelo administrador. As promoções
        aplicadas na área de admin são automaticamente consideradas.
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
  // When a promotion is active, the original price is shown with a line-through
  originalPrice: {
    fontSize: 12,
    color: "#777",
    textDecorationLine: "line-through",
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
  tagPromo: {
    backgroundColor: "#8BC34A",
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
