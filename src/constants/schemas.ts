import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(25, "Name must be at most 25 characters"),
  email: z.string().email("Invalid email address").max(100, "Email must be at most 100 characters"),
});

export const paymentSourceSchema = z.object({
  name: z.string().min(3, "Source name must be at least 3 characters").max(20, "Source name must be at most 20 characters"),
  type: z.string().min(1, "Please select a payment type").optional(),
});

export const transactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().max(50, "Description must be at most 50 characters").optional(),
  paymentSourceId: z.string().min(1, "Please select a payment method"),
});

export const pocketSchema = z.object({
  title: z.string().min(3, "Pocket title must be at least 3 characters").max(20, "Pocket title must be at most 20 characters"),
  total: z.number().positive("Budget must be greater than 0"),
});

export const udhaarFriendSchema = z.object({
  name: z.string().min(3, "Friend name must be at least 3 characters").max(25, "Friend name must be at most 25 characters"),
});
