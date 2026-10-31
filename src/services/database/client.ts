import { rewards } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";

const expoDb = SQLite.openDatabaseSync("the_expeny.db");
const db = drizzle(expoDb);

export const generateId = () => Crypto.randomUUID();

export const roundCurrency = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export const initializeDatabase = async () => {
  try {
    await expoDb.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS payment_sources (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0 NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        date INTEGER NOT NULL,
        payment_source_id TEXT NOT NULL,
        FOREIGN KEY (payment_source_id) REFERENCES payment_sources(id)
      );

      CREATE TABLE IF NOT EXISTS udhaar_friends (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS udhaar_transactions (
        id TEXT PRIMARY KEY NOT NULL,
        friend_id TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        date INTEGER NOT NULL,
        payment_source_id TEXT,
        FOREIGN KEY (friend_id) REFERENCES udhaar_friends(id),
        FOREIGN KEY (payment_source_id) REFERENCES payment_sources(id)
      );

      CREATE TABLE IF NOT EXISTS rewards (
        id TEXT PRIMARY KEY NOT NULL,
        balance REAL DEFAULT 0 NOT NULL,
        current_streak INTEGER DEFAULT 0 NOT NULL,
        last_claim_date INTEGER,
        last_check_in_date INTEGER,
        last_claimed_milestone INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS pockets (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        total REAL NOT NULL,
        spent REAL DEFAULT 0 NOT NULL,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS pocket_transactions (
        id TEXT PRIMARY KEY NOT NULL,
        pocket_id TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        date INTEGER NOT NULL,
        payment_source_id TEXT NOT NULL,
        FOREIGN KEY (pocket_id) REFERENCES pockets(id),
        FOREIGN KEY (payment_source_id) REFERENCES payment_sources(id)
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    const rewardData = await db.select().from(rewards).all();
    if (rewardData.length === 0) {
      await db.insert(rewards).values({
        id: generateId(),
        balance: 0,
        currentStreak: 0,
        lastClaimDate: null,
        lastCheckInDate: null,
        lastClaimedMilestone: 0,
      });
    }
  } catch (e) {
    console.error("Database initialization error", e);
  }
};

export const clearAllData = async (): Promise<void> => {
  await expoDb.execAsync(`
    DELETE FROM pocket_transactions;
    DELETE FROM pockets;
    DELETE FROM udhaar_transactions;
    DELETE FROM udhaar_friends;
    DELETE FROM transactions;
    DELETE FROM payment_sources;
    UPDATE rewards SET balance = 0, current_streak = 0, last_claim_date = NULL, last_check_in_date = NULL, last_claimed_milestone = 0;
  `);
};

export { db, expoDb };
