import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../core/app-text";
import Button from "../core/button";

interface WalletCardProps {
  initialBalance: number;
  onWithdraw: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
  initialBalance,
  onWithdraw,
}) => {
  return (
    <View style={styles.walletCard}>
      <View style={styles.walletLeft}>
        <Ionicons name="wallet-outline" size={22} color="#fff" />
        <View>
          <AppText type="defaultSemiBold" style={styles.walletText}>
            Reward Wallet
          </AppText>
          <AppText type="title" style={styles.balance}>
            {initialBalance.toFixed(2)} XC
          </AppText>
        </View>
      </View>
      <Button
        style={[
          styles.withdrawButton,
          initialBalance <= 0 && styles.disabledButton,
        ]}
        disabled={initialBalance <= 0}
        onPress={initialBalance > 0 ? onWithdraw : undefined}
      >
        <AppText type="defaultSemiBold" style={styles.withdrawText}>
          Withdraw
        </AppText>
      </Button>
    </View>
  );
};

export default WalletCard;

const styles = StyleSheet.create({
  walletCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 14,
    padding: 16,
    marginBottom: 32,
  },
  walletLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  walletText: {
    fontSize: 15,
  },
  balance: {
    fontSize: 14,
    marginTop: 4,
  },
  withdrawButton: {
    width: "auto",
    backgroundColor: "#067ff8",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  withdrawText: {
    color: "#fff",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#555",
  },
});
