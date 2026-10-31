import { Colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

export type AppViewProps = ViewProps & {
  type?: "primary" | "secondary";
};

export function AppView({ style, type = "primary", ...props }: AppViewProps) {
  return (
    <View
      style={[
        type === "primary" && styles.primary,
        type === "secondary" && styles.secondary,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.primaryBackground,
  },
  secondary: {
    backgroundColor: Colors.secondaryBackground,
  },
});
