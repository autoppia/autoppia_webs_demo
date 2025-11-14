#!/usr/bin/env node

/**
 * Generate additional email entries in the same format used by dataset.ts
 * Usage:
 *   node scripts/generateEmails.js --count=50
 *
 * The script reads the existing src/data/emails.json file, generates the requested
 * number of new emails, skips any duplicates (by id), and appends the new entries
 * to the JSON file.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_COUNT = 50;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.resolve(PROJECT_ROOT, "src/data/emails.json");

const args = process.argv.slice(2);
const countArg = args.find((arg) => arg.startsWith("--count"));
let count = DEFAULT_COUNT;
if (countArg) {
  const [, value] = countArg.split("=");
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isNaN(parsed) && parsed > 0) {
    count = parsed;
  }
}

// Data pools
const firstNames = [
  "Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry",
  "Isaac", "Julia", "Kevin", "Laura", "Michael", "Nancy", "Oliver", "Patricia",
  "Quinn", "Rachel", "Samuel", "Tina", "Victor", "Wendy", "Xavier", "Yvonne",
  "Zachary", "Amy", "Brian", "Catherine", "Daniel", "Elizabeth", "Fred", "Gina",
  "Hector", "Iris", "Jack", "Kelly", "Liam", "Mia", "Noah", "Olivia"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor",
  "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez",
  "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams"
];

const emailDomains = [
  "company.com", "tech.org", "outlook.com", "yahoo.com", "startup.io",
  "business.net", "corp.com", "enterprise.org", "gmail.com", "mail.com",
  "office.com", "work.io", "team.org", "corporate.net", "professional.com"
];

const subjectTemplates = [
  "Project Update",
  "Meeting Request",
  "Status Report",
  "Action Required",
  "Follow Up",
  "Team Sync",
  "Client Meeting",
  "Budget Review",
  "Quarterly Report",
  "Strategy Discussion",
  "Lunch Plans",
  "Weekend Plans",
  "Coffee Chat",
  "Birthday Party",
  "Holiday Greetings",
  "Special Offer",
  "Newsletter",
  "Product Launch",
  "Discount Code",
  "Event Invitation",
  "Document Review",
  "Feedback Request",
  "Proposal Review",
  "Contract Discussion",
  "Support Ticket",
  "Technical Issue",
  "Account Update",
  "Payment Reminder",
  "Invoice",
  "Receipt"
];

const bodyTemplates = [
  "Hi,\n\nHope you're doing well. I wanted to reach out regarding {topic}.\n\nBest regards,\n{name}",
  "Dear {name},\n\nI hope this email finds you well. I'm writing to discuss {topic}.\n\nLooking forward to your response.\n\nBest,\n{name}",
  "Hello,\n\nI wanted to follow up on {topic}. Please let me know your thoughts.\n\nThanks,\n{name}",
  "Hi there,\n\nQuick update on {topic}. Let me know if you have any questions.\n\nCheers,\n{name}",
  "Dear {name},\n\nThank you for your interest in {topic}. I've attached the relevant documents.\n\nBest regards,\n{name}",
  "Hello,\n\nI'm reaching out about {topic}. Please review and share your feedback.\n\nThanks,\n{name}",
  "Hi,\n\nJust wanted to touch base on {topic}. Looking forward to hearing from you.\n\nBest,\n{name}",
  "Dear {name},\n\nI hope you're having a great week. I wanted to discuss {topic}.\n\nBest regards,\n{name}"
];

const categories = ["primary", "social", "promotions", "updates", "forums", "support"];

const labelOptions = [
  { id: "work", name: "Work", color: "#4285f4", type: "user" },
  { id: "personal", name: "Personal", color: "#0f9d58", type: "user" },
];

const attachmentTypes = [
  { type: "application/pdf", ext: "pdf" },
  { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx" },
  { type: "application/vnd.ms-excel", ext: "xlsx" },
  { type: "image/png", ext: "png" },
  { type: "image/jpeg", ext: "jpg" },
];

const attachmentNames = [
  "report", "document", "presentation", "spreadsheet", "image", "file",
  "agenda", "minutes", "proposal", "contract", "invoice", "receipt"
];

function loadExistingEmails() {
  if (!fs.existsSync(DATA_PATH)) {
    return [];
  }
  try {
    const content = fs.readFileSync(DATA_PATH, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Error reading ${DATA_PATH}:`, err.message);
    return [];
  }
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(startDate.getTime() + randomTime);
}

function formatDate(date) {
  return date.toISOString();
}

function generateEmailAddress(name) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, ".");
  const domain = randomFrom(emailDomains);
  return `${cleanName}@${domain}`;
}

function generateSubject() {
  const template = randomFrom(subjectTemplates);
  const variation = randomInt(1, 999);
  return `${template} #${variation}`;
}

function generateBody(fromName) {
  const template = randomFrom(bodyTemplates);
  const topics = ["the project", "our meeting", "the proposal", "the report", "next steps", "the update"];
  const topic = randomFrom(topics);
  return template.replace(/{topic}/g, topic).replace(/{name}/g, fromName);
}

function generateSnippet(body) {
  const words = body.split(/\s+/);
  const snippetLength = Math.min(50, words.length);
  return words.slice(0, snippetLength).join(" ") + "...";
}

function generateAttachments() {
  const hasAttachments = Math.random() > 0.6;
  if (!hasAttachments) {
    return [];
  }

  const count = randomInt(1, 3);
  const attachments = [];
  for (let i = 0; i < count; i++) {
    const attachType = randomFrom(attachmentTypes);
    const attachName = randomFrom(attachmentNames);
    const size = randomInt(100000, 5000000);
    attachments.push({
      id: `attach${Date.now()}-${i}`,
      name: `${attachName}_${randomInt(100, 999)}.${attachType.ext}`,
      size: size,
      type: attachType.type,
      url: `https://example.com/${attachName}_${randomInt(100, 999)}.${attachType.ext}`,
    });
  }
  return attachments;
}

function generateEmails(existingEmails, count) {
  const existingIds = new Set(existingEmails.map((e) => (e.id || "").toLowerCase()));

  const newEmails = [];
  let attempts = 0;
  let nextId = existingEmails.length > 0
    ? Math.max(...existingEmails.map(e => {
        const match = (e.id || "").match(/email(\d+)/);
        return match ? Number.parseInt(match[1], 10) : 0;
      })) + 1
    : 1;

  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-12-31");

  while (newEmails.length < count && attempts < count * 20) {
    const id = `email${nextId}`;
    
    if (existingIds.has(id.toLowerCase())) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const fromFirstName = randomFrom(firstNames);
    const fromLastName = randomFrom(lastNames);
    const fromName = `${fromFirstName} ${fromLastName}`;
    const fromEmail = generateEmailAddress(fromName);
    const hasAvatar = Math.random() > 0.5;

    const toName = "Me";
    const toEmail = "me@gmail.com";

    const subject = generateSubject();
    const body = generateBody(fromName);
    const snippet = generateSnippet(body);
    const timestamp = randomDate(startDate, endDate);

    const category = randomFrom(categories);
    const labels = Math.random() > 0.5 ? [randomFrom(labelOptions)] : [];

    const hasAttachments = Math.random() > 0.6;
    const attachments = hasAttachments ? generateAttachments() : [];

    const threadId = `thread${nextId}`;

    const email = {
      id,
      from: {
        name: fromName,
        email: fromEmail,
        ...(hasAvatar && { avatar: `https://example.com/avatars/${fromName.toLowerCase().replace(/\s+/g, "")}.jpg` }),
      },
      to: [{ name: toName, email: toEmail }],
      subject,
      body,
      snippet,
      timestamp: formatDate(timestamp),
      isRead: Math.random() > 0.3,
      isStarred: Math.random() > 0.8,
      isSnoozed: Math.random() > 0.9,
      isDraft: Math.random() > 0.95,
      isImportant: Math.random() > 0.7,
      labels,
      category,
      threadId,
      ...(attachments.length > 0 && { attachments }),
    };

    existingIds.add(id.toLowerCase());
    newEmails.push(email);
    nextId += 1;
    attempts += 1;
  }

  return newEmails;
}

function main() {
  const emails = loadExistingEmails();
  const newEntries = generateEmails(emails, count);

  if (newEntries.length === 0) {
    console.warn("No new emails were generated. Try increasing the vocabulary or count.");
    return;
  }

  const updated = [...emails, ...newEntries];
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");
  console.log(`Added ${newEntries.length} new emails to ${DATA_PATH}`);
}

main();

