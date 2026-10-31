export type TransactionType = "credit" | "debit";

export interface PaymentSource {
  id: string;
  name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: number;
  paymentSourceId: string;
}

export interface UdhaarFriend {
  id: string;
  name: string;
  isArchived?: boolean;
}

export interface UdhaarTransaction {
  id: string;
  friendId: string;
  amount: number;
  type: "give" | "take";
  description?: string;
  date: number;
  paymentSourceId?: string;
}

export interface Pocket {
  id: string;
  title: string;
  total: number;
  spent: number;
  isArchived?: boolean;
}

export interface PocketTransaction {
  id: string;
  pocketId: string;
  amount: number;
  type: "spend" | "add";
  description?: string;
  date: number;
  paymentSourceId: string;
}

export type UniversalTransactionSource = "regular" | "pocket" | "udhaar";

export interface UniversalTransaction {
  id: string;
  amount: number;
  type: string;
  description?: string;
  date: number;
  paymentSourceId?: string;
  sourceType: UniversalTransactionSource;
  title: string;
  subtitle?: string;
  balanceAfterTransaction?: number;
  paymentSourceName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export interface Reward {
  id: string;
  balance: number;
  currentStreak: number;
  lastClaimDate?: number | null;
  lastCheckInDate?: number | null;
  lastClaimedMilestone?: number | null;
}
