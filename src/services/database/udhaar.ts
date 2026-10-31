import { paymentSources, udhaarFriends, udhaarTransactions } from "@/db/schema";
import type { UdhaarFriend, UdhaarTransaction } from "@/types/database";
import { desc, eq } from "drizzle-orm";
import { db, generateId, roundCurrency } from "./client";

export const getUdhaarFriends = async (): Promise<UdhaarFriend[]> => {
  const result = await db
    .select()
    .from(udhaarFriends)
    .where(eq(udhaarFriends.isArchived, false))
    .all();

  return result.map((f) => ({
    id: f.id,
    name: f.name,
    isArchived: !!f.isArchived,
  }));
};

export const archiveUdhaarFriend = async (friendId: string): Promise<void> => {
  await db.update(udhaarFriends).set({ isArchived: true }).where(eq(udhaarFriends.id, friendId));
};

export const addUdhaarFriend = async (name: string): Promise<UdhaarFriend> => {
  const newFriend: UdhaarFriend = {
    id: generateId(),
    name: name.trim(),
    isArchived: false,
  };

  await db.insert(udhaarFriends).values(newFriend);
  return newFriend;
};

export const getUdhaarFriendBalance = async (
  friendId: string
): Promise<{ balance: number; hasTransactions: boolean }> => {
  const txs = await db
    .select()
    .from(udhaarTransactions)
    .where(eq(udhaarTransactions.friendId, friendId));

  let balance = 0;
  for (const t of txs) {
    if (t.type === "give") balance += t.amount;
    if (t.type === "take") balance -= t.amount;
  }
  return { balance: roundCurrency(balance), hasTransactions: txs.length > 0 };
};

export const getUdhaarTransactions = async (friendId: string): Promise<UdhaarTransaction[]> => {
  const result = await db
    .select()
    .from(udhaarTransactions)
    .where(eq(udhaarTransactions.friendId, friendId))
    .orderBy(desc(udhaarTransactions.date));

  return result.map((t) => ({
    id: t.id,
    friendId: t.friendId,
    amount: t.amount,
    type: t.type as "give" | "take",
    description: t.description || undefined,
    date: t.date,
    paymentSourceId: t.paymentSourceId || undefined,
  }));
};

export const addUdhaarTransaction = async (
  friendId: string,
  type: "give" | "take",
  amount: number,
  description?: string,
  paymentSourceId?: string
): Promise<void> => {
  const roundedAmount = roundCurrency(amount);

  await db.transaction(async (tx) => {
    await tx.insert(udhaarTransactions).values({
      id: generateId(),
      friendId,
      amount: roundedAmount,
      type,
      description: description?.trim() || null,
      date: Date.now(),
      paymentSourceId: paymentSourceId || null,
    });

    if (paymentSourceId) {
      const sources = await tx.select().from(paymentSources).where(eq(paymentSources.id, paymentSourceId));
      if (sources.length > 0) {
        const source = sources[0];
        let newBalance = source.balance;

        if (type === "give") {
          newBalance = roundCurrency(newBalance - roundedAmount);
        } else if (type === "take") {
          newBalance = roundCurrency(newBalance + roundedAmount);
        }

        await tx
          .update(paymentSources)
          .set({ balance: newBalance })
          .where(eq(paymentSources.id, paymentSourceId));
      }
    }
  });
};

export const deleteUdhaarFriend = async (friendId: string): Promise<void> => {
  await db.transaction(async (tx) => {
    const txs = await tx
      .select()
      .from(udhaarTransactions)
      .where(eq(udhaarTransactions.friendId, friendId));

    for (const t of txs) {
      if (t.paymentSourceId) {
        const sources = await tx
          .select()
          .from(paymentSources)
          .where(eq(paymentSources.id, t.paymentSourceId));
        if (sources.length > 0) {
          const source = sources[0];
          const newBalance =
            t.type === "give"
              ? roundCurrency(source.balance + t.amount)
              : roundCurrency(source.balance - t.amount);

          await tx
            .update(paymentSources)
            .set({ balance: newBalance })
            .where(eq(paymentSources.id, t.paymentSourceId));
        }
      }
    }

    await tx.delete(udhaarTransactions).where(eq(udhaarTransactions.friendId, friendId));
    await tx.delete(udhaarFriends).where(eq(udhaarFriends.id, friendId));
  });
};

export const deleteUdhaarTransaction = async (txId: string): Promise<void> => {
  await db.transaction(async (tx) => {
    const txs = await tx
      .select()
      .from(udhaarTransactions)
      .where(eq(udhaarTransactions.id, txId));
    if (txs.length === 0) return;
    const t = txs[0];

    if (t.paymentSourceId) {
      const sources = await tx
        .select()
        .from(paymentSources)
        .where(eq(paymentSources.id, t.paymentSourceId));
      if (sources.length > 0) {
        const source = sources[0];
        const newBalance =
          t.type === "give"
            ? roundCurrency(source.balance + t.amount)
            : roundCurrency(source.balance - t.amount);

        await tx
          .update(paymentSources)
          .set({ balance: newBalance })
          .where(eq(paymentSources.id, t.paymentSourceId));
      }
    }

    await tx.delete(udhaarTransactions).where(eq(udhaarTransactions.id, txId));
  });
};
