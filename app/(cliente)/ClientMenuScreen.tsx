import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

//Flux: ler estado da store (sem context antigo)
import { useCartStore } from "../../src/react/hooks/useCartStore";

export default function ClientMenuScreen() {
  const router = useRouter();

  //Store snapshot
  const { totalItems } = useCartStore();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.appTitle}>ComidaPósGalos</Text>
          <Text style={styles.subtitle}>Área do Cliente</Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push("/Carrinho")}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>O que pretendes fazer?</Text>
        <Text style={styles.cardSubtitle}>
          Escolhe uma das opções abaixo para gerir a tua conta ou fazer um novo
          pedido.
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.buttonYellow]}
          onPress={() => router.push("/Conta")}
        >
          <Text style={styles.buttonTitle}>Ver Conta</Text>
          <Text style={styles.buttonDescription}>
            Ver e editar os teus dados e preferências.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonOrange]}
          onPress={() => router.push("/Novo")}
        >
          <Text style={styles.buttonTitle}>Fazer Pedido</Text>
          <Text style={styles.buttonDescription}>
            Criar um novo pedido e escolher a morada de entrega.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonRed]}
          onPress={() => router.push("/Refeicoes")}
        >
          <Text style={styles.buttonTitle}>Refeições Disponíveis</Text>
          <Text style={styles.buttonDescription}>
            Ver os menus e promoções disponíveis na app.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonBlue]}
          onPress={() => router.push("../SugerirReceita")}
        >
          <Text style={styles.buttonTitle}>Sugerir Receita</Text>
          <Text style={styles.buttonDescription}>
            Gerar uma receita personalizada com IA e sugeri-la ao menu.
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Em breve: histórico de pedidos, favoritos e promoções personalizadas 🔥
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#FFF6E5",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FF6F59",
  },
  subtitle: {
    fontSize: 18,
    color: "#FF9F1C",
    marginTop: 4,
  },
  cartButton: {
    position: "relative",
    padding: 8,
  },
  cartIcon: {
    fontSize: 30,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF6F59",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  buttonYellow: {
    backgroundColor: "#FFD93D",
  },
  buttonOrange: {
    backgroundColor: "#FF9F1C",
  },
  buttonRed: {
    backgroundColor: "#FF6F59",
  },
  buttonBlue: {
    backgroundColor: "#2EC4B6",
  },
  buttonTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  buttonDescription: {
    color: "#fff",
    fontSize: 13,
  },
  footerText: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 13,
    color: "#999",
  },
});
