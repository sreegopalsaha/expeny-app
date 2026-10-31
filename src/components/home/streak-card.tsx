import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet } from "react-native";
import { AppText } from "../core/app-text";
import { AppView } from "../core/app-view";
import Button from "../core/button";

interface StreakCardProps {
  streakDays: number;
  canClaim: boolean;
  rewardAmount?: number;
  onClaim: () => void;
  nextMilestone?: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streakDays,
  canClaim,
  rewardAmount = 69,
  onClaim,
  nextMilestone = 21,
}) => {
  return (
    <AppView type="secondary" style={styles.card}>
      <Ionicons name="flame" size={52} color="#FF8C00" style={styles.icon} />

      <AppText type="defaultSemiBold" style={styles.title}>
        Your Streak
      </AppText>

      <AppText type="title" style={styles.days}>
        {streakDays} days
      </AppText>

      <Button
        style={[styles.button, !canClaim && styles.disabled]}
        disabled={!canClaim}
        onPress={canClaim ? onClaim : undefined}
      >
        <AppText type="defaultSemiBold" style={styles.buttonText}>
          {canClaim ? `Claim ${rewardAmount} XC` : `Reach ${nextMilestone} Days to Claim 69 XC`}
        </AppText>
      </Button>
    </AppView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    width: "100%",
    textAlign: "center",
  },
  days: {
    fontSize: 40,
    marginVertical: 10,
    lineHeight: 48,
  },
  button: {
    backgroundColor: "#00C853",
    paddingVertical: 14,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
    marginTop: 12,
  },
  disabled: {
    backgroundColor: "#2E2E2E",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
