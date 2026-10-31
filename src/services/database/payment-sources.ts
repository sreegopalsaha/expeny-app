import { paymentSources, pocketTransactions, transactions, udhaarTransactions } from "@/db/schema";
import type { PaymentSource } from "@/types/database";
import { eq } from "drizzle-orm";
import { db, generateId, roundCurrency } from "./client";

export const getPaymentSources = async (): Promise<PaymentSource[]> => {
  return await db.select().from(paymentSources).all();
};

export const addPaymentSource = async (name: string, balance: number): Promise<PaymentSource> => {
  const newSource: PaymentSource = {
    id: generateId(),
    name: name.trim().toUpperCase(),
    balance: roundCurrency(balance),
  };

  await db.insert(paymentSources).values(newSource);
  return newSource;
};

export const deletePaymentSource = async (sourceId: string): Promise<"CANNOT_DELETE" | "DELETED"> => {
  return await db.transaction(async (tx) => {
    const usedInTxs = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.paymentSourceId, sourceId))
      .limit(1);
    if (usedInTxs.length > 0) return "CANNOT_DELETE";

    const usedInPockets = await tx
      .select()
      .from(pocketTransactions)
      .where(eq(pocketTransactions.paymentSourceId, sourceId))
      .limit(1);
    if (usedInPockets.length > 0) return "CANNOT_DELETE";

    const usedInUdhaar = await tx
      .select()
      .from(udhaarTransactions)
      .where(eq(udhaarTransactions.paymentSourceId, sourceId))
      .limit(1);
    if (usedInUdhaar.length > 0) return "CANNOT_DELETE";

    await tx.delete(paymentSources).where(eq(paymentSources.id, sourceId));
    return "DELETED";
  });
};
