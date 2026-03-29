#!/usr/bin/env node
/**
 * Unit tests for formatMessageTime behavior.
 * Run: node tests/format.test.js
 */

function formatMessageTime(iso) {
  if (!iso || typeof iso !== "string") return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    console.error(`FAIL: ${message}`);
    console.error(`  expected: ${expected}`);
    console.error(`  actual:   ${actual}`);
    process.exitCode = 1;
    return false;
  }
  return true;
}

let passed = 0;

assertEqual(formatMessageTime(""), "", "empty string returns empty");
passed++;

assertEqual(formatMessageTime(null), "", "null returns empty");
passed++;

assertEqual(formatMessageTime(undefined), "", "undefined returns empty");
passed++;

assertEqual(formatMessageTime(123), "", "non-string returns empty");
passed++;

assertEqual(formatMessageTime("not-a-date"), "", "invalid date returns empty");
passed++;

const validIso = "2025-02-16T14:30:00.000Z";
const out = formatMessageTime(validIso);
if (typeof out === "string" && out.length > 0) {
  passed++;
} else {
  console.error("FAIL: valid ISO string should return non-empty string");
  process.exitCode = 1;
}

const pastDate = "2020-01-15T10:00:00.000Z";
const pastOut = formatMessageTime(pastDate);
if (typeof pastOut === "string" && pastOut.length > 0 && (pastOut.includes("Jan") || pastOut.includes("15"))) {
  passed++;
} else {
  console.error("FAIL: past date should return short date, got:", pastOut);
  process.exitCode = 1;
}

console.log(`Format tests: ${passed} passed`);
process.exit(process.exitCode || 0);
