import { Colors } from "@/constants/colors";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.primaryBackground }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: Colors.primaryBackground },
        }}
      >
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="welcome" options={{ animation: "none" }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="add-pay-options" />
        <Stack.Screen name="pocket-detail" />
        <Stack.Screen name="udhaar-detail" />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
