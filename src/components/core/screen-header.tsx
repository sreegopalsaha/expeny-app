import { AppText } from "@/components/core/app-text";
import React from "react";
import { StyleSheet, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText type="title" style={styles.title}>
        {title}
      </AppText>
      {subtitle && (
        <AppText type="default" style={styles.subtitle}>
          {subtitle}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 4,
  },
});
