import { users } from "@/db/schema";
import type { User } from "@/types/database";
import { db, generateId } from "./client";

export const getUser = async (): Promise<User | null> => {
  const result = await db.select().from(users).limit(1);
  return result.length > 0 ? (result[0] as User) : null;
};

export const createUser = async (name: string, email: string): Promise<User> => {
  const newUser: User = {
    id: generateId(),
    name: name.trim(),
    email: email.trim(),
    createdAt: Date.now(),
  };

  await db.insert(users).values(newUser);
  return newUser;
};
