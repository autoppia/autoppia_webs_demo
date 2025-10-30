/**
 * Universal Data Generation Utility (Web11 Edition)
 * 
 * This utility provides consistent data generation for the Web11 AutoCalendar project.
 * It generates realistic mock event data for calendar-based applications.
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

/**
 * Project-specific configuration for Web11 AutoCalendar
 */
export const PROJECT_CONFIGS: Record<string, ProjectDataConfig> = {
  'web_11_autocalendar': {
    projectName: 'AutoCalendar',
    dataType: 'calendar_events',
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
    `,
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
      }
    ],
    categories: ["Work", "Personal", "Wellness", "Friends", "Family"],
    namingRules: {
      id: "event-{number}",
      label: "{verb} {topic}",
      color: "#{randomHexColor}"
    },
    additionalRequirements:
      "Generate realistic calendar events with unique titles, time ranges, recurrence types, attendees, and locations. Include both personal and professional events. Ensure start and end times make sense (start < end). Color codes should vary. Some events should include online meeting links (Zoom, Google Meet)."
  }
};

/**
 * Generate data for the Web11 AutoCalendar project
 */
export async function generateProjectData(
  projectKey: string = 'web_11_autocalendar',
  count: number = 10,
  categories?: string[]
): Promise<DataGenerationResponse> {
  const config = PROJECT_CONFIGS[projectKey];
  if (!config) {
    return {
      success: false,
      data: [],
      count: 0,
      generationTime: 0,
      error: `Project configuration not found for: ${projectKey}`
    };
  }

  const startTime = Date.now();

  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/datasets/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interface_definition: config.interfaceDefinition,
        examples: config.examples,
        count: Math.max(1, Math.min(200, count)),
        categories: categories || config.categories,
        additional_requirements: config.additionalRequirements,
        naming_rules: config.namingRules,
        project_key: projectKey,
        entity_type: config.dataType,
        save_to_db: true,
      })
    });

    if (!response.ok) throw new Error(`API request failed: ${response.status}`);

    const result = await response.json();
    const generationTime = (Date.now() - startTime) / 1000;

    return {
      success: true,
      data: result.generated_data,
      count: result.count,
      generationTime,
    };
  } catch (error) {
    const generationTime = (Date.now() - startTime) / 1000;
    return {
      success: false,
      data: [],
      count: 0,
      generationTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Check if data generation is enabled
 */
export function isDataGenerationEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_DATA_GENERATION ??
               process.env.NEXT_ENABLE_DATA_GENERATION ??
               process.env.ENABLE_DATA_GENERATION ??
               '').toString().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 
         process.env.API_URL || 
         'http://localhost:8090';
}
