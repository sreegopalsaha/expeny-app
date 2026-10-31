import { paymentSources, pockets, pocketTransactions } from "@/db/schema";
import type { Pocket, PocketTransaction } from "@/types/database";
import { desc, eq } from "drizzle-orm";
import { db, generateId, roundCurrency } from "./client";

export interface PocketWithMeta extends Pocket {
  hasTransactions: boolean;
}

export const getPockets = async (): Promise<PocketWithMeta[]> => {
  const allPockets = await db
    .select()
    .from(pockets)
    .where(eq(pockets.isArchived, false))
    .all();

  const result: PocketWithMeta[] = [];
  for (const p of allPockets) {
    const txs = await db
      .select()
      .from(pocketTransactions)
      .where(eq(pocketTransactions.pocketId, p.id))
      .limit(1);

    result.push({
      id: p.id,
      title: p.title,
      total: p.total,
      spent: p.spent,
      isArchived: !!p.isArchived,
      hasTransactions: txs.length > 0,
    });
  }
  return result;
};

export const archivePocket = async (pocketId: string): Promise<void> => {
  await db.update(pockets).set({ isArchived: true }).where(eq(pockets.id, pocketId));
};

export const addPocket = async (title: string, total: number): Promise<Pocket> => {
  const newPocket: Pocket = {
    id: generateId(),
    title: title.trim(),
    total: roundCurrency(total),
    spent: 0,
    isArchived: false,
  };

  await db.insert(pockets).values(newPocket);
  return newPocket;
};

export const getPocketTransactions = async (pocketId: string): Promise<PocketTransaction[]> => {
  const result = await db
    .select()
    .from(pocketTransactions)
    .where(eq(pocketTransactions.pocketId, pocketId))
    .orderBy(desc(pocketTransactions.date));

  return result.map((tx) => ({
    id: tx.id,
    pocketId: tx.pocketId,
    amount: tx.amount,
    type: tx.type as "spend" | "add",
    description: tx.description || undefined,
    date: tx.date,
    paymentSourceId: tx.paymentSourceId,
  }));
};

export const addPocketTransaction = async (
  pocketId: string,
  amount: number,
  type: "spend" | "add",
  paymentSourceId: string,
  description?: string
): Promise<void> => {
  const roundedAmount = roundCurrency(amount);

  await db.transaction(async (tx) => {
    await tx.insert(pocketTransactions).values({
      id: generateId(),
      pocketId,
      amount: roundedAmount,
      type,
      description: description?.trim() || null,
      date: Date.now(),
      paymentSourceId,
    });

    const pocketList = await tx.select().from(pockets).where(eq(pockets.id, pocketId));
    if (pocketList.length > 0) {
      const pocket = pocketList[0];
      const newSpent =
        type === "spend"
          ? roundCurrency(pocket.spent + roundedAmount)
          : roundCurrency(pocket.spent - roundedAmount);

      await tx.update(pockets).set({ spent: newSpent }).where(eq(pockets.id, pocketId));
    }

    const sources = await tx
      .select()
      .from(paymentSources)
      .where(eq(paymentSources.id, paymentSourceId));
    if (sources.length > 0) {
      const source = sources[0];
      const newSourceBalance =
        type === "spend"
          ? roundCurrency(source.balance - roundedAmount)
          : roundCurrency(source.balance + roundedAmount);

      await tx
        .update(paymentSources)
        .set({ balance: newSourceBalance })
        .where(eq(paymentSources.id, paymentSourceId));
    }
  });
};

export const deletePocket = async (pocketId: string): Promise<void> => {
  await db.transaction(async (tx) => {
    const txs = await tx
      .select()
      .from(pocketTransactions)
      .where(eq(pocketTransactions.pocketId, pocketId));

    for (const t of txs) {
      const sources = await tx
        .select()
        .from(paymentSources)
        .where(eq(paymentSources.id, t.paymentSourceId));
      if (sources.length > 0) {
        const source = sources[0];
        const newSourceBalance =
          t.type === "spend"
            ? roundCurrency(source.balance + t.amount)
            : roundCurrency(source.balance - t.amount);

        await tx
          .update(paymentSources)
          .set({ balance: newSourceBalance })
          .where(eq(paymentSources.id, t.paymentSourceId));
      }
    }

    await tx.delete(pocketTransactions).where(eq(pocketTransactions.pocketId, pocketId));
    await tx.delete(pockets).where(eq(pockets.id, pocketId));
  });
};

export const deletePocketTransaction = async (txId: string): Promise<void> => {
  await db.transaction(async (tx) => {
    const txs = await tx
      .select()
      .from(pocketTransactions)
      .where(eq(pocketTransactions.id, txId));
    if (txs.length === 0) return;
    const t = txs[0];

    const pocketList = await tx.select().from(pockets).where(eq(pockets.id, t.pocketId));
    if (pocketList.length > 0) {
      const pocket = pocketList[0];
      const newSpent =
        t.type === "spend"
          ? roundCurrency(pocket.spent - t.amount)
          : roundCurrency(pocket.spent + t.amount);

      await tx.update(pockets).set({ spent: newSpent }).where(eq(pockets.id, t.pocketId));
    }

    const sources = await tx
      .select()
      .from(paymentSources)
      .where(eq(paymentSources.id, t.paymentSourceId));
    if (sources.length > 0) {
      const source = sources[0];
      const newSourceBalance =
        t.type === "spend"
          ? roundCurrency(source.balance + t.amount)
          : roundCurrency(source.balance - t.amount);

      await tx
        .update(paymentSources)
        .set({ balance: newSourceBalance })
        .where(eq(paymentSources.id, t.paymentSourceId));
    }

    await tx.delete(pocketTransactions).where(eq(pocketTransactions.id, txId));
  });
};
