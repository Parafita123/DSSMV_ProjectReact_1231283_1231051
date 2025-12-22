import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useCart, Order } from "../context/CartContext";
import { useAdmin } from "../context/AdminContext";
import { useAuth } from "../context/AuthContext";

export default function Conta() {
  const router = useRouter();
  const { orders } = useCart();
  const { user, updateUser, logout } = useAuth();
  const { addReport } = useAdmin();

  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  // State for reporting a specific order
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [reportOrderId, setReportOrderId] = useState<string | null>(null);
  const REPORT_TYPES = [
    "Pedido mal feito",
    "Item em falta",
    "Atraso na entrega",
    "Outro",
  ];
  const [selectedReportType, setSelectedReportType] = useState<string>(REPORT_TYPES[0]);
  const [reportDesc, setReportDesc] = useState("");

  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editNif, setEditNif] = useState(user?.nif || "");
  const [editAddress, setEditAddress] = useState(user?.address || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>A Minha Conta</Text>
        <Text style={styles.info}>
          Não tens sessão iniciada. Volta ao ecrã inicial e faz login ou
          regista uma conta.
        </Text>
      </View>
    );
  }

  const handleAskPassword = () => {
    setPasswordInput("");
    setPasswordError(null);
    setPasswordModalVisible(true);
  };

  const handleConfirmPassword = () => {
    if (passwordInput !== user.password) {
      setPasswordError("Password incorreta.");
      return;
    }
    setPasswordModalVisible(false);
    setCanEdit(true);
  };

  const handleSaveChanges = async () => {
    await updateUser({
      name: editName,
      email: editEmail,
      nif: editNif,
      address: editAddress,
      phone: editPhone,
    });
    setCanEdit(false);
  };

  const handleLogout = () => {
    logout();
    router.replace("/"); // volta para o ecrã inicial
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const date = new Date(item.createdAt);
    return (
      <View style={styles.orderCard}>
        <Text style={styles.orderTitle}>
          Pedido #{item.id} - {item.total.toFixed(2)} €
        </Text>
        <Text style={styles.orderDate}>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>
        <Text style={styles.orderItemsTitle}>Refeições:</Text>
        {item.items.map((meal, index) => (
          <Text key={index} style={styles.orderItem}>
            • {meal.name} ({meal.price.toFixed(2)} €)
          </Text>
        ))}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => {
            setReportOrderId(item.id);
            setSelectedReportType(REPORT_TYPES[0]);
            setReportDesc("");
            setReportModalVisible(true);
          }}
        >
          <Text style={styles.reportButtonText}>Reportar Problema</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>A Minha Conta</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {!canEdit ? (
        <>
          <Text style={styles.info}>Os teus dados atuais:</Text>
          <View style={styles.dataBlock}>
            <Text style={styles.dataItem}>Nome: {user.name}</Text>
            <Text style={styles.dataItem}>Email: {user.email}</Text>
            <Text style={styles.dataItem}>NIF: {user.nif}</Text>
            <Text style={styles.dataItem}>Morada: {user.address}</Text>
            <Text style={styles.dataItem}>Telemóvel: {user.phone}</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleAskPassword}
          >
            <Text style={styles.editButtonText}>Editar dados</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.info}>Editar dados da conta:</Text>

          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
            placeholder="Nome"
          />
          <TextInput
            style={styles.input}
            value={editEmail}
            onChangeText={setEditEmail}
            placeholder="Email"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={editNif}
            onChangeText={setEditNif}
            placeholder="NIF"
          />
          <TextInput
            style={styles.input}
            value={editAddress}
            onChangeText={setEditAddress}
            placeholder="Morada"
          />
          <TextInput
            style={styles.input}
            value={editPhone}
            onChangeText={setEditPhone}
            placeholder="Telemóvel"
          />

          <View style={styles.editButtonsRow}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: "#BDBDBD" }]}
              onPress={() => setCanEdit(false)}
            >
              <Text style={styles.saveButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveChanges}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Text style={styles.historyTitle}>Pedidos efetuados</Text>

      {orders.length === 0 ? (
        <Text style={styles.noOrders}>Ainda não fizeste nenhum pedido.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.historyList}
        />
      )}

      <Text style={styles.footer}>
        No futuro, estes dados podem ser guardados numa base de dados via API,
        permitindo também calcular faturamento na área de admin.
      </Text>

      {/* Modal para reportar um pedido */}
      <Modal
        visible={isReportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOuter}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reportar Pedido</Text>
            <Text style={styles.modalInfo}>
              Seleciona o tipo de problema e descreve o que aconteceu.
            </Text>
            {REPORT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.reportTypeRow}
                onPress={() => setSelectedReportType(type)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    selectedReportType === type && styles.radioOuterActive,
                  ]}
                >
                  {selectedReportType === type && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.reportTypeLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Descreve o problema (máx 4000 carateres)"
              value={reportDesc}
              onChangeText={setReportDesc}
              multiline
              maxLength={4000}
            />
            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: "#BDBDBD" }]}
                onPress={() => setReportModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (!reportOrderId || !user) return;
                  addReport({
                    clientEmail: user.email,
                    orderId: reportOrderId,
                    type: selectedReportType,
                    description: reportDesc,
                  });
                  setReportModalVisible(false);
                }}
              >
                <Text style={styles.saveButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para pedir password antes de editar */}
      <Modal
        visible={isPasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOuter}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Password</Text>
            <Text style={styles.modalInfo}>
              Introduz a password da conta para poderes editar os dados.
            </Text>
            {passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={passwordInput}
              onChangeText={setPasswordInput}
            />
            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: "#BDBDBD" }]}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleConfirmPassword}
              >
                <Text style={styles.saveButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#FF6F59",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  info: {
    fontSize: 16,
    color: "#444",
    marginBottom: 10,
  },
  dataBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  dataItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  editButton: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
    backgroundColor: "#FFF",
  },
  editButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // Remove gap property as it is not supported in React Native versions prior to 0.71.
    // Spacing between children can be handled via margin on the child components if needed.
    // gap: 8,
    marginBottom: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#FF6F59",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  noOrders: {
    fontSize: 14,
    color: "#555",
  },
  historyList: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  orderItemsTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 2,
  },
  orderItem: {
    fontSize: 13,
    color: "#555",
  },
  reportButton: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  reportButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 10,
    fontSize: 13,
    color: "#666",
  },
  // For report modal radio buttons
  reportTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FF9F1C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioOuterActive: {
    borderColor: "#FF6F59",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6F59",
  },
  reportTypeLabel: {
    fontSize: 14,
    color: "#333",
  },
  modalOuter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 6,
  },
  modalInfo: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 6,
    fontSize: 13,
  },
});
