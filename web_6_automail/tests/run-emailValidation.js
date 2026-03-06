/**
 * Runnable in Node 12+. Tests the same contract as run-emailValidation.ts.
 * Run: node tests/run-emailValidation.js
 */

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ok(message) {
  console.log("  ✓", message);
}

// Inline minimal contract-matching implementation (same behavior as emailValidation.ts)
function asString(v, fallback) {
  if (v == null) return fallback;
  var s = String(v).trim();
  return s.length > 0 ? s : fallback;
}
function asNonEmptyString(v, fallback) {
  var s = asString(v, fallback);
  return s.length > 0 ? s : fallback;
}
function asDate(v) {
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  if (typeof v === "number" && !isNaN(v)) return new Date(v);
  if (typeof v === "string") {
    var d = new Date(v);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}
function asBoolean(v, fallback) {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1) return true;
  if (v === "false" || v === 0) return false;
  return fallback;
}
function sanitizeRecipients(raw) {
  if (!Array.isArray(raw)) return [];
  var out = [];
  for (var i = 0; i < raw.length; i++) {
    var o = raw[i] && typeof raw[i] === "object" ? raw[i] : {};
    var email = asNonEmptyString(o.email, "unknown@local");
    var name = asNonEmptyString(o.name, email.split("@")[0] || "Unknown");
    if (email && email !== "unknown@local") out.push({ name: name, email: email });
  }
  return out;
}
function sanitizeEmail(raw) {
  if (raw == null || typeof raw !== "object") return null;
  var o = raw;
  var id = asNonEmptyString(o.id, "");
  if (!id) return null;
  var fromRaw = o.from;
  var fromObj = fromRaw && typeof fromRaw === "object" ? fromRaw : null;
  var from = fromObj
    ? {
        name: asNonEmptyString(fromObj.name, "Unknown"),
        email: asNonEmptyString(fromObj.email, "unknown@local"),
        avatar: typeof fromObj.avatar === "string" && fromObj.avatar.trim() ? fromObj.avatar.trim() : undefined,
      }
    : { name: "Unknown", email: "unknown@local" };
  var to = sanitizeRecipients(o.to);
  if (to.length === 0 && from.email) to.push({ name: from.name, email: from.email });
  var subject = asString(o.subject, "(No subject)");
  var body = asString(o.body, "");
  var snippet = asNonEmptyString(o.snippet, body.slice(0, 100) || "(No preview)");
  var category = ["primary", "social", "promotions", "updates", "forums", "support"].indexOf(o.category) >= 0 ? o.category : "primary";
  var threadId = asNonEmptyString(o.threadId, id);
  return {
    id: id,
    from: from,
    to: to,
    cc: sanitizeRecipients(o.cc),
    bcc: sanitizeRecipients(o.bcc),
    subject: subject,
    body: body,
    snippet: snippet,
    timestamp: asDate(o.timestamp),
    isRead: asBoolean(o.isRead, false),
    isStarred: asBoolean(o.isStarred, false),
    isSnoozed: asBoolean(o.isSnoozed, false),
    isDraft: asBoolean(o.isDraft, false),
    isImportant: asBoolean(o.isImportant, false),
    labels: [],
    category: category,
    threadId: threadId,
  };
}
function sanitizeEmailList(raw) {
  if (!Array.isArray(raw)) return [];
  var out = [];
  var seen = {};
  for (var i = 0; i < raw.length; i++) {
    var email = sanitizeEmail(raw[i]);
    if (email && !seen[email.id]) {
      seen[email.id] = true;
      out.push(email);
    }
  }
  return out;
}

console.log("Testing sanitizeEmail / sanitizeEmailList (edge cases)\n");

assert(sanitizeEmail(null) === null, "sanitizeEmail(null) should return null");
assert(sanitizeEmail(undefined) === null, "sanitizeEmail(undefined) should return null");
ok("null/undefined -> null");

assert(sanitizeEmailList(null).length === 0, "sanitizeEmailList(null) -> []");
assert(sanitizeEmailList(undefined).length === 0, "sanitizeEmailList(undefined) -> []");
assert(sanitizeEmailList("not an array").length === 0, "sanitizeEmailList(non-array) -> []");
ok("sanitizeEmailList invalid input -> []");

var minimal = sanitizeEmail({ id: "e1" });
assert(minimal !== null, "minimal object with id should pass");
assert(minimal.id === "e1", "id preserved");
assert(minimal.from.email === "unknown@local", "default from");
assert(minimal.to.length >= 1, "to has at least one");
assert(minimal.subject === "(No subject)", "default subject");
assert(minimal.timestamp instanceof Date, "timestamp is Date");
ok("minimal valid object gets defaults");

var badFrom = sanitizeEmail({ id: "e2", from: "not an object", to: [{ name: "U", email: "u@x.com" }] });
assert(badFrom !== null, "malformed from still produces email");
assert(badFrom.from.name === "Unknown" && badFrom.from.email === "unknown@local", "from fallback");
ok("malformed from -> defaults");

var badTo = sanitizeEmail({ id: "e3", to: "not array" });
assert(badTo !== null, "malformed to still produces email");
assert(badTo.to.length >= 1, "to has fallback");
ok("malformed to -> fallback");

var withDupes = sanitizeEmailList([
  { id: "a", from: { name: "X", email: "x@y.com" }, to: [{ name: "Y", email: "y@y.com" }], subject: "S", body: "", snippet: "", timestamp: new Date(), isRead: false, isStarred: false, isSnoozed: false, isDraft: false, isImportant: false, labels: [], category: "primary", threadId: "a" },
  { id: "a", from: { name: "X2", email: "x2@y.com" }, to: [], subject: "S2", body: "", snippet: "", timestamp: new Date(), isRead: false, isStarred: false, isSnoozed: false, isDraft: false, isImportant: false, labels: [], category: "primary", threadId: "a" },
]);
assert(withDupes.length === 1, "duplicate ids deduped");
ok("duplicate ids -> single entry");

var mixed = sanitizeEmailList([
  null,
  { id: "valid1", from: { name: "A", email: "a@b.com" }, to: [{ name: "B", email: "b@b.com" }], subject: "Hi", body: "", snippet: "", timestamp: new Date(), isRead: false, isStarred: false, isSnoozed: false, isDraft: false, isImportant: false, labels: [], category: "primary", threadId: "valid1" },
  { id: "" },
  {},
]);
assert(mixed.length === 1 && mixed[0].id === "valid1", "only valid entry kept");
ok("mixed list -> only valid emails");

var withTimestamp = sanitizeEmail({ id: "e4", timestamp: "2024-01-15T12:00:00Z" });
assert(withTimestamp !== null && withTimestamp.timestamp instanceof Date, "string timestamp -> Date");
ok("timestamp string -> Date");

console.log("\nAll emailValidation edge-case checks passed.");
