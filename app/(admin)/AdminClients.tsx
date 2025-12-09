import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAdmin } from "../context/AdminContext";
import { getAllOrders } from "../context/CartContext";

/**
 * Screen for administrators to view and manage client accounts. Allows banning
 * and blocking clients, inspecting their recent orders and reports, and
 * resolving issues reported by customers.
 */
export default function AdminClients() {
  const {
    clients,
    banClient,
    unbanClient,
    blockClient,
    unblockClient,
    reports,
    resolveReport,
  } = useAdmin();

  const orders = getAllOrders();

  const getClientOrders = (email: string) => {
    return orders.filter((o) => o.clientEmail === email);
  };

  const getClientReports = (email: string) => {
    return reports.filter((r) => r.clientEmail === email);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Clientes</Text>
      {clients.length === 0 ? (
        <Text style={styles.noData}>Sem clientes registados.</Text>
      ) : (
        clients.map((client) => {
          const clientOrders = getClientOrders(client.email);
          const clientReports = getClientReports(client.email);
          return (
            <View key={client.email} style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.cardTitle}>{client.name}</Text>
                <Text style={styles.cardSubtitle}>{client.email}</Text>
              </View>
              <View style={styles.actionsRow}>
                {client.banned ? (
                  <TouchableOpacity
                    style={styles.unbanButton}
                    onPress={() => unbanClient(client.email)}
                  >
                    <Text style={styles.actionText}>Desbanir</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.banButton}
                    onPress={() => banClient(client.email)}
                  >
                    <Text style={styles.actionText}>Banir</Text>
                  </TouchableOpacity>
                )}
                {client.blocked ? (
                  <TouchableOpacity
                    style={styles.unblockButton}
                    onPress={() => unblockClient(client.email)}
                  >
                    <Text style={styles.actionText}>Desbloquear</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.blockButton}
                    onPress={() => blockClient(client.email)}
                  >
                    <Text style={styles.actionText}>Bloquear</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pedidos Recentes</Text>
                {clientOrders.length === 0 ? (
                  <Text style={styles.noData}>Este cliente não tem pedidos.</Text>
                ) : (
                  clientOrders.slice(0, 3).map((order) => (
                    <View key={order.id} style={styles.orderRow}>
                      <Text style={styles.orderText}>
                        #{order.id} - {order.total.toFixed(2)} €
                      </Text>
                      <TouchableOpacity
                        style={styles.renewButton}
                        onPress={() => {
                          // A real implementation would copy this order's items back to the client's cart.
                          alert(
                            "Função de renovar pedido ainda não está implementada."
                          );
                        }}
                      >
                        <Text style={styles.renewButtonText}>Renovar</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reports</Text>
                {clientReports.length === 0 ? (
                  <Text style={styles.noData}>Sem reports para este cliente.</Text>
                ) : (
                  clientReports.map((report) => (
                    <View key={report.id} style={styles.reportRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reportType}>{report.type}</Text>
                        <Text style={styles.reportDesc} numberOfLines={2}>
                          {report.description}
                        </Text>
                        <Text style={styles.reportDate}>
                          {new Date(report.createdAt).toLocaleString()}
                        </Text>
                      </View>
                      {report.resolved ? (
                        <Text style={styles.resolvedLabel}>Resolvido</Text>
                      ) : (
                        <TouchableOpacity
                          style={styles.resolveButton}
                          onPress={() => resolveReport(report.id)}
                        >
                          <Text style={styles.resolveButtonText}>Marcar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF6E5",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  headerRow: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#777",
  },
  actionsRow: {
    flexDirection: "row",
    // Remove gap property; not supported in older React Native versions.
    // gap: 8,
    marginBottom: 10,
  },
  banButton: {
    backgroundColor: "#FF6F59",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  unbanButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  blockButton: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  unblockButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9F1C",
    marginBottom: 4,
  },
  noData: {
    fontSize: 13,
    color: "#777",
    marginBottom: 4,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  orderText: {
    fontSize: 14,
    color: "#555",
  },
  renewButton: {
    backgroundColor: "#BDBDBD",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  renewButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  reportType: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  reportDesc: {
    fontSize: 13,
    color: "#555",
  },
  reportDate: {
    fontSize: 11,
    color: "#888",
  },
  resolvedLabel: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },
  resolveButton: {
    backgroundColor: "#FF6F59",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resolveButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});