import { AppText } from "@/components/core/app-text";
import { AppView } from "@/components/core/app-view";
import Button from "@/components/core/button";
import ScreenHeader from "@/components/core/screen-header";
import EmptyState from "@/components/shared/empty-state";
import TransactionModal from "@/components/shared/transaction-modal";
import TransactionRow from "@/components/shared/transaction-row";
import {
  addPocketTransaction,
  getPocketTransactions,
  getPockets,
} from "@/services/database";
import type { PocketTransaction } from "@/types/database";
import { formatAmount } from "@/utils/format";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PocketDetailScreen() {
  const { pocketId, title, total } = useLocalSearchParams<{
    pocketId: string;
    title: string;
    total: string;
  }>();

  const [transactions, setTransactions] = useState<PocketTransaction[]>([]);
  const [pocketStats, setPocketStats] = useState<{ spent: number; total: number }>({
    spent: 0,
    total: parseFloat(total || "0"),
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"spend" | "add">("spend");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const txs = await getPocketTransactions(pocketId);
      setTransactions(txs);

      const allPockets = await getPockets();
      const currentPocket = allPockets.find((p) => p.id === pocketId);
      if (currentPocket) {
        setPocketStats({
          spent: currentPocket.spent,
          total: currentPocket.total,
        });
      }
    } catch (error) {
      console.error("Error loading pocket data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pocketId]);

  useFocusEffect(
    useCallback(() => {
      if (pocketId) {
        loadData();
      }
    }, [pocketId, loadData])
  );

  const handleAddTransaction = async (
    amount: number,
    description: string,
    paymentSourceId: string
  ) => {
    try {
      await addPocketTransaction(
        pocketId,
        amount,
        modalType,
        paymentSourceId,
        description
      );
      await loadData();
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding pocket transaction:", error);
      Alert.alert("Error", "Failed to add transaction");
    }
  };

  const openModal = (type: "spend" | "add") => {
    setModalType(type);
    setModalVisible(true);
  };

  const remaining = pocketStats.total - pocketStats.spent;

  return (
    <AppView style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScreenHeader
          title={title || "Pocket"}
          subtitle={`Budget: ₹${formatAmount(pocketStats.total)}`}
        />

        <View style={styles.summaryCard}>
          <View>
            <AppText style={styles.label}>Available</AppText>
            <AppText
              style={[
                styles.bigAmount,
                { color: remaining < 0 ? "#ef4444" : "#fff" },
              ]}
            >
              ₹{formatAmount(remaining)}
            </AppText>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <AppText style={styles.label}>Spent</AppText>
            <AppText style={styles.spentAmount}>
              ₹{formatAmount(pocketStats.spent)}
            </AppText>
          </View>
        </View>

        <View style={styles.listContainer}>
          <AppText type="defaultSemiBold" style={styles.sectionTitle}>
            Recent Activity
          </AppText>
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Start spending from this pocket to track your budget."
            />
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSpend = item.type === "spend";
                return (
                  <TransactionRow
                    title={item.description || (isSpend ? "Spent" : "Added")}
                    subtitle={new Date(item.date).toLocaleDateString()}
                    amount={item.amount}
                    type={isSpend ? "negative" : "positive"}
                  />
                );
              }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      <SafeAreaView edges={["bottom"]}>
        <View style={styles.bottomButtons}>
          <Button
            onPress={() => openModal("add")}
            icon="add-circle-outline"
            style={styles.actionBtn}
          >
            Add Funds
          </Button>
          <Button
            onPress={() => openModal("spend")}
            icon="remove-circle-outline"
            style={styles.actionBtn}
          >
            Spend
          </Button>
        </View>
      </SafeAreaView>

      <TransactionModal
        visible={modalVisible}
        title={modalType === "spend" ? "Spend from Pocket" : "Add to Pocket"}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddTransaction}
        submitLabel={modalType === "spend" ? "Record Expense" : "Add Funds"}
      />
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  summaryCard: {
    backgroundColor: "#1f2937",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  label: {
    color: "#9ca3af",
    marginBottom: 4,
    fontSize: 14,
  },
  bigAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  spentAmount: {
    fontSize: 20,
    color: "#ef4444",
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
    color: "#e5e5e5",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
});
