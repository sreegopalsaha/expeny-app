import { AppText } from "@/components/core/app-text";
import { AppView } from "@/components/core/app-view";
import { getPaymentSources } from "@/services/database";
import type { PaymentSource } from "@/types/database";
import { formatAmount } from "@/utils/format";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface PaymentSourceSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PaymentSourceSelector({
  selectedId,
  onSelect,
}: PaymentSourceSelectorProps) {
  const [sources, setSources] = useState<PaymentSource[]>([]);

  useEffect(() => {
    let isMounted = true;
    getPaymentSources().then((data) => {
      if (isMounted) {
        setSources(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <AppText type="defaultSemiBold" style={styles.label}>
        Pay via / Receive in
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
      >
        {sources.map((source) => (
          <TouchableOpacity
            key={source.id}
            onPress={() => onSelect(source.id)}
            style={styles.cardTouchable}
          >
            <AppView
              type="secondary"
              style={[
                styles.card,
                selectedId === source.id && styles.cardSelected,
              ]}
            >
              <AppText
                type="defaultSemiBold"
                style={[
                  styles.cardTitle,
                  selectedId === source.id && styles.cardTextSelected,
                ]}
              >
                {source.name}
              </AppText>
              <AppText
                type="default"
                style={[
                  styles.cardBalance,
                  selectedId === source.id && styles.cardTextSelected,
                ]}
              >
                ₹{formatAmount(source.balance)}
              </AppText>
            </AppView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 12,
    color: "#d1d5db",
  },
  scroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
  cardTouchable: {
    marginRight: 10,
  },
  card: {
    width: 110,
    height: 70,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  cardTitle: {
    fontSize: 14,
    color: "#e5e5e5",
  },
  cardBalance: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  cardTextSelected: {
    color: "#ffffff",
  },
});
