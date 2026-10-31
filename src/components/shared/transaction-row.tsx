import { AppText } from "@/components/core/app-text";
import { AppView } from "@/components/core/app-view";
import { formatAmount } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

export type TransactionRowProps = {
  title: string;
  subtitle?: string;
  amount: number;
  type?: "positive" | "negative" | "neutral";
  icon?: keyof typeof Ionicons.glyphMap;
  balance?: number;
  rightSubtitle?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function TransactionRow({
  title,
  subtitle,
  amount,
  type = "negative",
  icon,
  balance,
  rightSubtitle,
  onPress,
  style,
}: TransactionRowProps) {
  const isPositive = type === "positive";
  const isNeutral = type === "neutral";

  let color = "#ef4444";
  if (isPositive) color = "#22c55e";
  if (isNeutral) color = "#9ca3af";

  const iconName = icon || (isPositive ? "arrow-down-outline" : "arrow-up-outline");

  const iconBgColor = isPositive
    ? "rgba(34, 197, 94, 0.1)"
    : isNeutral
    ? "rgba(156, 163, 175, 0.1)"
    : "rgba(239, 68, 68, 0.1)";

  const formattedAmount = `${isPositive ? "+" : isNeutral ? "" : "-"}₹${formatAmount(Math.abs(amount))}`;

  const content = (
    <AppView type="secondary" style={styles.innerContainer}>
      <View style={styles.left}>
        <View style={[styles.iconBg, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={20} color={color} />
        </View>
        <View style={styles.textContainer}>
          <AppText style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          {subtitle && (
            <AppText style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <AppText style={[styles.amount, { color }]}>
          {formattedAmount}
        </AppText>
        {balance !== undefined && (
          <AppText style={styles.balance}>
            Bal: ₹{formatAmount(balance)}
          </AppText>
        )}
        {rightSubtitle && (
          <AppText style={styles.balance}>
            {rightSubtitle}
          </AppText>
        )}
      </View>
    </AppView>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.touchable, style]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.wrapper, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
  },
  touchable: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
  },
  innerContainer: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  balance: {
    fontSize: 12,
    color: "#6b7280",
  },
});
