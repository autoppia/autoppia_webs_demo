#!/usr/bin/env node

/**
 * Generate additional task entries
 * Usage:
 *   node scripts/generateTasks.js --count=50
 *
 * The script reads the existing src/data/tasks.json file, generates the requested
 * number of new tasks, skips any duplicates (by id), and appends the new entries
 * to the JSON file.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_COUNT = 50;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.resolve(PROJECT_ROOT, "src/data/tasks.json");

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
const taskNames = [
  "Complete project proposal",
  "Review team performance",
  "Update documentation",
  "Schedule team meeting",
  "Prepare presentation",
  "Review code changes",
  "Update project timeline",
  "Send status report",
  "Organize files",
  "Plan sprint",
  "Write test cases",
  "Fix bugs",
  "Deploy application",
  "Monitor system",
  "Backup database",
  "Update dependencies",
  "Refactor code",
  "Write user stories",
  "Conduct code review",
  "Update README",
  "Set up CI/CD",
  "Optimize performance",
  "Design mockups",
  "Write API documentation",
  "Test new features",
  "Review pull requests",
  "Update security policies",
  "Plan team training",
  "Organize meeting notes",
  "Update project status"
];

const taskDescriptions = [
  "Write and submit the quarterly project proposal",
  "Analyze Q1 team metrics and prepare feedback",
  "Refresh API documentation and user guides",
  "Plan next week's team retrospectives",
  "Create slides for the upcoming presentation",
  "Review and approve code changes from team",
  "Update project timeline with latest milestones",
  "Send weekly status report to stakeholders",
  "Organize and categorize project files",
  "Plan tasks for the next sprint",
  "Write comprehensive test cases for new features",
  "Fix identified bugs in the system",
  "Deploy latest version to production",
  "Monitor system performance and logs",
  "Create backup of production database",
  "Update project dependencies to latest versions",
  "Refactor legacy code for better maintainability",
  "Write detailed user stories for new features",
  "Conduct thorough code review for pull requests",
  "Update README with latest project information",
  "Set up continuous integration and deployment",
  "Optimize application performance and speed",
  "Design UI mockups for new features",
  "Write comprehensive API documentation",
  "Test newly implemented features thoroughly",
  "Review and merge pull requests from team",
  "Update security policies and procedures",
  "Plan training sessions for team members",
  "Organize and archive meeting notes",
  "Update project status dashboard"
];

const statuses = ["pending", "in_progress", "completed"];

function loadExistingTasks() {
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

function generateTaskName() {
  const base = randomFrom(taskNames);
  const variation = randomInt(1, 999);
  return `${base} ${variation}`;
}

function generateTasks(existingTasks, count) {
  const existingIds = new Set(existingTasks.map((t) => (t.id || "").toLowerCase()));
  const existingNames = new Set(existingTasks.map((t) => (t.name || "").toLowerCase()));

  const newTasks = [];
  let attempts = 0;
  let nextId = existingTasks.length > 0
    ? Math.max(...existingTasks.map(t => {
        const match = (t.id || "").match(/^(\d+)$/);
        return match ? Number.parseInt(match[1], 10) : 0;
      })) + 1
    : 1;

  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-12-31");

  while (newTasks.length < count && attempts < count * 20) {
    const id = String(nextId);
    
    if (existingIds.has(id.toLowerCase())) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    let name = generateTaskName();
    let nameAttempt = 0;
    while (existingNames.has(name.toLowerCase()) && nameAttempt < 10) {
      name = generateTaskName();
      nameAttempt += 1;
    }
    if (existingNames.has(name.toLowerCase())) {
      name = `${name} ${randomInt(100, 9999)}`;
    }

    const description = randomFrom(taskDescriptions);
    const priority = randomInt(1, 4);
    const status = randomFrom(statuses);
    const createdAt = formatDate(randomDate(startDate, endDate));

    const task = {
      id,
      name,
      description,
      priority,
      status,
      createdAt
    };

    existingIds.add(id.toLowerCase());
    existingNames.add(name.toLowerCase());
    newTasks.push(task);
    nextId += 1;
    attempts += 1;
  }

  return newTasks;
}

function main() {
  const tasks = loadExistingTasks();
  const newEntries = generateTasks(tasks, count);

  if (newEntries.length === 0) {
    console.warn("No new tasks were generated. Try increasing the vocabulary or count.");
    return;
  }

  const updated = [...tasks, ...newEntries];
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");
  console.log(`Added ${newEntries.length} new tasks to ${DATA_PATH}`);
}

main();

