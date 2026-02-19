/**
 * Runnable tests for email validation/sanitization (edge cases and robustness).
 * Run from web_6_automail: npx tsx tests/run-emailValidation.ts
 * Or: node --import tsx tests/run-emailValidation.ts
 */

import { sanitizeEmail, sanitizeEmailList } from "../src/utils/emailValidation";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function ok(message: string) {
  console.log("  ✓", message);
}

console.log("Testing sanitizeEmail / sanitizeEmailList (edge cases)\n");

// 1. null/undefined -> null or []
assert(sanitizeEmail(null) === null, "sanitizeEmail(null) should return null");
assert(sanitizeEmail(undefined) === null, "sanitizeEmail(undefined) should return null");
ok("null/undefined -> null");

assert(sanitizeEmailList(null).length === 0, "sanitizeEmailList(null) -> []");
assert(sanitizeEmailList(undefined).length === 0, "sanitizeEmailList(undefined) -> []");
assert(sanitizeEmailList("not an array").length === 0, "sanitizeEmailList(non-array) -> []");
ok("sanitizeEmailList invalid input -> []");

// 2. Minimal valid object (only id required for non-null)
const minimal = sanitizeEmail({ id: "e1" });
assert(minimal !== null, "minimal object with id should pass");
assert(minimal!.id === "e1", "id preserved");
assert(minimal!.from.email === "unknown@local", "default from");
assert(minimal!.to.length >= 1, "to has at least one");
assert(minimal!.subject === "(No subject)", "default subject");
assert(minimal!.timestamp instanceof Date, "timestamp is Date");
ok("minimal valid object gets defaults");

// 3. Malformed from/to
const badFrom = sanitizeEmail({
  id: "e2",
  from: "not an object",
  to: [{ name: "U", email: "u@x.com" }],
});
assert(badFrom !== null, "malformed from still produces email");
assert(badFrom!.from.name === "Unknown" && badFrom!.from.email === "unknown@local", "from fallback");
ok("malformed from -> defaults");

const badTo = sanitizeEmail({ id: "e3", to: "not array" });
assert(badTo !== null, "malformed to still produces email");
assert(badTo!.to.length >= 1, "to has fallback");
ok("malformed to -> fallback");

// 4. Duplicate ids in list
const withDupes = sanitizeEmailList([
  { id: "a", from: { name: "X", email: "x@y.com" }, to: [{ name: "Y", email: "y@y.com" }], subject: "S", body: "", snippet: "", timestamp: new Date(), isRead: false, isStarred: false, isSnoozed: false, isDraft: false, isImportant: false, labels: [], category: "primary", threadId: "a" },
  { id: "a", from: { name: "X2", email: "x2@y.com" }, to: [], subject: "S2", body: "", snippet: "", timestamp: new Date(), isRead: false, isStarred: false, isSnoozed: false, isDraft: false, isImportant: false, labels: [], category: "primary", threadId: "a" },
]);
assert(withDupes.length === 1, "duplicate ids deduped");
ok("duplicate ids -> single entry");

// 5. Mixed valid and invalid in list
const mixed = sanitizeEmailList([
  null,
  { id: "valid1", from: { name: "A", email: "a@b.com" }, to: [{ name: "B", email: "b@b.com" }], subject: "Hi", body: "", snippet: "", timestamp: new Date(), isRead: false, isStarred: false, isSnoozed: false, isDraft: false, isImportant: false, labels: [], category: "primary", threadId: "valid1" },
  { id: "" },
  {},
]);
assert(mixed.length === 1 && mixed[0].id === "valid1", "only valid entry kept");
ok("mixed list -> only valid emails");

// 6. Timestamp coercion
const withTimestamp = sanitizeEmail({
  id: "e4",
  timestamp: "2024-01-15T12:00:00Z",
});
assert(withTimestamp !== null && withTimestamp!.timestamp instanceof Date, "string timestamp -> Date");
ok("timestamp string -> Date");

console.log("\nAll emailValidation edge-case checks passed.");
