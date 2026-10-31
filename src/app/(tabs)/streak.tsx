import { AppText } from "@/components/core/app-text";
import { AppView } from "@/components/core/app-view";
import Button from "@/components/core/button";
import ScreenHeader from "@/components/core/screen-header";
import { StreakCard } from "@/components/home/streak-card";
import WalletCard from "@/components/home/wallet-card";
import {
  addRewardBalance,
  checkDailyStreak,
  claimMilestoneReward,
  getStreakData,
  withdrawRewardBalance,
} from "@/services/database";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Linking, StyleSheet, View } from "react-native";

export default function RewardScreen() {
  const [streakDays, setStreakDays] = useState(0);
  const [rewardBalance, setRewardBalance] = useState(0);
  const [lastClaimedMilestone, setLastClaimedMilestone] = useState(0);

  const nextMilestone = lastClaimedMilestone + 21;
  const canClaim69 = streakDays >= nextMilestone;

  const checkStreakAndLoad = useCallback(async () => {
    try {
      await checkDailyStreak();
      const streakData = await getStreakData();
      if (streakData) {
        setStreakDays(streakData.current_streak);
        setRewardBalance(streakData.total_reward_balance);
        setLastClaimedMilestone(streakData.last_claimed_milestone);
      }
    } catch (error) {
      console.error("Error loading streak data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkStreakAndLoad();
    }, [checkStreakAndLoad])
  );

  const handleClaim69 = async () => {
    if (canClaim69) {
      try {
        const success = await claimMilestoneReward(nextMilestone);
        if (success) {
          await checkStreakAndLoad();
          Alert.alert("Awesome!", "69 XC claimed successfully!");
        } else {
          Alert.alert("Wait!", "You haven't reached the milestone yet.");
        }
      } catch (error) {
        console.error("Error claiming reward:", error);
        Alert.alert("Error", "Failed to claim reward");
      }
    }
  };

  const handleFreeze = () => {
    Alert.alert("Info", "You watched 5 ads. Your streak is frozen for 1 day!");
  };

  const handleClaim5 = async () => {
    try {
      const rewardAmount = Math.random() * 5;
      await addRewardBalance(rewardAmount);
      await checkStreakAndLoad();
      Alert.alert(
        "Nice!",
        `You watched 5 ads and earned ${rewardAmount.toFixed(2)} XC!`
      );
    } catch (error) {
      console.error("Error claiming reward:", error);
      Alert.alert("Error", "Failed to claim reward");
    }
  };

  const handleRefer = async () => {
    try {
      const referralBonus = 10;
      await addRewardBalance(referralBonus);
      await checkStreakAndLoad();
      Alert.alert(
        "Success!",
        `Referral verified. You earned ${referralBonus} XC!`
      );
    } catch (error) {
      console.error("Error processing referral reward:", error);
      Alert.alert("Error", "Failed to claim referral reward");
    }
  };

  const handleWithdraw = async () => {
    if (rewardBalance <= 0) {
      Alert.alert("Error", "No balance to withdraw");
      return;
    }

    try {
      await withdrawRewardBalance(rewardBalance);
      await checkStreakAndLoad();
      Alert.alert("Redeemed", `${rewardBalance.toFixed(2)} XC redeemed successfully!`);
    } catch (error) {
      console.error("Error withdrawing:", error);
      Alert.alert("Error", "Failed to withdraw");
    }
  };

  return (
    <AppView style={styles.container}>
      <ScreenHeader title="Streak Zone" subtitle="Earn XC by maintaining your streak" />

      <WalletCard
        initialBalance={rewardBalance}
        onWithdraw={handleWithdraw}
      />

      <View style={styles.centerContainer}>
        <StreakCard
          streakDays={streakDays}
          canClaim={canClaim69}
          rewardAmount={69}
          onClaim={handleClaim69}
          nextMilestone={nextMilestone}
        />
      </View>

      <View style={styles.adButtonContainer}>
        <Button
          style={[styles.adButton, { backgroundColor: "#1976D2" }]}
          icon="videocam"
          iconColor="#fff"
          onPress={handleFreeze}
        >
          <AppText type="defaultSemiBold" style={styles.adText}>
            Watch 5 Ads to Freeze Streak for 1 Day
          </AppText>
        </Button>

        <Button
          style={[styles.adButton, { backgroundColor: "#1976D2" }]}
          icon="gift"
          iconColor="#fff"
          onPress={handleClaim5}
        >
          <AppText type="defaultSemiBold" style={styles.adText}>
            Watch 5 Ads to Earn up to 5 XC
          </AppText>
        </Button>

        <Button
          style={[styles.adButton, { backgroundColor: "#1976D2" }]}
          icon="cash"
          iconColor="#fff"
          onPress={handleRefer}
        >
          <AppText type="defaultSemiBold" style={styles.adText}>
            Refer a friend to earn 10 XC
          </AppText>
        </Button>
      </View>

      <AppText
        onPress={() => Linking.openURL("https://expeny.vercel.app/streak")}
        type="link"
        style={styles.terms}
      >
        Terms and conditions
      </AppText>
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  adButtonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  adButton: {
    borderRadius: 10,
  },
  adText: {
    color: "#fff",
    fontSize: 15,
  },
  terms: {
    textAlign: "center",
    fontSize: 12,
    marginBottom: 20,
  },
});
