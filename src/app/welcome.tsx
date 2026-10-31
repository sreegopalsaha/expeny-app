import { AppText } from "@/components/core/app-text";
import { AppView } from "@/components/core/app-view";
import Button from "@/components/core/button";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AppView style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Expeny</Text>
        <Text style={styles.subtitle}>Money vibes, always in check</Text>
      </View>
      <View style={styles.bottomContent}>
        <Button
          onPress={() => {
            router.replace("/login");
          }}
        >
          Continue with Email
        </Button>
        <AppText style={styles.terms}>
          By continuing you agree to{" "}
          <Text
            style={styles.link}
            onPress={() => {
              Linking.openURL("https://expeny.vercel.app/terms");
            }}
          >
            Terms
          </Text>{" "}
          and{" "}
          <Text
            style={styles.link}
            onPress={() => {
              Linking.openURL("https://expeny.vercel.app/privacy");
            }}
          >
            Privacy Policy
          </Text>
        </AppText>
      </View>
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 6,
  },
  bottomContent: {
    width: "100%",
    alignItems: "center",
  },
  terms: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
  },
  link: {
    color: "#60a5fa",
  },
});
