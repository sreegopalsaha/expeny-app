import { paymentSources, transactions } from "@/db/schema";
import type { Transaction, TransactionType } from "@/types/database";
import { desc, eq } from "drizzle-orm";
import { db, generateId, roundCurrency } from "./client";

export const addTransaction = async (
  sourceId: string,
  type: TransactionType,
  amount: number,
  description?: string
): Promise<void> => {
  const roundedAmount = roundCurrency(amount);

  await db.transaction(async (tx) => {
    await tx.insert(transactions).values({
      id: generateId(),
      amount: roundedAmount,
      type,
      description: description?.trim() || null,
      date: Date.now(),
      paymentSourceId: sourceId,
    });

    const sources = await tx.select().from(paymentSources).where(eq(paymentSources.id, sourceId));
    if (sources.length > 0) {
      const source = sources[0];
      const newBalance =
        type === "credit"
          ? roundCurrency(source.balance + roundedAmount)
          : roundCurrency(source.balance - roundedAmount);

      await tx
        .update(paymentSources)
        .set({ balance: newBalance })
        .where(eq(paymentSources.id, sourceId));
    }
  });
};

export const getRecentTransactions = async (limit = 10): Promise<Transaction[]> => {
  const result = await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.date))
    .limit(limit);

  return result.map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    type: tx.type as TransactionType,
    description: tx.description || undefined,
    date: tx.date,
    paymentSourceId: tx.paymentSourceId,
  }));
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  await db.transaction(async (tx) => {
    const txs = await tx.select().from(transactions).where(eq(transactions.id, transactionId));
    if (txs.length === 0) return;
    const transaction = txs[0];

    const sources = await tx
      .select()
      .from(paymentSources)
      .where(eq(paymentSources.id, transaction.paymentSourceId));

    if (sources.length > 0) {
      const source = sources[0];
      const newBalance =
        transaction.type === "credit"
          ? roundCurrency(source.balance - transaction.amount)
          : roundCurrency(source.balance + transaction.amount);

      await tx
        .update(paymentSources)
        .set({ balance: newBalance })
        .where(eq(paymentSources.id, transaction.paymentSourceId));
    }

    await tx.delete(transactions).where(eq(transactions.id, transactionId));
  });
};
