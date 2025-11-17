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
      { id: 'CL-1042', name: 'Peak Ventures', email: 'contact@peakventures.com', matters: 4, status: 'On Hold', last: '1w ago' },
      { id: 'CL-1099', name: 'Jessica Brown', email: 'jessica.brown@mailbox.com', matters: 1, status: 'Active', last: 'Yesterday' },
    ],
    categories: ['Active','On Hold','Archived'],
    namingRules: {
      id: 'CL-{number}'
    },
    additionalRequirements: 'Generate realistic CRM clients with unique ids (use CL-####), coherent corporate/person names, and valid emails with matching domains (no placeholders). matters must be an integer 0–8. status must be one of {Active, On Hold, Archived} with a realistic distribution (≈60% Active, 25% On Hold, 15% Archived). Include a short humanized last value like "Today", "Yesterday", "2d ago", "1w ago". Avoid lorem text, dummy values, or duplicates. Ensure names and emails feel from the same entity.'
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
      { id: 'MAT-0142', name: 'IP Filing – Software Patent', client: 'Peak Ventures', status: 'On Hold', updated: '3d ago' },
      { id: 'MAT-0190', name: 'M&A Due Diligence', client: 'Global Reach Inc.', status: 'Archived', updated: 'Last week' },
    ],
    categories: ['Active','On Hold','Archived'],
    namingRules: { id: 'MAT-{number}' },
    additionalRequirements: 'Return realistic legal matter items with specific, professional names (e.g., "Trademark Registration – Class 25"). client must look like a real client name. status ∈ {Active, On Hold, Archived} with varied mix. updated must be a short humanized string like "Today", "Yesterday", "2d ago", "Last week". No lorem, no placeholders, no duplicates. Keep naming consistent with clients.'
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
      { id: 2, name: 'NDA-Sample.docx', size: '98 KB', version: 'v1', updated: 'Yesterday', status: 'Draft' },
      { id: 3, name: 'Patent-Application.pdf', size: '1.3 MB', version: 'v4', updated: 'Last month', status: 'Submitted' },
    ],
    categories: ['Signed','Draft','Submitted'],
    namingRules: {},
    additionalRequirements: 'Provide diverse, realistic legal document names and extensions (.pdf, .docx). Use plausible sizes 60 KB–3 MB. version strings must be in the form v1..v6. updated must be a short humanized string like "Today", "Yesterday", "2d ago", "Last week". status ∈ {Signed, Draft, Submitted}. No placeholders or duplicates.'
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
      { id: 1001, date: '2025-05-21', label: 'Client Call – Jessica Brown', time: '2:00pm', color: 'forest' },
      { id: 1002, date: '2025-05-22', label: 'Court Filing – Smith v. Jones', time: '9:30am', color: 'blue' },
      { id: 1003, date: '2025-05-25', label: 'Internal Review – M&A Diligence', time: '1:15pm', color: 'indigo' },
    ],
    categories: ['calendar'],
    namingRules: {},
    additionalRequirements: 'Events must be realistic law-firm items with specific labels (e.g., "Client Call – Full Name", "Court Filing – Case Name"). Dates should be within the current and next month in YYYY-MM-DD. time should be in the format like "11:00am" or "3:45pm". color ∈ {forest, indigo, blue, zinc}. Avoid placeholders.'
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
      { id: 5002, matter: 'Contract Review', client: 'Acme Biotech', date: '2025-05-18', hours: 1.5, description: 'Draft changes', status: 'Billed' },
      { id: 5003, matter: 'IP Filing', client: 'Peak Ventures', date: '2025-05-17', hours: 3.25, description: 'Prepare documents', status: 'Billable' },
    ],
    categories: ['billing'],
    namingRules: {},
    additionalRequirements: 'Mix of Billable and Billed entries with realistic hours in 0.25 increments (0.5–6.0). date should be within the last 60 days in YYYY-MM-DD. description should be concise and specific (e.g., "Draft terms", "Client call", "Court filing"). Ensure matter and client names look coherent. No placeholders or duplicates.'
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
    const randomSeed = Math.floor(Math.random() * 1_000_000_000);
    const runId = `${projectKey}-${Date.now()}-${randomSeed}`;
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
        // Add variability so responses differ across runs
        random_seed: randomSeed,
        run_id: runId,
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
  const raw = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE ??
               process.env.ENABLE_DYNAMIC_V2_AI_GENERATE ??
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

