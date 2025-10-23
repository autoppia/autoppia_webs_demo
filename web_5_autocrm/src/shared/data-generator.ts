/**
 * Universal Data Generation Utility
 * 
 * This utility provides consistent data generation across all web projects.
 * It can generate data for different project types (Django, Next.js, etc.)
 * and handle various data structures.
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
  'web_5_autocrm': {
    projectName: 'AutoCRM',
    dataType: 'clients',
    interfaceDefinition: `
export interface CrmClient {
  id: string;
  name: string;
  email: string;
  matters: number;
  status: 'Active' | 'On Hold' | 'Archived';
  last?: string; // humanized last updated
}
`,
    examples: [
      { id: 'CL-1001', name: 'Acme Biotech', email: 'legal@acmebio.com', matters: 2, status: 'Active', last: '2d ago' },
    ],
    categories: ['Active','On Hold','Archived'],
    namingRules: {
      id: 'CL-{number}'
    },
    additionalRequirements: 'Generate realistic CRM clients with unique ids, corporate/individual names, valid-looking emails, matters count 0-8, and status in {Active, On Hold, Archived}. Keep names and emails coherent.'
  },
  'web_5_autocrm:matters': {
    projectName: 'AutoCRM Matters',
    dataType: 'matters',
    interfaceDefinition: `
export interface CrmMatter {
  id: string;
  name: string;
  client: string;
  status: 'Active' | 'On Hold' | 'Archived';
  updated: string; // humanized
}
`,
    examples: [
      { id: 'MAT-0101', name: 'Contract Review', client: 'Acme Biotech', status: 'Active', updated: 'Today' },
    ],
    categories: ['Active','On Hold','Archived'],
    namingRules: { id: 'MAT-{number}' },
    additionalRequirements: 'Return realistic legal matter items with clear names and client names; ensure status is one of {Active, On Hold, Archived} and updated is short humanized text.'
  },
  'web_5_autocrm:files': {
    projectName: 'AutoCRM Files',
    dataType: 'files',
    interfaceDefinition: `
export interface CrmFile {
  id: number;
  name: string;
  size: string;    // like "234 KB"
  version: string; // like "v2"
  updated: string; // humanized
  status: 'Signed' | 'Draft' | 'Submitted';
}
`,
    examples: [
      { id: 1, name: 'Retainer-Agreement.pdf', size: '234 KB', version: 'v2', updated: 'Today', status: 'Signed' },
    ],
    categories: ['Signed','Draft','Submitted'],
    namingRules: {},
    additionalRequirements: 'Provide diverse legal document names with plausible sizes and version strings; choose status from {Signed, Draft, Submitted}.'
  },
  'web_5_autocrm:events': {
    projectName: 'AutoCRM Calendar Events',
    dataType: 'events',
    interfaceDefinition: `
export type EventColor = 'forest'|'indigo'|'blue'|'zinc'
export interface CalendarEvent {
  id: number;
  date: string; // YYYY-MM-DD
  label: string;
  time: string; // e.g., '11:00am'
  color: EventColor;
}
`,
    examples: [
      { id: 1001, date: '2025-05-21', label: 'Client Call – Jessica', time: '2:00pm', color: 'forest' },
    ],
    categories: ['calendar'],
    namingRules: {},
    additionalRequirements: 'Events must be reasonable law-firm items; keep times human-readable and colors limited to {forest, indigo, blue, zinc}.'
  },
  'web_5_autocrm:logs': {
    projectName: 'AutoCRM Billing Logs',
    dataType: 'logs',
    interfaceDefinition: `
export interface BillingLog {
  id: number;
  matter: string;
  client: string;
  date: string;   // YYYY-MM-DD
  hours: number;  // decimal
  description: string;
  status: 'Billable' | 'Billed';
}
`,
    examples: [
      { id: 5001, matter: 'Estate Planning', client: 'Smith & Co.', date: '2025-05-19', hours: 2, description: 'Consultation', status: 'Billable' },
    ],
    categories: ['billing'],
    namingRules: {},
    additionalRequirements: 'Mix of Billable and Billed entries with realistic hours (0.5–6) and short descriptions.'
  },

};

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

