import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

//Flux: ler estado da store (cart)
import { useCartStore } from "../../../src/react/hooks/useCartStore";

export default function NovoPedido() {
  const router = useRouter();

  //Store -> UI
  const { totalItems } = useCartStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Novo Pedido</Text>
      <Text style={styles.info}>
        Nesta secção vais selecionar as refeições e escolher a morada de
        entrega.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Escolher Refeições</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/Refeicoes")}
        >
          <Text style={styles.buttonText}>Ver Refeições Disponíveis</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Carrinho Atual</Text>
        <Text style={styles.sectionDescription}>
          Tens atualmente {totalItems} refeição(ões) no carrinho.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.cartButton]}
          onPress={() => router.push("/Carrinho")}
        >
          <Text style={styles.buttonText}>Ir para o Carrinho</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Finalizar Pedido</Text>
        <Text style={styles.sectionDescription}>
          A finalização é feita no ecrã do carrinho. No futuro, aqui também
          poderás confirmar morada e método de pagamento.
        </Text>
      </View>
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
    marginBottom: 8,
  },
  info: {
    fontSize: 15,
    color: "#444",
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9F1C",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#555",
  },
  button: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  cartButton: {
    backgroundColor: "#FF6F59",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
