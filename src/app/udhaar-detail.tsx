import { AppView } from "@/components/core/app-view";
import Button from "@/components/core/button";
import ScreenHeader from "@/components/core/screen-header";
import EmptyState from "@/components/shared/empty-state";
import TransactionModal from "@/components/shared/transaction-modal";
import TransactionRow from "@/components/shared/transaction-row";
import {
  addUdhaarTransaction,
  getUdhaarFriendBalance,
  getUdhaarTransactions,
} from "@/services/database";
import type { UdhaarTransaction } from "@/types/database";
import { formatAmount } from "@/utils/format";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UdhaarDetailScreen() {
  const { friendId, friendName } = useLocalSearchParams<{
    friendId: string;
    friendName: string;
  }>();

  const [transactions, setTransactions] = useState<UdhaarTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"give" | "take">("give");
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    if (!friendId) return;

    try {
      const txs = await getUdhaarTransactions(friendId);
      setTransactions(txs);

      const balance = await getUdhaarFriendBalance(friendId);
      setTotal(balance.balance);
    } catch (error) {
      console.error("Error loading transactions:", error);
      Alert.alert("Error", "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [friendId]);

  useFocusEffect(
    useCallback(() => {
      if (friendId) {
        loadTransactions();
      }
    }, [friendId, loadTransactions])
  );

  const handleAdd = async (
    amount: number,
    description: string,
    paymentSourceId: string
  ) => {
    if (!friendId) return;

    try {
      await addUdhaarTransaction(
        friendId,
        modalType,
        amount,
        description,
        paymentSourceId
      );
      await loadTransactions();
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      Alert.alert("Error", "Failed to add transaction");
    }
  };

  const openModal = (type: "give" | "take") => {
    setModalType(type);
    setModalVisible(true);
  };

  const subtitle =
    total === 0
      ? "All settled up"
      : total > 0
      ? `You will get ₹${formatAmount(total)}`
      : `You will give ₹${formatAmount(Math.abs(total))}`;

  return (
    <AppView style={styles.container}>
      <View style={styles.content}>
        <ScreenHeader
          title={friendName || "Friend"}
          subtitle={subtitle}
        />

        {isLoading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Track every amount you give or take to always stay clear on balances."
          />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isGive = item.type === "give";
              return (
                <TransactionRow
                  title={isGive ? "You Gave" : "You Took"}
                  subtitle={new Date(item.date).toLocaleDateString()}
                  rightSubtitle={item.description}
                  amount={item.amount}
                  type={isGive ? "negative" : "positive"}
                />
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      <SafeAreaView edges={["bottom"]}>
        <View style={styles.bottomButtons}>
          <Button
            onPress={() => openModal("give")}
            icon="arrow-up-circle-outline"
            style={styles.actionBtn}
          >
            I Gave
          </Button>

          <Button
            onPress={() => openModal("take")}
            icon="arrow-down-circle-outline"
            style={styles.actionBtn}
          >
            I Took
          </Button>
        </View>
      </SafeAreaView>

      <TransactionModal
        visible={modalVisible}
        title={modalType === "give" ? "You Gave" : "You Took"}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAdd}
        submitLabel="Add Record"
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
  content: {
    flex: 1,
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
