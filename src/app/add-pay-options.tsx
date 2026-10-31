import { AppText } from "@/components/core/app-text";
import { AppView } from "@/components/core/app-view";
import Button from "@/components/core/button";
import ScreenHeader from "@/components/core/screen-header";
import { addPaymentSource, getPaymentSources } from "@/services/database";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function AddPayOptionsScreen() {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (addAnother: boolean) => {
    if (!name.trim()) {
      if (!addAnother) {
        const sources = await getPaymentSources();
        if (sources.length > 0) {
          router.replace("/(tabs)");
          return;
        }
        Alert.alert("Required", "Please add at least one payment option.");
      } else {
        Alert.alert("Invalid Input", "Please enter a source name");
      }
      return;
    }

    setLoading(true);
    try {
      const numericBalance = parseFloat(balance) || 0;
      const finalName = name.trim().toUpperCase();

      await addPaymentSource(finalName, numericBalance);

      if (addAnother) {
        Alert.alert("Success", `${finalName} added!`);
        setName("");
        setBalance("");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error adding source:", error);
      Alert.alert("Error", "Failed to add payment source");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppView style={styles.container}>
      <ScreenHeader
        title="Payment Setup"
        subtitle="Add your payment methods and balances"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View>
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Source Name</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Main Account, Petty Cash"
                  placeholderTextColor="#6b7280"
                  value={name}
                  onChangeText={(text) => setName(text.toUpperCase())}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Current Balance</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#6b7280"
                  value={balance}
                  onChangeText={setBalance}
                  keyboardType="numeric"
                />
              </View>

              <AppText style={styles.infoText}>
                You can add or delete payments options later
              </AppText>
            </View>

            <View style={styles.buttonGroup}>
              <Button
                style={[styles.btn, styles.secondaryBtn]}
                textStyle={styles.secondaryBtnText}
                onPress={() => handleAdd(true)}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add another payment option"}
              </Button>

              <Button
                style={styles.btn}
                onPress={() => handleAdd(false)}
                disabled={loading}
              >
                Done
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  content: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 24,
  },
  form: {
    flex: 1,
    justifyContent: "space-between",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 10,
    color: "#d1d5db",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 18,
  },
  infoText: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  buttonGroup: {
    gap: 16,
  },
  btn: {
    width: "100%",
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  secondaryBtnText: {
    color: "#3b82f6",
  },
});
