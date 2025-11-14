#!/usr/bin/env node

/**
 * Generate additional calendar event entries
 * Usage:
 *   node scripts/generateEvents.js --count=50
 *
 * The script reads the existing src/data/events.json file, generates the requested
 * number of new events, skips any duplicates (by id), and appends the new entries
 * to the JSON file.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_COUNT = 50;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.resolve(PROJECT_ROOT, "src/data/events.json");

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
const eventLabels = [
  "Team Meeting", "Doctor Appointment", "Project Demo", "Yoga Class", "Movie Night",
  "Lunch with Mentor", "Parent-Teacher Meeting", "Hackathon", "Morning Run", "Dinner with Friends",
  "Design Review", "1:1 with Manager", "Game Night", "Dentist Appointment", "Sprint Planning",
  "Client Presentation", "Code Review", "Standup Meeting", "Workshop", "Conference Call",
  "Interview", "Training Session", "Team Building", "Birthday Party", "Anniversary",
  "Gym Session", "Coffee Meeting", "Networking Event", "Webinar", "Seminar",
  "Product Launch", "Release Planning", "Retrospective", "Budget Review", "Performance Review"
];

const calendars = ["Work", "Personal", "Wellness", "Friends", "Family"];

const calendarColors = {
  "Work": "#2196F3",
  "Personal": "#E53935",
  "Wellness": "#43A047",
  "Friends": "#FBC02D",
  "Family": "#D81B60"
};

const locations = [
  "Zoom", "Office", "Clinic", "Central Park", "Cinema City", "Cafe Delight",
  "Greenwood School", "HQ - Main Hall", "Neighborhood", "Downtown Grill",
  "Smile Dental", "Alice's House", "Conference Room A", "Remote", "Home",
  "Restaurant", "Gym", "Library", "Park", "Hotel"
];

const descriptions = [
  "Weekly sync with team.",
  "Annual checkup.",
  "Demo for client.",
  "Morning yoga at the park.",
  "Watching the latest blockbuster.",
  "Catch up and career advice.",
  "Discuss progress at school.",
  "Internal company hackathon.",
  "Quick run before work.",
  "Catch up at the new restaurant.",
  "Review new UI designs.",
  "Monthly check-in.",
  "Board games and snacks.",
  "Routine cleaning.",
  "Plan next sprint tasks.",
  "Present project updates to stakeholders.",
  "Review code changes and provide feedback.",
  "Daily standup with the team.",
  "Attend technical workshop.",
  "Important client call.",
  "Job interview for new position.",
  "Training on new technologies.",
  "Team building activities.",
  "Celebrate birthday with friends.",
  "Anniversary dinner.",
  "Regular gym workout session.",
  "Coffee catch-up meeting.",
  "Networking with industry professionals.",
  "Attend online webinar.",
  "Technical seminar presentation."
];

const firstNames = ["alice", "bob", "jane", "john", "mary", "david", "sarah", "mike", "emily", "chris"];
const lastNames = ["smith", "johnson", "williams", "brown", "jones", "garcia", "miller", "davis"];

const recurrences = ["none", "daily", "weekly", "monthly"];
const visibilities = ["default", "private", "public"];

const reminderOptions = [5, 10, 15, 30, 60, 120, 1440]; // minutes

function loadExistingEvents() {
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

function generateAttendees(count) {
  const attendees = [];
  for (let i = 0; i < count; i++) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    attendees.push(`${firstName}.${lastName}@example.com`);
  }
  return attendees;
}

function generateMeetingLink() {
  const platforms = [
    "https://zoom.us/j/",
    "https://meet.google.com/",
    "https://teams.microsoft.com/l/meetup-join/"
  ];
  const platform = randomFrom(platforms);
  const id = Math.random().toString(36).substring(2, 15);
  return platform === "https://zoom.us/j/"
    ? `${platform}${randomInt(100000000, 999999999)}`
    : platform === "https://meet.google.com/"
    ? `${platform}${id.substring(0, 3)}-${id.substring(3, 6)}-${id.substring(6, 9)}`
    : `${platform}${id}`;
}

function generateEvents(existingEvents, count) {
  const existingIds = new Set(existingEvents.map((e) => (e.id || "").toLowerCase()));
  let nextId = existingEvents.length > 0
    ? Math.max(...existingEvents.map(e => {
        const match = (e.id || "").match(/^(\d+)$/);
        return match ? Number.parseInt(match[1], 10) : 0;
      })) + 1
    : 1;

  const newEvents = [];
  let attempts = 0;
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-12-31");

  while (newEvents.length < count && attempts < count * 20) {
    const id = String(nextId);
    
    if (existingIds.has(id.toLowerCase())) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const date = randomDate(startDate, endDate);
    const dateStr = formatDate(date);
    
    const startHour = randomInt(8, 20);
    const startMinute = randomFrom([0, 30]);
    const duration = randomInt(1, 4); // hours
    const endHour = startHour + duration;
    const endMinute = startMinute;
    
    const start = startHour + (startMinute === 30 ? 0.5 : 0);
    const end = endHour + (endMinute === 30 ? 0.5 : 0);
    
    const startTime = [startHour, startMinute];
    const endTime = [endHour, endMinute];
    
    const label = randomFrom(eventLabels);
    const calendar = randomFrom(calendars);
    const color = calendarColors[calendar] || "#2196F3";
    const description = randomFrom(descriptions);
    const location = randomFrom(locations);
    const allDay = Math.random() > 0.9;
    
    const recurrence = randomFrom(recurrences);
    let recurrenceEndDate = null;
    if (recurrence !== "none") {
      const recurrenceEnd = new Date(date);
      if (recurrence === "daily") {
        recurrenceEnd.setDate(recurrenceEnd.getDate() + randomInt(7, 30));
      } else if (recurrence === "weekly") {
        recurrenceEnd.setDate(recurrenceEnd.getDate() + randomInt(30, 90));
      } else if (recurrence === "monthly") {
        recurrenceEnd.setMonth(recurrenceEnd.getMonth() + randomInt(3, 12));
      }
      recurrenceEndDate = formatDate(recurrenceEnd);
    } else {
      recurrenceEndDate = dateStr;
    }
    
    const attendeeCount = randomInt(0, 5);
    const attendees = generateAttendees(attendeeCount);
    
    const reminderCount = randomInt(0, 2);
    const reminders = [];
    for (let i = 0; i < reminderCount; i++) {
      reminders.push(randomFrom(reminderOptions));
    }
    
    const busy = Math.random() > 0.3;
    const visibility = randomFrom(visibilities);
    
    const hasMeetingLink = Math.random() > 0.5 && (calendar === "Work" || Math.random() > 0.7);
    const meetingLink = hasMeetingLink ? generateMeetingLink() : "";

    const event = {
      id,
      date: dateStr,
      start,
      end,
      label,
      calendar,
      color,
      startTime,
      endTime,
      description,
      location,
      allDay,
      recurrence,
      recurrenceEndDate,
      attendees,
      reminders,
      busy,
      visibility,
      meetingLink
    };

    existingIds.add(id.toLowerCase());
    newEvents.push(event);
    nextId += 1;
    attempts += 1;
  }

  return newEvents;
}

function main() {
  const events = loadExistingEvents();
  const newEntries = generateEvents(events, count);

  if (newEntries.length === 0) {
    console.warn("No new events were generated. Try increasing the vocabulary or count.");
    return;
  }

  const updated = [...events, ...newEntries];
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");
  console.log(`Added ${newEntries.length} new events to ${DATA_PATH}`);
}

main();

