/**
 * Universal Data Generation Utility for web_6_automail
 * 
 * This utility provides consistent email data generation for the web_6_automail project.
 * It generates realistic email data based on predefined types and configurations.
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

// Project-specific configurations
export const PROJECT_CONFIGS: Record<string, ProjectDataConfig> = {
  'web_6_automail': {
    projectName: 'AutoMail Email Client',
    dataType: 'emails',
    interfaceDefinition: `
export interface Email {
  id: string;
  from: {
    name: string;
    email: string;
    avatar?: string;
  };
  to: {
    name: string;
    email: string;
  }[];
  cc?: {
    name: string;
    email: string;
  }[];
  bcc?: {
    name: string;
    email: string;
  }[];
  subject: string;
  body: string;
  htmlBody?: string;
  snippet: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isSnoozed: boolean;
  isDraft: boolean;
  isImportant: boolean;
  labels: Label[];
  category: EmailCategory;
  attachments?: Attachment[];
  threadId: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  type: 'system' | 'user';
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export type EmailCategory =
  | 'primary'
  | 'social'
  | 'promotions'
  | 'updates'
  | 'forums'
  | 'support';
    `,
    examples: [
      {
        id: "email1",
        from: {
          name: "Alice Smith",
          email: "alice.smith@company.com",
          avatar: "https://example.com/avatars/alice.jpg",
        },
        to: [{ name: "Me", email: "me@gmail.com" }],
        subject: "Project Kickoff Meeting",
        body: "Dear Me,\n\nLooking forward to our project kickoff meeting next week. Please review the attached agenda.\n\nBest,\nAlice",
        snippet: "Looking forward to our project kickoff meeting next week...",
        timestamp: new Date("2025-07-08T10:00:00Z"),
        isRead: true,
        isStarred: false,
        isSnoozed: false,
        isDraft: false,
        isImportant: true,
        labels: [{ id: "work", name: "Work", color: "#4285f4", type: "user" }],
        category: "primary",
        threadId: "thread1",
        attachments: [
          {
            id: "attach1",
            name: "agenda.pdf",
            size: 1048576,
            type: "application/pdf",
            url: "https://example.com/agenda.pdf",
          },
        ],
      },
    ],
    categories: ["primary", "social", "promotions", "updates", "forums", "support"],
    namingRules: {
      id: "email-{number}",
      threadId: "thread-{number}",
      from: {
        email: "{name_snake_case}@org.com",
        avatar: "https://example.com/avatars/{name_snake_case}.jpg",
      },
      attachment: {
        id: "attach-{number}",
        url: "https://example.com/{name_snake_case}",
      },
    },
    additionalRequirements: `
Generate realistic email data for an email client application. Ensure:
- Email subjects and bodies reflect realistic content for categories (primary, social, promotions, updates, forums, support).
- Use formal tone for primary and professional emails, casual for social, and promotional for promotions.
- Timestamps should be recent (within the last 30 days from 2025-07-09).
- Randomly assign isRead, isStarred, isSnoozed, isDraft, and isImportant (20% chance for each).
- Assign labels from systemLabels (inbox, starred, snoozed, sent, drafts, spam, trash, important) or userLabels (work, personal, team, client, finance, dev, training, social, legal, marketing, hr, survey, product).
- Attachments should have realistic file names and types (e.g., .pdf, .docx, .xlsx, .pptx) with sizes between 0.5MB and 3MB.
- Snippets should be first 50 characters of the body followed by '...'.
- Use unique threadIds for each email.
- Emails should have a 50% chance of including 1-2 attachments.
- Use realistic names and email addresses for from/to fields.
`
  }
};

/**
 * System and user labels for reference
 */
export const systemLabels: Label[] = [
  { id: "inbox", name: "Inbox", color: "#1a73e8", type: "system" },
  { id: "starred", name: "Starred", color: "#f9ab00", type: "system" },
  { id: "snoozed", name: "Snoozed", color: "#ea4335", type: "system" },
  { id: "sent", name: "Sent", color: "#34a853", type: "system" },
  { id: "drafts", name: "Drafts", color: "#9aa0a6", type: "system" },
  { id: "spam", name: "Spam", color: "#ea4335", type: "system" },
  { id: "trash", name: "Trash", color: "#5f6368", type: "system" },
  { id: "important", name: "Important", color: "#fbbc04", type: "system" },
];

export const userLabels: Label[] = [
  { id: "work", name: "Work", color: "#4285f4", type: "user" },
  { id: "personal", name: "Personal", color: "#0f9d58", type: "user" },
  { id: "team", name: "Team", color: "#ff5722", type: "user" },
  { id: "client", name: "Client", color: "#4caf50", type: "user" },
  { id: "finance", name: "Finance", color: "#ffeb3b", type: "user" },
  { id: "dev", name: "Development", color: "#3f51b5", type: "user" },
  { id: "training", name: "Training", color: "#795548", type: "user" },
  { id: "social", name: "Social", color: "#673ab7", type: "user" },
  { id: "legal", name: "Legal", color: "#607d8b", type: "user" },
  { id: "marketing", name: "Marketing", color: "#ff9800", type: "user" },
  { id: "hr", name: "HR", color: "#e91e63", type: "user" },
  { id: "survey", name: "Survey", color: "#cddc39", type: "user" },
  { id: "product", name: "Product", color: "#009688", type: "user" },
];

/**
 * Generate data for a specific project
 */
export async function generateProjectData(
  projectKey: string,
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

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

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
 * Check if data generation is enabled (disabled - AI generate removed)
 */
export function isDataGenerationEnabled(): boolean {
  return false;
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  const origin = typeof window !== "undefined" ? window.location?.origin : undefined;
  const envIsLocal = envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"));
  const originIsLocal = origin && (origin.includes("localhost") || origin.includes("127.0.0.1"));

  if (envUrl && (!(envIsLocal) || originIsLocal)) {
    return envUrl;
  }
  if (origin) {
    return `${origin}/api`;
  }
  return envUrl || "http://app:8090";
}

export type EmailCategory =
  | 'primary'
  | 'social'
  | 'promotions'
  | 'updates'
  | 'forums'
  | 'support';

export interface Label {
  id: string;
  name: string;
  color: string;
  type: 'system' | 'user';
}