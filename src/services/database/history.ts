import {
  paymentSources,
  pocketTransactions,
  pockets,
  transactions,
  udhaarFriends,
  udhaarTransactions,
} from "@/db/schema";
import type { UniversalTransaction } from "@/types/database";
import { db, roundCurrency } from "./client";

export const getUniversalHistory = async (): Promise<UniversalTransaction[]> => {
  const allRegular = await db.select().from(transactions).all();
  const allPockets = await db.select().from(pocketTransactions).all();
  const allUdhaar = await db.select().from(udhaarTransactions).all();

  const allPocketEntities = await db.select().from(pockets).all();
  const allFriends = await db.select().from(udhaarFriends).all();
  const allSources = await db.select().from(paymentSources).all();

  const pocketsMap = new Map(allPocketEntities.map((p) => [p.id, p]));
  const friendsMap = new Map(allFriends.map((f) => [f.id, f]));
  const sourcesMap = new Map(allSources.map((s) => [s.id, s]));

  const universal: UniversalTransaction[] = [];

  for (const t of allRegular) {
    universal.push({
      id: t.id,
      amount: t.amount,
      type: t.type,
      description: t.description || undefined,
      date: t.date,
      paymentSourceId: t.paymentSourceId,
      sourceType: "regular",
      title: t.description || "Transaction",
      subtitle: t.type === "credit" ? "Income" : "Expense",
      paymentSourceName: sourcesMap.get(t.paymentSourceId)?.name,
    });
  }

  for (const t of allPockets) {
    const pocket = pocketsMap.get(t.pocketId);
    universal.push({
      id: t.id,
      amount: t.amount,
      type: t.type,
      description: t.description || undefined,
      date: t.date,
      paymentSourceId: t.paymentSourceId,
      sourceType: "pocket",
      title: pocket ? `Pocket: ${pocket.title}` : "Pocket Transaction",
      subtitle: t.description || (t.type === "spend" ? "Spend" : "Added Funds"),
      paymentSourceName: sourcesMap.get(t.paymentSourceId)?.name,
    });
  }

  for (const t of allUdhaar) {
    const friend = friendsMap.get(t.friendId);
    universal.push({
      id: t.id,
      amount: t.amount,
      type: t.type,
      description: t.description || undefined,
      date: t.date,
      paymentSourceId: t.paymentSourceId || "",
      sourceType: "udhaar",
      title: friend ? `Udhaar: ${friend.name}` : "Udhaar Transaction",
      subtitle: t.description || (t.type === "give" ? "Given" : "Taken"),
      paymentSourceName: t.paymentSourceId
        ? sourcesMap.get(t.paymentSourceId)?.name
        : "No Source",
    });
  }

  const txBySource = new Map<string, UniversalTransaction[]>();

  for (const t of universal) {
    if (!t.paymentSourceId) continue;
    if (!txBySource.has(t.paymentSourceId)) {
      txBySource.set(t.paymentSourceId, []);
    }
    txBySource.get(t.paymentSourceId)!.push(t);
  }

  for (const [sourceId, txs] of txBySource.entries()) {
    const currentSource = sourcesMap.get(sourceId);
    if (!currentSource) continue;

    let runningBalance = currentSource.balance;
    txs.sort((a, b) => b.date - a.date);

    for (const t of txs) {
      t.balanceAfterTransaction = roundCurrency(runningBalance);

      const isDebit = t.type === "debit" || t.type === "spend" || t.type === "give";
      const isCredit = t.type === "credit" || t.type === "add" || t.type === "take";

      if (isDebit) {
        runningBalance = roundCurrency(runningBalance + t.amount);
      } else if (isCredit) {
        runningBalance = roundCurrency(runningBalance - t.amount);
      }
    }
  }

  universal.sort((a, b) => b.date - a.date);
  return universal;
};
