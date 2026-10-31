import { AppText } from "@/components/core/app-text";
import { AppView } from "@/components/core/app-view";
import ScreenHeader from "@/components/core/screen-header";
import EmptyState from "@/components/shared/empty-state";
import SwipeableItem from "@/components/shared/swipeable-item";
import TransactionRow from "@/components/shared/transaction-row";
import {
  deletePocketTransaction,
  deleteTransaction,
  deleteUdhaarTransaction,
  getUniversalHistory,
} from "@/services/database";
import type { UniversalTransaction } from "@/types/database";
import { formatDate } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, SectionList, StyleSheet } from "react-native";

interface SectionData {
  title: string;
  data: UniversalTransaction[];
}

export default function HistoryScreen() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const history = await getUniversalHistory();

      const grouped: { [key: string]: UniversalTransaction[] } = {};
      history.forEach((item) => {
        const dateKey = formatDate(item.date);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(item);
      });

      const sectionsData = Object.keys(grouped).map((key) => ({
        title: key,
        data: grouped[key],
      }));

      setSections(sectionsData);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleDelete = (item: UniversalTransaction) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure? This will reverse the balance changes.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (item.sourceType === "regular") {
                await deleteTransaction(item.id);
              } else if (item.sourceType === "pocket") {
                await deletePocketTransaction(item.id);
              } else if (item.sourceType === "udhaar") {
                await deleteUdhaarTransaction(item.id);
              }
              await loadHistory();
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert("Error", "Failed to delete transaction");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: UniversalTransaction }) => {
    const isDebit =
      item.type === "debit" || item.type === "spend" || item.type === "give";

    const iconName: keyof typeof Ionicons.glyphMap | undefined =
      item.sourceType === "pocket"
        ? "wallet-outline"
        : item.sourceType === "udhaar"
        ? "people-outline"
        : undefined;

    let subtitle = item.subtitle;
    if (item.paymentSourceName) {
      subtitle = `${subtitle} • ${item.paymentSourceName}`;
    }

    return (
      <SwipeableItem onDelete={() => handleDelete(item)} deleteLabel="Delete">
        <TransactionRow
          title={item.title}
          subtitle={subtitle}
          amount={item.amount}
          type={isDebit ? "negative" : "positive"}
          icon={iconName}
          balance={item.balanceAfterTransaction}
          style={{ marginBottom: 0 }}
        />
      </SwipeableItem>
    );
  };

  return (
    <AppView style={styles.container}>
      <ScreenHeader title="History" subtitle="All your financial moves" />
      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <AppText type="defaultSemiBold" style={styles.sectionHeader}>
              {title}
            </AppText>
          )}
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <EmptyState
              title="No history yet"
              description="Start making transactions to see them here."
            />
          }
        />
      )}
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    color: "#9ca3af",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
