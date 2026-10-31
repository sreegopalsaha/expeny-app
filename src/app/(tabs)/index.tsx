import { AppText } from "@/components/core/app-text";
import { AppView } from "@/components/core/app-view";
import Button from "@/components/core/button";
import ScreenHeader from "@/components/core/screen-header";
import { transactionSchema } from "@/constants/schemas";
import {
  addTransaction,
  checkDailyStreak,
  deletePaymentSource,
  getPaymentSources,
} from "@/services/database";
import type { PaymentSource } from "@/types/database";
import { formatAmount } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

export default function HomeScreen() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentSource[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPaymentSources = useCallback(async () => {
    try {
      const sources = await getPaymentSources();
      setPaymentMethods(sources);
    } catch (error) {
      console.error("Error loading payment sources:", error);
      Alert.alert("Error", "Failed to load payment sources");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPaymentSources();
    }, [loadPaymentSources])
  );

  const totalBalance = paymentMethods.reduce((acc, m) => acc + (m.balance || 0), 0);

  const handleTransaction = async (type: "credit" | "debit") => {
    if (!amount || !selectedMethodId) {
      Alert.alert("Error", "Enter amount and select a payment method.");
      return;
    }

    const amountNum = parseFloat(amount);

    try {
      transactionSchema.parse({
        amount: amountNum,
        description: description,
        paymentSourceId: selectedMethodId,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        Alert.alert("Invalid Input", error.issues[0].message);
        return;
      }
    }

    setLoading(true);
    try {
      await addTransaction(
        selectedMethodId,
        type,
        amountNum,
        description || undefined
      );

      await checkDailyStreak();
      await loadPaymentSources();

      Alert.alert(
        "Success",
        `${type === "credit" ? "Added" : "Spent"} ₹${formatAmount(amountNum)} ${
          description ? `(${description})` : ""
        }`
      );

      setAmount("");
      setDescription("");
      setSelectedMethodId(null);
    } catch (error) {
      console.error("Error adding transaction:", error);
      Alert.alert("Error", "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    router.push("/add-pay-options");
  };

  const handleLongPressPaymentMethod = (id: string, name: string) => {
    Alert.alert(
      "Delete Payment Source",
      `Do you want to delete '${name}'?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deletePaymentSource(id);
              if (result === "CANNOT_DELETE") {
                Alert.alert(
                  "Cannot Delete",
                  `The payment source "${name}" is linked to existing transactions. \n\nIf you still want to remove this source, you’ll need to delete all transactions associated with it first.`
                );
              } else {
                await loadPaymentSources();
                if (selectedMethodId === id) setSelectedMethodId(null);
                Alert.alert("Deleted", `'${name}' has been deleted.`);
              }
            } catch (error) {
              console.error("Error deleting source:", error);
              Alert.alert("Error", "Failed to delete payment source");
            }
          },
        },
      ]
    );
  };

  return (
    <AppView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title={`₹ ${formatAmount(totalBalance)}`}
          subtitle="This is your total money"
        />

        <View style={styles.contentWrapper}>
          <View style={styles.inputSection}>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#9AA0A6"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a note (optional)"
              placeholderTextColor="#9AA0A6"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.paymentMethodsSection}>
            <AppText type="defaultSemiBold" style={styles.sectionTitle}>
              Select Payment Method
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="always"
            >
              {paymentMethods.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setSelectedMethodId(m.id)}
                  onLongPress={() => handleLongPressPaymentMethod(m.id, m.name)}
                  delayLongPress={500}
                  style={styles.cardTouchable}
                >
                  <AppView
                    type="secondary"
                    style={[
                      styles.card,
                      selectedMethodId === m.id && styles.cardSelected,
                    ]}
                  >
                    <AppText
                      type="defaultSemiBold"
                      style={[
                        styles.cardTitle,
                        selectedMethodId === m.id && styles.cardTextSelected,
                      ]}
                    >
                      {m.name}
                    </AppText>
                    <AppText
                      type="default"
                      style={[
                        styles.cardBalance,
                        selectedMethodId === m.id && styles.cardTextSelected,
                      ]}
                    >
                      ₹{formatAmount(m.balance)}
                    </AppText>
                  </AppView>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cardTouchable}
                onPress={handleAddNew}
              >
                <View style={styles.addCard}>
                  <Ionicons name="add" size={24} color="#A7A7AA" />
                  <AppText type="default" style={styles.addCardText}>
                    Add New
                  </AppText>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.actionRow}>
            <Button
              icon="add-circle-outline"
              iconColor="green"
              onPress={() => !loading && handleTransaction("credit")}
              style={[styles.actionBtn, loading && styles.disabledBtn]}
            >
              {loading ? "Processing..." : "Add Money"}
            </Button>

            <Button
              icon="remove-circle-outline"
              iconColor="red"
              onPress={() => !loading && handleTransaction("debit")}
              style={[styles.actionBtn, loading && styles.disabledBtn]}
            >
              {loading ? "Processing..." : "Spend Money"}
            </Button>
          </View>
        </View>
      </ScrollView>
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  contentWrapper: {
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  inputSection: {
    gap: 12,
    marginBottom: 24,
  },
  amountInput: {
    width: "100%",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    color: "#E5E5E5",
    fontSize: 38,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 0,
  },
  descriptionInput: {
    width: "100%",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: "#E5E5E5",
    fontSize: 16,
  },
  paymentMethodsSection: {
    marginBottom: 30,
    width: "100%",
  },
  sectionTitle: {
    color: "#E5E5E5",
    fontSize: 18,
    marginBottom: 12,
    paddingLeft: 4,
  },
  scroll: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  cardTouchable: {
    marginRight: 10,
  },
  card: {
    width: 120,
    height: 90,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderWidth: 1,
    borderColor: "transparent",
  },
  addCard: {
    width: 120,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3C",
    gap: 4,
  },
  addCardText: {
    color: "#A7A7AA",
    fontSize: 14,
  },
  cardSelected: {
    backgroundColor: "#8AB4F8",
    borderColor: "#8AB4F8",
  },
  cardTitle: {
    color: "#E5E5E5",
    fontSize: 15,
    fontWeight: "600",
  },
  cardBalance: {
    color: "#A7A7AA",
    fontSize: 13,
    marginTop: 4,
  },
  cardTextSelected: {
    color: "#1C1C1E",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: "auto",
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
