import { AppView } from "@/components/core/app-view";
import { getUser, initializeDatabase } from "@/services/database";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function Index() {
  const [authState, setAuthState] = useState<"loading" | "logged_in" | "logged_out">("loading");

  useEffect(() => {
    let isMounted = true;
    async function setupAndCheckAuth() {
      try {
        await initializeDatabase();
        const user = await getUser();
        if (isMounted) {
          setAuthState(user ? "logged_in" : "logged_out");
        }
      } catch (e) {
        console.error("Auth check failed", e);
        if (isMounted) {
          setAuthState("logged_out");
        }
      } finally {
        SplashScreen.hideAsync().catch(() => {});
      }
    }
    setupAndCheckAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  if (authState === "loading") {
    return (
      <AppView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </AppView>
    );
  }

  if (authState === "logged_in") {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}
