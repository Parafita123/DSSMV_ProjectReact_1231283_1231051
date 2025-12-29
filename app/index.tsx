import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

// ✅ Flux: ler estado da store + disparar actions
import { useAuthStore } from "../src/react/hooks/useAuthStore";
import { AuthActions } from "../src/flux/actions/auth.action";
import type { User } from "../src/flux/types/auth.types";

export default function HomeScreen() {
  const router = useRouter();

  // ✅ Store snapshot
  const { users, currentUser, loading, error } = useAuthStore();
  const isAuthenticated = !!currentUser;
  const user = currentUser;

  // UI state
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [localError, setLocalError] = useState<string | null>(null);

  // admin login modal state
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLocalError, setAdminLocalError] = useState<string | null>(null);

  // campos login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // campos registo
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nif, setNif] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Sync do erro do Store para o erro local (para mostrar dentro do modal certo)
  useEffect(() => {
    if (!error) return;

    // Se o admin modal estiver aberto, mostra no erro do admin
    if (adminModalVisible) {
      setAdminLocalError(error);
      return;
    }

    // Caso contrário, mostra no modal cliente
    setLocalError(error);
  }, [error, adminModalVisible]);

  const resetForms = () => {
    setLoginEmail("");
    setLoginPassword("");
    setName("");
    setEmail("");
    setNif("");
    setAddress("");
    setPhone("");
    setPassword("");
    setLocalError(null);
    setAdminLocalError(null);
  };

  const openClientArea = () => {
    if (isAuthenticated) {
      // Já está autenticado: vai para o menu de cliente
      router.push("/ClientMenuScreen");
    } else {
      setAuthModalVisible(true);
      setMode("login");
      setLocalError(null);
      AuthActions.clearError();
    }
  };

  const openAdminArea = () => {
    // Se já está autenticado como admin, entra direto
    if (isAuthenticated && user?.role === "admin") {
      router.push("/AdminHome");
      return;
    }

    setAdminEmail("");
    setAdminPassword("");
    setAdminLocalError(null);
    AuthActions.clearError();
    setAdminModalVisible(true);
  };

  // ✅ Login cliente via Flux
  const handleLogin = () => {
    setLocalError(null);
    AuthActions.clearError();
    AuthActions.login(loginEmail.trim(), loginPassword);
  };

  // ✅ Registo cliente via Flux
  const handleRegister = () => {
    setLocalError(null);
    AuthActions.clearError();

    if (!name || !email || !nif || !address || !phone || !password) {
      setLocalError("Preenche todos os campos.");
      return;
    }

    const payload: User = {
      name: name.trim(),
      email: email.trim(),
      nif: nif.trim(),
      address: address.trim(),
      phone: phone.trim(),
      password,
      role: "client",
      banned: false,
      blocked: false,
    };

    AuthActions.register(payload);
  };

  // ✅ Login admin via Flux (apenas usa AuthActions.login e depois valida role)
  const handleAdminLogin = () => {
    setAdminLocalError(null);
    AuthActions.clearError();

    // Dispara login; a navegação é tratada num effect quando o store atualizar
    AuthActions.login(adminEmail.trim(), adminPassword);
  };

  // ✅ Quando autenticar como CLIENTE, fechar modal do cliente e navegar
  useEffect(() => {
    if (!authModalVisible) return;
    if (!isAuthenticated || !user) return;

    // Só fecha se for cliente (não queremos fechar modal cliente se alguém tentou entrar como admin)
    if (user.role !== "client") {
      setLocalError("Apenas clientes podem entrar na Área do Cliente.");
      return;
    }

    setAuthModalVisible(false);
    resetForms();
    router.push("/ClientMenuScreen");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authModalVisible, isAuthenticated, user?.email, user?.role]);

  // ✅ Quando autenticar como ADMIN, fechar modal de admin e navegar
  useEffect(() => {
    if (!adminModalVisible) return;
    if (!isAuthenticated || !user) return;

    if (user.role !== "admin") {
      setAdminLocalError("Apenas administradores podem entrar nesta área.");
      return;
    }

    setAdminModalVisible(false);
    resetForms();
    router.push("/AdminHome");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminModalVisible, isAuthenticated, user?.email, user?.role]);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.appTitle}>ComidaPósGalos</Text>
        <Text style={styles.subtitle}>
          Bem-vindo! Escolhe a área onde queres entrar.
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.clientButton]}
          onPress={openClientArea}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            Área do Cliente {isAuthenticated && user ? `(${user.name})` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.adminButton]}
          onPress={openAdminArea}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Área de Admin</Text>
        </TouchableOpacity>

        {loading && <Text style={styles.loadingText}>A carregar...</Text>}
      </View>

      {/* MODAL DE LOGIN ADMIN */}
      {adminModalVisible && (
        <View style={styles.modalWrapper}>
          <Modal
            visible={adminModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setAdminModalVisible(false)}
          >
            <KeyboardAvoidingView
              style={styles.modalOuter}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Login de Admin</Text>
                  <TouchableOpacity
                    onPress={() => setAdminModalVisible(false)}
                    style={styles.closeButton}
                    disabled={loading}
                  >
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>

                {adminLocalError && (
                  <Text style={styles.errorText}>{adminLocalError}</Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Email de admin"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={adminEmail}
                  onChangeText={setAdminEmail}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  value={adminPassword}
                  onChangeText={setAdminPassword}
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAdminLogin}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? "A entrar..." : "Entrar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      )}

      {/* MODAL DE LOGIN / REGISTO (CLIENTE) */}
      {authModalVisible && (
        <View style={styles.modalWrapper}>
          <Modal
            visible={authModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setAuthModalVisible(false)}
          >
            <KeyboardAvoidingView
              style={styles.modalOuter}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {mode === "login" ? "Login" : "Criar Conta"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAuthModalVisible(false)}
                    style={styles.closeButton}
                    disabled={loading}
                  >
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modeSwitchRow}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      mode === "login" && styles.modeButtonActive,
                    ]}
                    onPress={() => {
                      setMode("login");
                      setLocalError(null);
                      AuthActions.clearError();
                    }}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        mode === "login" && styles.modeButtonTextActive,
                      ]}
                    >
                      Já tenho conta
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      mode === "register" && styles.modeButtonActive,
                    ]}
                    onPress={() => {
                      setMode("register");
                      setLocalError(null);
                      AuthActions.clearError();
                    }}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        mode === "register" && styles.modeButtonTextActive,
                      ]}
                    >
                      Registar-me
                    </Text>
                  </TouchableOpacity>
                </View>

                {localError && <Text style={styles.errorText}>{localError}</Text>}

                <ScrollView
                  contentContainerStyle={{ paddingBottom: 10 }}
                  showsVerticalScrollIndicator={false}
                >
                  {mode === "login" ? (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={loginEmail}
                        onChangeText={setLoginEmail}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                      />

                      <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleLogin}
                        disabled={loading}
                      >
                        <Text style={styles.submitButtonText}>
                          {loading ? "A entrar..." : "Entrar"}
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Nome"
                        value={name}
                        onChangeText={setName}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="NIF"
                        keyboardType="numeric"
                        value={nif}
                        onChangeText={setNif}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Morada"
                        value={address}
                        onChangeText={setAddress}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Telemóvel"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                      />

                      <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleRegister}
                        disabled={loading}
                      >
                        <Text style={styles.submitButtonText}>
                          {loading ? "A criar..." : "Criar Conta"}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      )}
    </>
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
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#666",
  },
  modalOuter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6F59",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modeSwitchRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF9F1C",
    marginRight: 6,
  },
  modeButtonActive: {
    backgroundColor: "#FF9F1C",
  },
  modeButtonText: {
    textAlign: "center",
    fontSize: 13,
    color: "#FF9F1C",
    fontWeight: "bold",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#FF6F59",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
