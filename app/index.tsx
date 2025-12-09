import React, { useState } from "react";
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
import { useAuth } from "./context/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user, login, register, users } = useAuth();

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  // admin login modal state
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);

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

  const openClientArea = () => {
    if (isAuthenticated) {
      router.push("/ClientMenuScreen");
    } else {
      setAuthModalVisible(true);
      setMode("login");
      setError(null);
    }
  };

  const openAdminArea = () => {
    // If already authenticated as admin, go directly to admin home
    if (isAuthenticated && user && user.role === "admin") {
      router.push("/AdminHome");
    } else {
      setAdminEmail("");
      setAdminPassword("");
      setAdminError(null);
      setAdminModalVisible(true);
    }
  };

  const handleAdminLogin = () => {
    const result = login(adminEmail.trim(), adminPassword);
    if (!result.success) {
      setAdminError(result.message || "Erro no login.");
      return;
    }
    // find the user in the auth users list
    const found = users.find((u) => u.email === adminEmail.trim());
    if (!found || found.role !== "admin") {
      setAdminError("Apenas administradores podem entrar nesta área.");
      return;
    }
    setAdminModalVisible(false);
    setAdminEmail("");
    setAdminPassword("");
    setAdminError(null);
    router.push("/AdminHome");
  };

  const resetForms = () => {
    setLoginEmail("");
    setLoginPassword("");
    setName("");
    setEmail("");
    setNif("");
    setAddress("");
    setPhone("");
    setPassword("");
    setError(null);
  };

  const handleLogin = () => {
    const result = login(loginEmail.trim(), loginPassword);
    if (!result.success) {
      setError(result.message || "Erro no login.");
      return;
    }
    setAuthModalVisible(false);
    resetForms();
    router.push("/ClientMenuScreen");
  };

  const handleRegister = () => {
    if (!name || !email || !nif || !address || !phone || !password) {
      setError("Preenche todos os campos.");
      return;
    }

    // Provide default values for role, banned and blocked so that the object conforms
    // to the User type defined in AuthContext. When omitted these fields default
    // to undefined which causes a TypeScript error because User requires them.
    const result = register({
      name: name.trim(),
      email: email.trim(),
      nif: nif.trim(),
      address: address.trim(),
      phone: phone.trim(),
      password,
      role: "client",
      banned: false,
      blocked: false,
    });

    if (!result.success) {
      setError(result.message || "Erro no registo.");
      return;
    }

    setAuthModalVisible(false);
    resetForms();
    router.push("/ClientMenuScreen");
  };

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
        >
          <Text style={styles.buttonText}>
            Área do Cliente {isAuthenticated && user ? `(${user.name})` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.adminButton]}
          onPress={openAdminArea}
        >
          <Text style={styles.buttonText}>Área de Admin</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DE LOGIN ADMIN
         A known issue in expo-router prevents Modals from rendering on top of a Stack.
         Wrapping the Modal in a full-screen absolute-positioned View resolves the
         problem where only a black overlay is shown【198878935596254†L240-L400】. */}
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
                  >
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
                {adminError && <Text style={styles.errorText}>{adminError}</Text>}
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
                >
                  <Text style={styles.submitButtonText}>Entrar</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      )}

      {/* MODAL DE LOGIN / REGISTO */}
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
                      setError(null);
                    }}
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
                      setError(null);
                    }}
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

                {error && <Text style={styles.errorText}>{error}</Text>}

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
                      >
                        <Text style={styles.submitButtonText}>Entrar</Text>
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
                      >
                        <Text style={styles.submitButtonText}>Criar Conta</Text>
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
  modalOuter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  // Wrapper used to work around an expo-router bug where Modal only shows a black
  // overlay when used inside a Stack. The wrapper fills the screen and gives
  // the Modal a positioned parent【198878935596254†L240-L400】.
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
