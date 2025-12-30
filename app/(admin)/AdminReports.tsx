// app/(admin)/AdminReports.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

// ✅ Flux hook + actions
import { useAdminStore } from "../../src/react/hooks/useAdminStore";
import { AdminActions } from "../../src/flux/actions/admin.action";

export default function AdminReports() {
  const { reports } = useAdminStore();

  // newest first (sem mutar o array original do store)
  const sortedReports = useMemo(() => {
    const arr = reports ?? [];
    return [...arr].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reports]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.subtitle}>
        Consulta os reports submetidos pelos clientes e marca-os como resolvidos
        quando apropriado.
      </Text>

      {sortedReports.length === 0 ? (
        <Text style={styles.noReports}>Não há reports recentes.</Text>
      ) : (
        sortedReports.map((report) => (
          <View key={report.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.reportType}>{report.type}</Text>
              <Text style={styles.reportDate}>
                {new Date(report.createdAt).toLocaleDateString()}{" "}
                {new Date(report.createdAt).toLocaleTimeString()}
              </Text>
            </View>

            <Text style={styles.reportDesc}>{report.description}</Text>

            <Text style={styles.reportInfo}>
              Cliente: {report.clientEmail} | Pedido #{report.orderId}
            </Text>

            {report.resolved ? (
              <Text style={styles.resolvedLabel}>Resolvido</Text>
            ) : (
              <TouchableOpacity
                style={styles.resolveButton}
                onPress={() => AdminActions.resolveReport(report.id)}
              >
                <Text style={styles.resolveButtonText}>Marcar Resolvido</Text>
              </TouchableOpacity>
            )}
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
  noReports: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  reportType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  reportDate: {
    fontSize: 12,
    color: "#777",
  },
  reportDesc: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  reportInfo: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  resolvedLabel: {
    backgroundColor: "#4CAF50",
    color: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    alignSelf: "flex-start",
  },
  resolveButton: {
    backgroundColor: "#FF6F59",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  resolveButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
