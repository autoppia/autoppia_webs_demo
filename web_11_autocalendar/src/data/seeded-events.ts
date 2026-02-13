import { CalendarEvent } from "@/library/dataset";

const CALENDARS = [
  { name: "Work", color: "#1976D2" },
  { name: "Personal", color: "#E53935" },
  { name: "Wellness", color: "#43A047" },
  { name: "Friends", color: "#8E24AA" },
  { name: "Family", color: "#FB8C00" },
  { name: "Travel", color: "#FBC02D" },
];

const TITLES = [
  "Strategy Sync",
  "Doctor Visit",
  "Design Critique",
  "Workshop",
  "Board Games",
  "Investor Call",
  "Sprint Demo",
  "Yoga Flow",
  "Flight Check-in",
  "Budget Review",
  "Volunteer Shift",
  "Client Lunch",
  "Wellness Break",
  "Music Class",
  "Parent Meeting",
  "Planning Session",
];

const LOCATIONS = [
  "Zoom",
  "HQ - Room A",
  "HQ - Room B",
  "Cafe Horizon",
  "Client Office",
  "Library",
  "Studio",
  "Home Office",
  "Community Center",
  "Gym",
  "Park",
];

const RECURRENCES: CalendarEvent["recurrence"][] = [
  "none",
  "daily",
  "weekly",
  "monthly",
];

const VISIBILITY: CalendarEvent["visibility"][] = [
  "default",
  "public",
  "private",
];

const REMINDER_OPTIONS = [[15], [30], [60], [120], []];

const MEETING_LINKS = [
  "",
  "https://meet.google.com/seed-event",
  "https://zoom.us/j/123456789",
  "https://teams.microsoft.com/l/meetup-join/seed",
];

const EMAILS = [
  "alex@example.com",
  "taylor@example.com",
  "jordan@example.com",
  "casey@example.com",
  "lee@example.com",
  "sam@example.com",
];

function seededRandom(seed: number): () => number {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rng: () => number, list: T[]): T =>
  list[Math.floor(rng() * list.length)];

export function generateDeterministicEvents(
  seed: number,
  count: number = 60
): CalendarEvent[] {
  const safeCount = Math.max(10, Math.min(120, count));
  const rng = seededRandom(seed || 1);
  const today = new Date("2025-08-01T00:00:00Z");

  return Array.from({ length: safeCount }).map((_, idx) => {
    const dayOffset = Math.floor(rng() * 45);
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + dayOffset);
    const startHour = 7 + Math.floor(rng() * 12); // between 7 and 18
    const duration = 1 + Math.floor(rng() * 3); // 1-3 hours
    const calendar = pick(rng, CALENDARS);
    const recurrence = pick(rng, RECURRENCES);
    const recurrenceEndDate =
      recurrence === "none"
        ? null
        : new Date(eventDate.getTime() + rng() * 1000 * 60 * 60 * 24 * 60)
            .toISOString()
            .split("T")[0];
    const attendees = Array.from(
      { length: Math.floor(rng() * 3) },
      () => pick(rng, EMAILS)
    );

    return {
      id: `seed-${seed}-${idx}`,
      date: eventDate.toISOString().split("T")[0],
      start: startHour,
      end: startHour + duration,
      label: pick(rng, TITLES),
      calendar: calendar.name,
      color: calendar.color,
      startTime: [startHour, 0],
      endTime: [startHour + duration, 0],
      description: `Seeded event ${idx + 1} for seed ${seed}`,
      location: pick(rng, LOCATIONS),
      allDay: false,
      recurrence,
      recurrenceEndDate,
      attendees,
      reminders: pick(rng, REMINDER_OPTIONS),
      busy: rng() > 0.3,
      visibility: pick(rng, VISIBILITY),
      meetingLink: pick(rng, MEETING_LINKS),
    };
  });
}
