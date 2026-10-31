import assert from "node:assert";
import test from "node:test";
import { formatAmount, formatDate } from "../utils/format.ts";

test("formatAmount: handles zero, null, and undefined", () => {
  assert.strictEqual(formatAmount(0), "0");
  assert.strictEqual(formatAmount(null), "0");
  assert.strictEqual(formatAmount(undefined), "0");
});

test("formatAmount: formats numbers with Indian currency groupings", () => {
  assert.strictEqual(formatAmount(1000), "1,000");
  assert.strictEqual(formatAmount(100000), "1,00,000");
  assert.strictEqual(formatAmount(500), "500");
});

test("formatDate: formats valid timestamp and Date objects", () => {
  const timestamp = new Date("2026-01-15T12:00:00Z").getTime();
  const result = formatDate(timestamp);
  assert.ok(result.length > 0, "Formatted date should not be empty");
  assert.ok(result.includes("2026"), "Formatted date should include year 2026");
});

test("formatDate: handles invalid dates gracefully", () => {
  const result = formatDate(NaN);
  assert.strictEqual(result, "");
});
