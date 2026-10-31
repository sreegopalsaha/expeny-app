import { AppText } from "@/components/core/app-text";
import Button from "@/components/core/button";
import React from "react";
import { StyleSheet, View } from "react-native";

type EmptyStateProps = {
  title: string;
  description: string;
  buttonLabel?: string;
  onPress?: () => void;
};

export default function EmptyState({
  title,
  description,
  buttonLabel,
  onPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText type="subtitle" style={styles.title}>
        {title}
      </AppText>
      <AppText type="default" style={styles.description}>
        {description}
      </AppText>
      {buttonLabel && onPress && (
        <Button onPress={onPress} style={styles.button}>
          {buttonLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    textAlign: "center",
    color: "#9ca3af",
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
});
