import { AppText } from "@/components/core/app-text";
import Button from "@/components/core/button";
import PaymentSourceSelector from "@/components/shared/payment-source-selector";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface TransactionModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (amount: number, description: string, paymentSourceId: string) => void;
  submitLabel?: string;
  type?: "credit" | "debit";
}

export default function TransactionModal({
  visible,
  title,
  onClose,
  onSubmit,
  submitLabel = "Submit",
}: TransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentSourceId, setPaymentSourceId] = useState<string | null>(null);

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!paymentSourceId) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    onSubmit(amountNum, description.trim(), paymentSourceId);
    setAmount("");
    setDescription("");
    setPaymentSourceId(null);
  };

  const handleClose = () => {
    setAmount("");
    setDescription("");
    setPaymentSourceId(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.overlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <AppText type="subtitle" style={styles.title}>
                {title}
              </AppText>
              <Ionicons
                name="close"
                size={24}
                color="#9ca3af"
                onPress={handleClose}
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Amount</AppText>
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="0"
                placeholderTextColor="#6b7280"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Description (Optional)</AppText>
              <TextInput
                style={styles.input}
                placeholder="What is this for?"
                placeholderTextColor="#6b7280"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <PaymentSourceSelector
              selectedId={paymentSourceId}
              onSelect={setPaymentSourceId}
            />

            <Button onPress={handleSubmit} style={styles.submitBtn}>
              {submitLabel}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    color: "#fff",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: "#d1d5db",
  },
  input: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  submitBtn: {
    marginTop: 8,
  },
});
