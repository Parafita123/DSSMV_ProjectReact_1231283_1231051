import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";


/**
 * Home screen for the administration area. From here the administrator can
 * navigate to the various management modules. The screen uses a scroll view
 * so that on small devices the user can still access all options.
 */
export default function AdminHome() {
  const router = useRouter();
  const { logout } = useAuth();

  /**
   * Prompt the administrator before logging out. If confirmed, perform the
   * logout and navigate back to the home screen. This ensures that the
   * session is cleared and the user must log in again to access the admin
   * area.
   */
  const handleLogout = () => {
  // 🟢 WEB (Expo Web)
  if (Platform.OS === "web") {
    const confirmed = window.confirm(
      "Tem a certeza que pretende terminar sessão?"
    );
    if (confirmed) {
      logout();
      router.replace("/");
    }
    return;
  }

  // 🟢 ANDROID / IOS
  Alert.alert(
    "Terminar sessão",
    "Tem a certeza que pretende terminar sessão?",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/");
        },
      },
    ]
  );
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Área de Administração</Text>
      <Text style={styles.subtitle}>
        Selecione uma opção para gerir a aplicação.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/AdminClients")}
      >
        <Text style={styles.buttonText}>Gerir Clientes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/AdminBilling")}
      >
        <Text style={styles.buttonText}>Ver Faturação</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/AdminStock")}
      >
        <Text style={styles.buttonText}>Gestão de Stock</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/AdminAddMeal")}
      >
        <Text style={styles.buttonText}>Adicionar Refeição/Produto</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/AdminEmployees")}
      >
        <Text style={styles.buttonText}>Gerir Funcionários</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/AdminEvents")}
      >
        <Text style={styles.buttonText}>Gerir Promoções</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/AdminReports")}
      >
        <Text style={styles.buttonText}>Reports</Text>
      </TouchableOpacity>

      {/* Logout button placed at the bottom. Uses a distinct style to
         differentiate it from other navigation buttons. */}
      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Terminar Sessão</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF6E5",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Style for the logout button. We reuse the base button styles but
  // override the background color to differentiate it from the other
  // options. You can customize this further if desired.
  logoutButton: {
    backgroundColor: "#FF6F59",
  },
});