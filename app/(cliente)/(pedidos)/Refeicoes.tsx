import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

//Flux: ler estado das stores
import { useAdminStore } from "../../../src/react/hooks/useAdminStore";
import { useCartStore } from "../../../src/react/hooks/useCartStore";

//Flux: actions (intent/event)
import { addToCart } from "../../../src/flux/actions/cart.action";

//Types
import type { Meal } from "../../../src/flux/types/admin.types";

const RefeicoesScreen: React.FC = () => {
  // Store -> UI
  const { meals } = useAdminStore();
  useCartStore(); // mantém a store ativa (opcional, mas ok)

  const renderMeal = ({ item }: { item: Meal }) => {
    //Mesma lógica de promo
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

    // Ao adicionar ao carrinho, copia e substitui o preço pelo preço promocional
    const handleAdd = () => {
      const mealToAdd = { ...item, price: promoPrice };
      addToCart(mealToAdd as any);
      // ^ se o teu cart.types Meal != admin.types Meal, diz-me e eu deixo tipado certinho
    };

    return (
      <View style={[styles.card, !item.available && styles.cardUnavailable]}>
        <View style={styles.cardHeader}>
          <Text style={styles.mealName}>{item.name}</Text>

          <View style={{ alignItems: "flex-end" }}>
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

          {isPromo && <Text style={[styles.tag, styles.tagPromo]}>Promoção</Text>}
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
