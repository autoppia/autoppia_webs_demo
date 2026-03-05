#!/usr/bin/env node
/**
 * Event coverage test: all EVENT_TYPES must be used in the codebase (logEvent(EVENT_TYPES.XXX, ...)).
 * Run: node tests/test-events.js
 */

const fs = require("fs");
const path = require("path");

function readFile(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function walkDir(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !name.startsWith(".") && name !== "node_modules" && name !== ".next") {
      walkDir(full, list);
    } else if ((name.endsWith(".ts") || name.endsWith(".tsx")) && !name.includes("test-")) {
      list.push(full);
    }
  }
  return list;
}

const eventsPath = path.join(process.cwd(), "src/library/events.ts");
const content = readFile(eventsPath);
if (!content) {
  console.error("❌ src/library/events.ts not found");
  process.exit(1);
}

const blockMatch = content.match(/export\s+const\s+EVENT_TYPES\s*=\s*\{([^}]+)\}/s);
if (!blockMatch) {
  console.error("❌ EVENT_TYPES not found");
  process.exit(1);
}

const eventNameRe = /(\w+)\s*:\s*["']([^"']+)["']/g;
const events = [];
let m;
while ((m = eventNameRe.exec(blockMatch[1])) !== null) {
  events.push({ key: m[1], value: m[2] });
}

const srcFiles = walkDir(path.join(process.cwd(), "src"));
const allContent = srcFiles.map((f) => ({ path: f, content: readFile(f) })).filter((f) => f.path !== eventsPath);

let unused = [];
for (const { key } of events) {
  const re1 = new RegExp(`logEvent\\([^)]*EVENT_TYPES\\.${key}[^)]*\\)`, "g");
  const re2 = new RegExp(`EVENT_TYPES\\.${key}`, "g");
  let count = 0;
  for (const { content: c } of allContent) {
    count += (c.match(re1) || []).length;
    count += (c.match(re2) || []).length;
  }
  if (count === 0) unused.push(key);
}

console.log(`Events defined: ${events.length}`);
console.log(`Events used: ${events.length - unused.length}/${events.length}`);

if (unused.length > 0) {
  console.error("Unused events:", unused.join(", "));
  process.exit(1);
}
console.log("✅ All events are used.");
process.exit(0);
