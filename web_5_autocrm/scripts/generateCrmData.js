#!/usr/bin/env node

/**
 * Generate additional CRM data entries (clients, matters, files, events, logs)
 * Usage:
 *   node scripts/generateCrmData.js --type=clients --count=50
 *   node scripts/generateCrmData.js --type=matters --count=50
 *   node scripts/generateCrmData.js --type=files --count=50
 *   node scripts/generateCrmData.js --type=events --count=50
 *   node scripts/generateCrmData.js --type=logs --count=50
 *
 * The script reads the existing JSON files, generates new entries, skips duplicates,
 * and appends the new entries to the respective JSON files.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_COUNT = 50;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.resolve(PROJECT_ROOT, "src/data");

const args = process.argv.slice(2);
const typeArg = args.find((arg) => arg.startsWith("--type"));
const countArg = args.find((arg) => arg.startsWith("--count"));

let dataType = "clients";
if (typeArg) {
  const [, value] = typeArg.split("=");
  if (value && ["clients", "matters", "files", "events", "logs"].includes(value)) {
    dataType = value;
  }
}

let count = DEFAULT_COUNT;
if (countArg) {
  const [, value] = countArg.split("=");
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isNaN(parsed) && parsed > 0) {
    count = parsed;
  }
}

const DATA_PATH = path.resolve(DATA_DIR, `${dataType}.json`);

// Data pools
const clientFirstNames = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle"
];

const clientLastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor",
  "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez",
  "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams"
];

const companySuffixes = [
  "LLC", "Inc.", "Corp.", "Ltd.", "LLP", "Group", "Partners", "Associates",
  "Holdings", "Enterprises", "Solutions", "Services", "Consulting", "Legal",
  "Capital", "Ventures", "Industries", "International", "Global", "Systems"
];

const matterTypes = [
  "Estate Planning", "Contract Review", "IP Filing", "M&A Advice", "Trademark Registration",
  "Patent Analysis", "Corporate Formation", "Partnership Agreement", "IP Litigation",
  "Shareholder Dispute", "License Drafting", "Employee Contracts", "Real Estate Purchase",
  "Data Protection Audit", "Debt Collection", "Technology Transfer", "Joint Venture Setup",
  "Compliance Review", "Business Incorporation", "Franchise Agreement", "Land Acquisition",
  "Vendor Contract", "Copyright Filing", "Startup Advisory", "Internal Investigation",
  "Financial Compliance", "Supplier Dispute", "Regulatory Approval", "Government Tender",
  "Joint Ownership Case", "Investment Deal Review", "Business Dissolution", "Legal Risk Audit",
  "Engineering IP Audit", "Tax Compliance", "Security Policy Review", "HR Law Training",
  "IT Contract Negotiation", "Asset Sale", "Outsourcing Agreement", "Joint Patent Filing"
];

const fileTypes = [
  "Agreement", "Contract", "Application", "Certificate", "Form", "Policy", "Minutes",
  "Profile", "Details", "Checklist", "Resolution", "Contract", "Compliance", "Agreement",
  "Report", "Evidence", "Report", "Intent", "Agreement", "Agreement", "Filing", "Declaration",
  "Notes", "Agreement", "Memo", "Review", "Plan", "Submission", "Assessment", "Report",
  "Checklist", "Amendment", "Policy", "Notice", "Power-of-Attorney", "Authorization",
  "Agreement", "Summary", "Notes", "Advisory", "Statement", "Invoice", "Filing", "Testimony",
  "Summary"
];

const fileExtensions = ["pdf", "docx", "xlsx", "pptx"];

const eventLabels = [
  "Matter: Signing", "Internal Review", "Court Filing", "Client Call", "Docs Due",
  "Staff Meeting", "Strategy Session", "Deposition", "Mediation", "Hearing",
  "Client Meeting", "Document Review", "Case Conference", "Trial Prep", "Settlement",
  "Contract Negotiation", "Due Diligence", "Board Meeting", "Training Session", "Compliance Check"
];

const eventColors = ["forest", "indigo", "blue", "zinc"];

const timeSlots = [
  "9:00am", "9:30am", "10:00am", "10:30am", "11:00am", "11:30am",
  "12:00pm", "12:30pm", "1:00pm", "1:30pm", "2:00pm", "2:30pm",
  "3:00pm", "3:30pm", "4:00pm", "4:30pm", "5:00pm", "5:30pm"
];

const logDescriptions = [
  "Consultation", "Draft application", "Negotiation call", "Prepare documents", "Review clauses",
  "Strategy meeting", "Legal drafting", "HR consultation", "Risk assessment", "Documentation check",
  "Patent search", "Contract review", "Financial review", "Online filing", "Planning call",
  "Case analysis", "Client call", "Contract draft", "Compliance filing", "Drafting memo",
  "Review terms", "Legal prep", "Lease review", "Meeting notes", "Tax analysis", "Setup docs"
];

const statuses = {
  clients: ["Active", "On Hold", "Archived"],
  matters: ["Active", "On Hold", "Archived"],
  files: ["Draft", "Signed", "Submitted"],
  logs: ["Billable", "Billed"]
};

const timeAgo = ["Today", "Yesterday", "2d ago", "3d ago", "4d ago", "5d ago", "6d ago", "1w ago", "2w ago", "3w ago", "1mo ago", "2mo ago"];

function loadExistingData() {
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateClientName(existingNames) {
  let attempt = 0;
  while (attempt < 50) {
    const isCompany = Math.random() > 0.4;
    let name;
    if (isCompany) {
      const firstName = randomFrom(clientFirstNames);
      const suffix = randomFrom(companySuffixes);
      name = `${firstName} ${suffix}`;
    } else {
      const firstName = randomFrom(clientFirstNames);
      const lastName = randomFrom(clientLastNames);
      name = `${firstName} ${lastName}`;
    }
    
    if (!existingNames.has(name.toLowerCase())) {
      return name;
    }
    attempt += 1;
  }
  // Fallback with random number
  const firstName = randomFrom(clientFirstNames);
  const lastName = randomFrom(clientLastNames);
  return `${firstName} ${lastName} ${randomInt(100, 999)}`;
}

function generateEmail(name) {
  const domain = randomFrom(["example.com", "clientmail.com", "corpmail.com", "legal.com", "business.org", "corp.net"]);
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${cleanName}@${domain}`;
}

function generateClients(existingClients, count) {
  const existingIds = new Set(existingClients.map((c) => (c.id || "").toLowerCase()));
  const existingNames = new Set(existingClients.map((c) => (c.name || "").toLowerCase()));

  const newClients = [];
  let attempts = 0;
  let nextId = existingClients.length > 0
    ? Math.max(...existingClients.map(c => {
        const match = (c.id || "").match(/CL-(\d+)/);
        return match ? Number.parseInt(match[1], 10) : 0;
      })) + 1
    : 101;

  while (newClients.length < count && attempts < count * 20) {
    const id = `CL-${String(nextId).padStart(3, "0")}`;
    
    if (existingIds.has(id.toLowerCase())) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const name = generateClientName(existingNames);
    if (existingNames.has(name.toLowerCase())) {
      attempts += 1;
      continue;
    }

    const client = {
      id,
      name,
      email: generateEmail(name),
      matters: randomInt(1, 6),
      avatar: "",
      status: randomFrom(statuses.clients),
      last: randomFrom(timeAgo),
    };

    existingIds.add(id.toLowerCase());
    existingNames.add(name.toLowerCase());
    newClients.push(client);
    nextId += 1;
    attempts += 1;
  }

  return newClients;
}

function generateMatters(existingMatters, existingClients, count) {
  const existingIds = new Set(existingMatters.map((m) => (m.id || "").toLowerCase()));
  const existingNames = new Set(existingMatters.map((m) => (m.name || "").toLowerCase()));

  const clientNames = existingClients.length > 0
    ? existingClients.map(c => c.name)
    : ["Smith & Co.", "Acme Biotech", "Peak Ventures"];

  const newMatters = [];
  let attempts = 0;
  let nextId = existingMatters.length > 0
    ? Math.max(...existingMatters.map(m => {
        const match = (m.id || "").match(/MAT-(\d+)/);
        return match ? Number.parseInt(match[1], 10) : 0;
      })) + 1
    : 12;

  while (newMatters.length < count && attempts < count * 20) {
    const id = `MAT-${String(nextId).padStart(4, "0")}`;
    
    if (existingIds.has(id.toLowerCase())) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    let name = randomFrom(matterTypes);
    let nameAttempt = 0;
    // If name already exists, add variation
    while (existingNames.has(name.toLowerCase()) && nameAttempt < 10) {
      const baseName = randomFrom(matterTypes);
      const variation = randomInt(1, 999);
      name = `${baseName} #${variation}`;
      nameAttempt += 1;
    }
    // Final fallback if still duplicate
    if (existingNames.has(name.toLowerCase())) {
      name = `${randomFrom(matterTypes)} ${randomInt(1000, 9999)}`;
    }

    const matter = {
      id,
      name,
      status: randomFrom(statuses.matters),
      client: randomFrom(clientNames),
      updated: randomFrom(timeAgo),
    };

    existingIds.add(id.toLowerCase());
    existingNames.add(name.toLowerCase());
    newMatters.push(matter);
    nextId += 1;
    attempts += 1;
  }

  return newMatters;
}

function generateFiles(existingFiles, count) {
  const existingIds = new Set(existingFiles.map((f) => f.id || 0));
  const existingNames = new Set(existingFiles.map((f) => (f.name || "").toLowerCase()));

  const newFiles = [];
  let attempts = 0;
  let nextId = existingFiles.length > 0
    ? Math.max(...existingFiles.map(f => f.id || 0)) + 1
    : 1;

  while (newFiles.length < count && attempts < count * 20) {
    if (existingIds.has(nextId)) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const fileType = randomFrom(fileTypes);
    const ext = randomFrom(fileExtensions);
    const name = `${fileType}-${randomInt(100, 999)}.${ext}`;
    
    if (existingNames.has(name.toLowerCase())) {
      attempts += 1;
      continue;
    }

    const sizes = ["KB", "MB"];
    const sizeUnit = randomFrom(sizes);
    let sizeValue;
    if (sizeUnit === "KB") {
      sizeValue = randomInt(50, 999);
    } else {
      sizeValue = Number((Math.random() * 2.5 + 0.5).toFixed(1));
    }
    const size = `${sizeValue} ${sizeUnit}`;

    const file = {
      id: nextId,
      name,
      size,
      version: `v${randomInt(1, 5)}`,
      updated: randomFrom(timeAgo),
      status: randomFrom(statuses.files),
    };

    existingIds.add(nextId);
    existingNames.add(name.toLowerCase());
    newFiles.push(file);
    nextId += 1;
    attempts += 1;
  }

  return newFiles;
}

function generateEvents(existingEvents, count) {
  const existingIds = new Set(existingEvents.map((e) => e.id || 0));

  const newEvents = [];
  let attempts = 0;
  let nextId = existingEvents.length > 0
    ? Math.max(...existingEvents.map(e => e.id || 0)) + 1
    : 1;

  const startDate = new Date("2025-05-01");
  const endDate = new Date("2025-12-31");

  while (newEvents.length < count && attempts < count * 20) {
    if (existingIds.has(nextId)) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const date = randomDate(startDate, endDate);
    const label = randomFrom(eventLabels);
    const time = randomFrom(timeSlots);
    const color = randomFrom(eventColors);

    const event = {
      id: nextId,
      date: formatDate(date),
      label,
      time,
      color,
    };

    existingIds.add(nextId);
    newEvents.push(event);
    nextId += 1;
    attempts += 1;
  }

  return newEvents;
}

function generateLogs(existingLogs, existingMatters, existingClients, count) {
  const existingIds = new Set(existingLogs.map((l) => l.id || 0));

  const matterNames = existingMatters.length > 0
    ? existingMatters.map(m => m.name)
    : ["Estate Planning", "IP Filing", "M&A Advice"];

  const clientNames = existingClients.length > 0
    ? existingClients.map(c => c.name)
    : ["Smith & Co.", "Acme Biotech", "Peak Ventures"];

  const newLogs = [];
  let attempts = 0;
  let nextId = existingLogs.length > 0
    ? Math.max(...existingLogs.map(l => l.id || 0)) + 1
    : 1;

  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-12-31");

  while (newLogs.length < count && attempts < count * 20) {
    if (existingIds.has(nextId)) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const date = randomDate(startDate, endDate);
    const hours = Number((Math.random() * 5 + 0.5).toFixed(1));

    const log = {
      id: nextId,
      matter: randomFrom(matterNames),
      client: randomFrom(clientNames),
      date: formatDate(date),
      hours,
      description: randomFrom(logDescriptions),
      status: randomFrom(statuses.logs),
    };

    existingIds.add(nextId);
    newLogs.push(log);
    nextId += 1;
    attempts += 1;
  }

  return newLogs;
}

function main() {
  const existing = loadExistingData();
  let newEntries = [];

  if (dataType === "clients") {
    newEntries = generateClients(existing, count);
  } else if (dataType === "matters") {
    // Load clients for matter generation
    const clientsPath = path.resolve(DATA_DIR, "clients.json");
    let clients = [];
    if (fs.existsSync(clientsPath)) {
      try {
        clients = JSON.parse(fs.readFileSync(clientsPath, "utf-8"));
      } catch (e) {
        console.warn("Could not load clients for matter generation");
      }
    }
    newEntries = generateMatters(existing, clients, count);
  } else if (dataType === "files") {
    newEntries = generateFiles(existing, count);
  } else if (dataType === "events") {
    newEntries = generateEvents(existing, count);
  } else if (dataType === "logs") {
    // Load matters and clients for log generation
    const mattersPath = path.resolve(DATA_DIR, "matters.json");
    const clientsPath = path.resolve(DATA_DIR, "clients.json");
    let matters = [];
    let clients = [];
    if (fs.existsSync(mattersPath)) {
      try {
        matters = JSON.parse(fs.readFileSync(mattersPath, "utf-8"));
      } catch (e) {}
    }
    if (fs.existsSync(clientsPath)) {
      try {
        clients = JSON.parse(fs.readFileSync(clientsPath, "utf-8"));
      } catch (e) {}
    }
    newEntries = generateLogs(existing, matters, clients, count);
  }

  if (newEntries.length === 0) {
    console.warn(`No new ${dataType} were generated. Try increasing the vocabulary or count.`);
    return;
  }

  const updated = [...existing, ...newEntries];
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");
  console.log(`Added ${newEntries.length} new ${dataType} to ${DATA_PATH}`);
}

main();

