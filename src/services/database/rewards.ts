import { rewards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db, roundCurrency } from "./client";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface StreakData {
  current_streak: number;
  total_reward_balance: number;
  last_claimed_milestone: number;
  last_check_in_date: number | null;
}

export const checkDailyStreak = async (): Promise<void> => {
  const data = await db.select().from(rewards).all();
  if (data.length === 0) return;

  const rewardData = data[0];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  if (rewardData.lastCheckInDate) {
    const lastCheckIn = new Date(rewardData.lastCheckInDate);
    const lastCheckInStart = new Date(
      lastCheckIn.getFullYear(),
      lastCheckIn.getMonth(),
      lastCheckIn.getDate()
    ).getTime();

    if (todayStart === lastCheckInStart) {
      return;
    }
  }

  let newStreak = rewardData.currentStreak;

  if (rewardData.lastCheckInDate) {
    const lastCheckIn = new Date(rewardData.lastCheckInDate);
    const lastCheckInStart = new Date(
      lastCheckIn.getFullYear(),
      lastCheckIn.getMonth(),
      lastCheckIn.getDate()
    ).getTime();

    const yesterdayStart = todayStart - ONE_DAY_MS;

    if (lastCheckInStart === yesterdayStart) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  await db
    .update(rewards)
    .set({
      currentStreak: newStreak,
      lastCheckInDate: Date.now(),
    })
    .where(eq(rewards.id, rewardData.id));
};

export const claimMilestoneReward = async (milestone: number): Promise<boolean> => {
  const data = await db.select().from(rewards).all();
  if (data.length === 0) return false;

  const rewardData = data[0];

  try {
    if (
      rewardData.currentStreak >= milestone &&
      (rewardData.lastClaimedMilestone || 0) < milestone
    ) {
      await db
        .update(rewards)
        .set({
          balance: roundCurrency(rewardData.balance + 69),
          lastClaimedMilestone: milestone,
          lastClaimDate: Date.now(),
        })
        .where(eq(rewards.id, rewardData.id));
      return true;
    }
  } catch (e) {
    console.error("Error claiming milestone reward:", e);
  }
  return false;
};

export const getStreakData = async (): Promise<StreakData | null> => {
  const data = await db.select().from(rewards).all();
  if (data.length > 0) {
    return {
      current_streak: data[0].currentStreak,
      total_reward_balance: roundCurrency(data[0].balance),
      last_claimed_milestone: data[0].lastClaimedMilestone || 0,
      last_check_in_date: data[0].lastCheckInDate,
    };
  }
  return null;
};

export const addRewardBalance = async (amount: number): Promise<void> => {
  const data = await db.select().from(rewards).all();
  if (data.length > 0) {
    const currentBalance = data[0].balance;
    await db
      .update(rewards)
      .set({ balance: roundCurrency(currentBalance + amount) })
      .where(eq(rewards.id, data[0].id));
  }
};

export const withdrawRewardBalance = async (amount: number): Promise<void> => {
  const data = await db.select().from(rewards).all();
  if (data.length > 0) {
    const currentBalance = data[0].balance;
    if (currentBalance >= amount) {
      await db
        .update(rewards)
        .set({ balance: roundCurrency(currentBalance - amount) })
        .where(eq(rewards.id, data[0].id));
    }
  }
};
