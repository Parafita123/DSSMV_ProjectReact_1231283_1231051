import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>ComidaPósGalos</Text>
      <Text style={styles.subtitle}>Bem-vindo! Escolhe a área onde queres entrar.</Text>

      <TouchableOpacity
        style={[styles.button, styles.clientButton]}
        onPress={() => router.push("/ClientMenuScreen")}
      >
        <Text style={styles.buttonText}>Área do Cliente</Text>
      </TouchableOpacity>

      {/* Quando quisermos tratar do admin, ligamos este botão */}
      <TouchableOpacity
        style={[styles.button, styles.adminButton]}
        onPress={() => {
          // Por agora pode ficar só um console.log
          console.log("Ir para área de admin (por implementar)");
          // No futuro: router.push("/AdminMenu");
        }}
      >
        <Text style={styles.buttonText}>Área de Admin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6E5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FF6F59",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  clientButton: {
    backgroundColor: "#FF9F1C",
  },
  adminButton: {
    backgroundColor: "#FFD93D",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
