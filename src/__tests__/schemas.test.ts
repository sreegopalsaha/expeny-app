import assert from "node:assert";
import test from "node:test";
import {
  paymentSourceSchema,
  pocketSchema,
  transactionSchema,
  udhaarFriendSchema,
  userSchema,
} from "../constants/schemas.ts";

test("userSchema: validates name and email", () => {
  const valid = userSchema.safeParse({ name: "Alex", email: "alex@example.com" });
  assert.strictEqual(valid.success, true);

  const shortName = userSchema.safeParse({ name: "Al", email: "alex@example.com" });
  assert.strictEqual(shortName.success, false);

  const invalidEmail = userSchema.safeParse({ name: "Alex", email: "not-an-email" });
  assert.strictEqual(invalidEmail.success, false);
});

test("paymentSourceSchema: validates source name", () => {
  const valid = paymentSourceSchema.safeParse({ name: "Bank Account" });
  assert.strictEqual(valid.success, true);

  const short = paymentSourceSchema.safeParse({ name: "BA" });
  assert.strictEqual(short.success, false);
});

test("transactionSchema: validates amount and payment source", () => {
  const valid = transactionSchema.safeParse({
    amount: 150,
    paymentSourceId: "source-123",
    description: "Groceries",
  });
  assert.strictEqual(valid.success, true);

  const negativeAmount = transactionSchema.safeParse({
    amount: -50,
    paymentSourceId: "source-123",
  });
  assert.strictEqual(negativeAmount.success, false);

  const missingSource = transactionSchema.safeParse({
    amount: 150,
    paymentSourceId: "",
  });
  assert.strictEqual(missingSource.success, false);
});

test("pocketSchema: validates budget and title", () => {
  const valid = pocketSchema.safeParse({ title: "Vacation", total: 10000 });
  assert.strictEqual(valid.success, true);

  const invalidBudget = pocketSchema.safeParse({ title: "Vacation", total: 0 });
  assert.strictEqual(invalidBudget.success, false);
});

test("udhaarFriendSchema: validates friend name", () => {
  const valid = udhaarFriendSchema.safeParse({ name: "Rohan" });
  assert.strictEqual(valid.success, true);

  const shortName = udhaarFriendSchema.safeParse({ name: "Ro" });
  assert.strictEqual(shortName.success, false);
});
