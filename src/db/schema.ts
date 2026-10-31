import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const paymentSources = sqliteTable("payment_sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  balance: real("balance").notNull().default(0),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  date: integer("date").notNull(),
  paymentSourceId: text("payment_source_id")
    .references(() => paymentSources.id)
    .notNull(),
});

export const udhaarFriends = sqliteTable("udhaar_friends", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
});

export const udhaarTransactions = sqliteTable("udhaar_transactions", {
  id: text("id").primaryKey(),
  friendId: text("friend_id")
    .references(() => udhaarFriends.id)
    .notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  date: integer("date").notNull(),
  paymentSourceId: text("payment_source_id").references(() => paymentSources.id),
});

export const rewards = sqliteTable("rewards", {
  id: text("id").primaryKey(),
  balance: real("balance").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  lastClaimDate: integer("last_claim_date"),
  lastCheckInDate: integer("last_check_in_date"),
  lastClaimedMilestone: integer("last_claimed_milestone").default(0),
});

export const pockets = sqliteTable("pockets", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  total: real("total").notNull(),
  spent: real("spent").notNull().default(0),
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
});

export const pocketTransactions = sqliteTable("pocket_transactions", {
  id: text("id").primaryKey(),
  pocketId: text("pocket_id")
    .references(() => pockets.id)
    .notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  date: integer("date").notNull(),
  paymentSourceId: text("payment_source_id")
    .references(() => paymentSources.id)
    .notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: integer("created_at").notNull(),
});
