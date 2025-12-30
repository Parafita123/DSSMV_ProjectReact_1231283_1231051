// app/(admin)/AdminEmployees.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useAdminStore } from "../../src/react/hooks/useAdminStore";
import { AdminActions } from "../../src/flux/actions/admin.action";
import type { Employee } from "../../src/flux/types/admin.types";

/**
 * AdminEmployees (FLUX)
 * Lógica igual ao Context:
 * - listar funcionários
 * - adicionar
 * - remover
 */
export default function AdminEmployees() {
  const { employees, loading, error } = useAdminStore();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // carrega lista ao entrar no ecrã
    void AdminActions.initEmployees();
  }, []);

  const handleAdd = async () => {
    if (!name.trim() || !role.trim() || !email.trim()) return;

    await AdminActions.addEmployee({
      name: name.trim(),
      role: role.trim(),
      email: email.trim(),
    });

    setName("");
    setRole("");
    setEmail("");
    // feedback visual igual ao teu
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const handleRemove = async (id: string) => {
    await AdminActions.removeEmployee(id);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gestão de Funcionários</Text>
      <Text style={styles.subtitle}>Adiciona ou remove funcionários.</Text>

      {loading && (
        <View style={{ marginBottom: 10 }}>
          <ActivityIndicator />
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Cargo"
          value={role}
          onChangeText={setRole}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {submitted && (
          <Text style={styles.success}>Funcionário adicionado!</Text>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Adicionar Funcionário</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Funcionários Atuais</Text>

      {employees.length === 0 ? (
        <Text style={styles.noEmployees}>Não há funcionários registados.</Text>
      ) : (
        employees.map((emp: Employee) => (
          <View key={emp.id} style={styles.empCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.empName}>{emp.name}</Text>
              <Text style={styles.empRole}>{emp.role}</Text>
              <Text style={styles.empEmail}>{emp.email}</Text>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemove(emp.id)}
            >
              <Text style={styles.removeButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
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
  error: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 13,
  },
  form: {
    marginBottom: 30,
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
    marginBottom: 10,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  noEmployees: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },
  empCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  empName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  empRole: {
    fontSize: 13,
    color: "#FF9F1C",
  },
  empEmail: {
    fontSize: 13,
    color: "#777",
  },
  removeButton: {
    backgroundColor: "#FF6F59",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
