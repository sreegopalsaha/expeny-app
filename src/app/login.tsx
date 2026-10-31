import Button from "@/components/core/button";
import { userSchema } from "@/constants/schemas";
import { createUser } from "@/services/database";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

export default function LoginScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNext = async () => {
    setLoading(true);
    try {
      userSchema.parse({ name: name.trim(), email: email.trim() });
      await createUser(name.trim(), email.trim());
      router.replace("/add-pay-options");
    } catch (error) {
      if (error instanceof z.ZodError) {
        Alert.alert("Invalid Input", error.issues[0].message);
      } else {
        console.error("Login error:", error);
        Alert.alert("Error", "Failed to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Tell us about yourself</Text>

        <TextInput
          placeholder="Name"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <Button onPress={handleNext} style={styles.btn} disabled={loading}>
        {loading ? "Processing..." : "Next"}
      </Button>

      <Text
        onPress={() => Linking.openURL("https://expeny.vercel.app/privacy")}
        style={styles.privacyLink}
      >
        Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  form: {
    marginTop: 100,
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#1f2937",
    color: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  btn: {
    marginTop: 20,
  },
  privacyLink: {
    color: "#4B5563",
    textAlign: "center",
    marginTop: 30,
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
