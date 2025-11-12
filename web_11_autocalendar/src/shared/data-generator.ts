/**
 * Web11 AutoCalendar - Data Generation Utilities
 * Mirrors the implementation style from web_8_autolodge
 */

export interface DataGenerationResponse {
  success: boolean;
  data: any[];
  count: number;
  generationTime: number;
  error?: string;
}

export interface ProjectDataConfig {
  projectName: string;
  dataType: string;
  interfaceDefinition: string;
  examples: any[];
  categories: string[];
  namingRules: Record<string, any>;
  additionalRequirements: string;
}

export const PROJECT_CONFIGS: Record<string, ProjectDataConfig> = {
  web_11_autocalendar: {
    projectName: "AutoCalendar",
    dataType: "calendar_events",
    interfaceDefinition: `
export interface CalendarEvent {
  id: string;
  date: string;
  start: number;
  end: number;
  label: string;
  calendar: string;
  color: string;
  startTime: [number, number];
  endTime: [number, number];
  description: string;
  location: string;
  allDay: boolean;
  recurrence: "none" | "daily" | "weekly" | "monthly";
  recurrenceEndDate: string | null;
  attendees: string[];
  reminders: number[];
  busy: boolean;
  visibility: "default" | "private" | "public";
  meetingLink: string;
}
    `.trim(),
    examples: [
      {
        id: "1",
        date: "2025-08-15",
        start: 9,
        end: 10,
        label: "Team Meeting",
        calendar: "Work",
        color: "#2196F3",
        startTime: [9, 0],
        endTime: [10, 0],
        description: "Weekly sync with team.",
        location: "Zoom",
        allDay: false,
        recurrence: "weekly",
        recurrenceEndDate: "2025-12-31",
        attendees: ["alice@example.com", "bob@example.com"],
        reminders: [30],
        busy: true,
        visibility: "default",
        meetingLink: "https://zoom.us/j/123456789",
      },
    ],
    categories: ["Work", "Personal", "Wellness", "Friends", "Family"],
    namingRules: {
      id: "event-{number}",
      label: "{verb} {topic}",
      color: "#{randomHexColor}",
    },
    additionalRequirements:
      "Generate realistic calendar events with varied titles, logical time ranges, recurrence, attendees, meeting links, and categories.",
  },
};

export async function generateProjectData(
  projectKey: string = "web_11_autocalendar",
  count: number = 50,
  categories?: string[]
): Promise<DataGenerationResponse> {
  const config = PROJECT_CONFIGS[projectKey];
  if (!config) {
    return {
      success: false,
      data: [],
      count: 0,
      generationTime: 0,
      error: `Project not found: ${projectKey}`,
    };
  }

  const startTime = Date.now();
  try {
    const baseUrl = getApiBaseUrl();
    const payload = {
      interface_definition: config.interfaceDefinition,
      examples: config.examples,
      count: Math.max(1, Math.min(200, count)),
      categories: categories || config.categories,
      additional_requirements: config.additionalRequirements,
      naming_rules: config.namingRules,
      project_key: projectKey,
      entity_type: config.dataType,
      save_to_db: true,
    };
    const controller = new AbortController();
    const timeoutMs = 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(`${baseUrl}/datasets/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`API error ${resp.status}: ${text}`);
    }

    const result = await resp.json();
    const generationTime = (Date.now() - startTime) / 1000;
    const data = Array.isArray(result.generated_data) ? result.generated_data : [];
    return { success: true, data, count: result.count || data.length || 0, generationTime };
  } catch (err) {
    const generationTime = (Date.now() - startTime) / 1000;
    return {
      success: false,
      data: [],
      count: 0,
      generationTime,
      error: err instanceof Error ? err.message : "Generation failed",
    };
  }
}

export function isDataGenerationEnabled(): boolean {
  const val = (
    process.env.NEXT_PUBLIC_ENABLE_DATA_GENERATION ??
    process.env.NEXT_PUBLIC_DATA_GENERATION ??
    process.env.ENABLE_DATA_GENERATION ??
    ""
  )
    .toString()
    .toLowerCase();
  const enabled = ["true", "1", "yes", "on"].includes(val);
  return enabled;
}

export function getApiBaseUrl(): string {
  const url = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  );
  return url;
}

// --- Client-side fallback generator (no backend) ---
export function generateClientSideEvents(count: number = 50, categories: string[] = ["Work", "Personal", "Wellness", "Friends", "Family"]): any[] {
  const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const sample = <T,>(arr: T[]) => arr[rnd(0, arr.length - 1)];
  const titles = [
    "Team Sync", "Doctor Appointment", "Project Review", "Yoga Class", "Movie Night",
    "Lunch with Mentor", "Parent-Teacher Meeting", "Hackathon", "Morning Run",
    "Dinner with Friends", "Design Review", "1:1 with Manager", "Game Night",
    "Dentist Appointment", "Sprint Planning"
  ];
  const colors: Record<string, string> = { Work: "#1976D2", Personal: "#E53935", Wellness: "#43A047", Friends: "#8E24AA", Family: "#FB8C00" };
  const emails = ["alice@example.com", "bob@example.com", "carol@example.com", "dave@example.com", "erin@example.com"];

  const today = new Date();
  const toISO = (d: Date) => d.toISOString().split("T")[0];

  const items = Array.from({ length: Math.max(1, Math.min(200, count)) }).map((_, i) => {
    const dayOffset = rnd(0, 30);
    const d = new Date(today);
    d.setDate(today.getDate() + dayOffset);
    const startHour = rnd(7, 19);
    const duration = sample([1, 1, 1, 2]);
    const calendar = sample(categories);
    const attendees = Array.from({ length: rnd(0, 3) }).map(() => sample(emails));
    const recurrence = sample(["none", "daily", "weekly", "monthly"]) as "none" | "daily" | "weekly" | "monthly";
    const endRec = recurrence === "none" ? null : toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + rnd(7, 60)));
    const title = sample(titles);

    return {
      id: `event-${Date.now()}-${i}`,
      date: toISO(d),
      start: startHour,
      end: startHour + duration,
      label: title,
      calendar,
      color: colors[calendar] || "#2196F3",
      startTime: [startHour, 0],
      endTime: [startHour + duration, 0],
      description: `${title} auto-generated`,
      location: sample(["Zoom", "HQ - Room A", "Cafe", "Client Office", "Home"]),
      allDay: false,
      recurrence,
      recurrenceEndDate: endRec,
      attendees,
      reminders: sample([[15], [30], [60], []]),
      busy: sample([true, true, true, false]),
      visibility: sample(["default", "public", "private"]),
      meetingLink: sample([
        "https://meet.google.com/abc-defg-hij",
        "https://zoom.us/j/123456789",
        ""
      ]),
    };
  });

  return items;
}

/**
 * Universal Data Generation Utility (Web11 Edition)
 * 
 * This utility provides consistent data generation for the Web11 AutoCalendar project.
 * It generates realistic mock event data for calendar-based applications.
 */

// (duplicate block removed)
