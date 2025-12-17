import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchTable, deleteRows, insertRow } from "../supabase";
import { useAdmin } from "../context/AdminContext";

/**
 * Screen that lists all recipe suggestions submitted by clients via the
 * SugerirReceita screen.  Administrators can review each suggestion
 * and either remove it or add it to the official menu.  Adding to
 * the menu opens a form prefilled with the suggestion's name.  On
 * submission, the new meal is inserted into the "meals" table and
 * removed from the suggestions table.
 */
export default function AdminSuggestions() {
  const router = useRouter();
  const { addMeal } = useAdmin();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTable("suggestions", "*");
      // Sort by creation date descending so that recent suggestions appear first
      const sorted = data.sort((a: any, b: any) =>
        a.createdAt < b.createdAt ? 1 : -1
      );
      setSuggestions(sorted);
    } catch (err: any) {
      console.error(err);
      // If the table does not exist in Supabase, inform the admin.
      const msg: string = err.message || "";
      if (msg.includes("Could not find the table")) {
        setError(
          "Tabela 'suggestions' não encontrada na base de dados Supabase. Crie a tabela para ativar esta funcionalidade."
        );
        setSuggestions([]);
      } else {
        setError(
          msg ||
            "Erro ao carregar sugestões. Verifica a tua ligação ou tenta novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await deleteRows("suggestions", `id=eq.${id}`);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(
        err.message || "Erro ao remover sugestão. Tenta novamente mais tarde."
      );
    }
  };

  const handleAddToMenu = (suggestion: any) => {
    setSelected(suggestion);
    setForm({
      name: suggestion.name || "",
      description: suggestion.description || "",
      category: "",
      price: "",
      stock: "1",
    });
  };

  const submitMeal = async () => {
    if (!selected) return;
    // Validate mandatory fields
    if (!form.name || !form.description || !form.category || !form.price) {
      alert("Preenche todos os campos.");
      return;
    }
    setSubmitting(true);
    try {
      // Insert into Supabase meals table
      await insertRow("meals", {
        name: form.name,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        available: parseInt(form.stock) > 0,
        spicy: false,
        promo: null,
      });
      // Remove suggestion from Supabase
      await deleteRows("suggestions", `id=eq.${selected.id}`);
      // Also update local admin context so the meal is visible immediately
      addMeal({
        name: form.name,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price),
        spicy: false,
        stock: parseInt(form.stock) || 0,
      });
      setSuggestions((prev) => prev.filter((s) => s.id !== selected.id));
      setSelected(null);
      alert("Refeição adicionada ao menu com sucesso!");
    } catch (err: any) {
      console.error(err);
      alert(
        err.message ||
          "Erro ao adicionar refeição. Verifica a tua ligação ou tenta novamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sugestões de Receitas</Text>
      {loading && <ActivityIndicator size="large" color="#FF6F59" />} 
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && suggestions.length === 0 && (
        <Text style={styles.emptyText}>Ainda não existem sugestões.</Text>
      )}
      {suggestions.map((sug) => (
        <View key={sug.id} style={styles.card}>
          <Text style={styles.cardTitle}>{sug.name}</Text>
          <Text style={styles.cardMeta}>
            Submetido por: {sug.clientEmail} em {new Date(sug.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.cardContent}>{sug.description}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemove(sug.id)}
            >
              <Text style={styles.actionButtonText}>Remover</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton]}
              onPress={() => handleAddToMenu(sug)}
            >
              <Text style={styles.actionButtonText}>Adicionar ao Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {/* Modal for adding a suggestion to the menu */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar ao Menu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da Refeição"
              value={form.name}
              onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Descrição"
              value={form.description}
              onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Categoria"
              value={form.category}
              onChangeText={(text) => setForm((prev) => ({ ...prev, category: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço (€)"
              keyboardType="numeric"
              value={form.price}
              onChangeText={(text) => setForm((prev) => ({ ...prev, price: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock inicial"
              keyboardType="numeric"
              value={form.stock}
              onChangeText={(text) => setForm((prev) => ({ ...prev, stock: text }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSelected(null)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={submitMeal}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FFF6E5",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  cardMeta: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  removeButton: {
    backgroundColor: "#FF3B30",
  },
  addButton: {
    backgroundColor: "#34C759",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 12,
    textAlign: "center",
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
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#AAA",
  },
  confirmButton: {
    backgroundColor: "#34C759",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});