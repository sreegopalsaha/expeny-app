import { Colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../core/app-text";
import { AppView } from "../core/app-view";

interface PocketCardProps {
  title: string;
  total: number;
  spent: number;
}

const PocketCard: React.FC<PocketCardProps> = ({ title, total, spent }) => {
  const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;

  return (
    <AppView type="secondary" style={styles.card}>
      <View style={styles.row}>
        <AppText type="defaultSemiBold">{title}</AppText>
        <AppText type="default">{`₹${spent.toLocaleString()} / ₹${total.toLocaleString()}`}</AppText>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
    </AppView>
  );
};

export default PocketCard;

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.buttonBackground,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.tint,
  },
});
