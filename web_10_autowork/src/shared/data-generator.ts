/**
 * Universal Data Generation Utility (Web10 Edition)
 * 
 * This utility provides consistent data generation for Web10 ecosystem datasets.
 * It generates realistic mock data for jobs, hires, skills, and experts
 * for use across all Web10-based applications.
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
 * Web10 Project Configurations
 */
export const PROJECT_CONFIGS: Record<string, ProjectDataConfig> = {
  'web_10_jobs': {
    projectName: 'Web10 Jobs',
    dataType: 'jobs',
    interfaceDefinition: `
export interface Job {
  title: string;
  status: 'In progress' | 'Pending' | 'Completed' | 'In review';
  start: string;
  activity: string;
  time: string;
  timestr: string;
  active: boolean;
}
    `,
    examples: [
      {
        title: "Develop NFT marketplace smart contract",
        status: "In progress",
        start: "Apr 2",
        activity: "last active 2 days ago on Testing contract deployment",
        time: "28:00 hrs ($560)",
        timestr: "Time logged this week:",
        active: true,
      },
    ],
    categories: ["In progress", "Pending", "Completed", "In review"],
    namingRules: {},
    additionalRequirements:
      "Generate realistic freelancer job data with project-like names, varied statuses, start dates, and plausible activity logs. Include time tracking strings and human-readable progress.",
  },

  'web_10_hires': {
    projectName: 'Web10 Hires',
    dataType: 'hires',
    interfaceDefinition: `
export interface Hire {
  name: string;
  country: string;
  rate: string;
  rating: number;
  jobs: number;
  role: string;
  avatar: string;
  rehire: boolean;
}
    `,
    examples: [
      {
        name: "Carla M.",
        country: "Argentina",
        rate: "$35.00/hr",
        rating: 4.7,
        jobs: 85,
        role: "Frontend Developer",
        avatar: "https://randomuser.me/api/portraits/women/12.jpg",
        rehire: true,
      },
    ],
    categories: ["Developers", "Designers", "Data", "Blockchain", "QA"],
    namingRules: {
      avatar: "https://randomuser.me/api/portraits/{gender}/{number}.jpg",
    },
    additionalRequirements:
      "Generate realistic freelancer profiles from around the world, with job counts, rates, and ratings. Avatars must be real photos (randomuser.me).",
  },

  'web_10_skills': {
    projectName: 'Web10 Popular Skills',
    dataType: 'skills',
    interfaceDefinition: `
export interface Skill {
  name: string;
}
    `,
    examples: [{ name: "JavaScript" }],
    categories: ["Programming", "Design", "Cloud", "Data", "Security"],
    namingRules: {},
    additionalRequirements:
      "Generate a list of popular technical and creative skills relevant to modern web development and remote work (e.g., React, Figma, AWS).",
  },

  'web_10_experts': {
    projectName: 'Web10 Experts',
    dataType: 'experts',
    interfaceDefinition: `
export interface Expert {
  slug: string;
  name: string;
  country: string;
  role: string;
  avatar: string;
  rate: string;
  rating: number;
  jobs: number;
  consultation: string;
  desc: string;
  stats: { earnings: string; jobs: number; hours: number };
  about: string;
  hoursPerWeek: string;
  languages: string[];
  lastReview: {
    title: string;
    stars: number;
    text: string;
    price: string;
    rate: string;
    time: string;
    dates: string;
  };
}
    `,
    examples: [
      {
        slug: "brandon-m",
        name: "Brandon M.",
        country: "Morocco",
        role: "Blockchain Expert",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        rate: "$70.00/hr",
        rating: 4.9,
        jobs: 80,
        consultation: "$150 per hour",
        desc: "Blockchain development and consultation",
        stats: { earnings: "$6k+", jobs: 80, hours: 200 },
        about:
          "Blockchain expert specializing in decentralized applications, smart contracts, and Ethereum.",
        hoursPerWeek: "30+ hrs/week",
        languages: ["English: Fluent", "Arabic: Native"],
        lastReview: {
          title: "Smart contract development for NFT project",
          stars: 5,
          text: '"Delivered everything ahead of schedule."',
          price: "$1,000",
          rate: "$70/hr",
          time: "15 hours",
          dates: "Apr 20, 2025 - Apr 25, 2025",
        },
      },
    ],
    categories: [
      "Developers",
      "Designers",
      "Data",
      "Product",
      "Marketing",
      "Cloud",
      "AI",
    ],
    namingRules: {
      slug: "{first_name_lower}-{last_initial_lower}",
      avatar: "https://randomuser.me/api/portraits/{gender}/{number}.jpg",
    },
    additionalRequirements:
      "Generate realistic freelancer profiles for a professional marketplace. Include varied countries, roles, languages, and review histories. Use randomuser.me avatars only. Maintain consistency in rate, earnings, and job count.",
  },
};

/**
 * Generate data for a specific Web10 project
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
      headers: { 'Content-Type': 'application/json' },
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
      }),
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
