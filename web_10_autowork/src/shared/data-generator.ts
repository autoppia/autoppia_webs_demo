/**
 * Universal Data Generation Utility (Web10 Edition)
 * 
 * This utility provides consistent data generation for Web10 ecosystem datasets.
 * It generates realistic mock data for jobs, hires, skills, and experts
 * for use across all Web10-based applications.
 * 
 * Extended: Web8-style multi-layered generation for Autowork (jobs, hires, skills, experts)
 */

import { fetchSeededSelection, getSeedValueFromEnv, isDbLoadModeEnabled } from "./seeded-loader";
import { fetchPoolInfo } from "./seeded-loader";

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

  // Autowork (Web10) - Automotive services focused datasets
  'web_10_autowork_jobs': {
    projectName: 'Web10 Autowork - Jobs',
    dataType: 'jobs',
    interfaceDefinition: `
export interface AutoworkJob {
  id: string;
  title: string;
  status: 'Open' | 'Assigned' | 'In progress' | 'Completed';
  location: string; // City, Country
  budget: string; // $100 - $600
  requiredSkills: string[]; // e.g., Brakes, Engine diagnostics
  postedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  notes?: string;
}
    `.trim(),
    examples: [
      {
        id: "job-1001",
        title: "Brake Pad Replacement - Honda Civic 2018",
        status: "Open",
        location: "Lahore, Pakistan",
        budget: "$120 - $180",
        requiredSkills: ["Brakes", "Inspection"],
        postedDate: "2025-10-01",
        dueDate: "2025-10-05",
        notes: "Customer reports squeaking noise and longer braking distance."
      }
    ],
    categories: [
      "Brakes","Engine","Suspension","Electrical","AC & Heating","Tyres","Diagnostics","Transmission"
    ],
    namingRules: {},
    additionalRequirements: `
Generate mechanic gig listings with realistic titles, city locations, budgets in USD, and concrete skill tags. Use statuses from the allowed set. Dates should be in 2025 and logically consistent (dueDate after postedDate by 1–21 days). Ensure requiredSkills is non-empty.
    `.trim()
  },
  'web_10_autowork_hires': {
    projectName: 'Web10 Autowork - Hires',
    dataType: 'hires',
    interfaceDefinition: `
export interface AutoworkHire {
  name: string;
  country: string;
  rate: string; // $/hr
  rating: number; // 1.0 - 5.0
  jobs: number; // completed jobs
  role: string; // e.g., Automotive Technician
  avatar: string; // randomuser.me
  rehire: boolean;
  skills?: string[];
}
    `.trim(),
    examples: [
      {
        name: "Usman R.",
        country: "Pakistan",
        rate: "$22.00/hr",
        rating: 4.6,
        jobs: 56,
        role: "Automotive Technician",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        rehire: true,
        skills: ["Engine diagnostics","OBD-II","Brakes"]
      }
    ],
    categories: ["Technicians","Electricians","AC Specialists","Detailing","Diagnostics"],
    namingRules: { avatar: "https://randomuser.me/api/portraits/{gender}/{number}.jpg" },
    additionalRequirements: `
Create realistic profiles for automotive hires with valid randomuser.me avatars, ratings 3.8–5.0, and hourly rates $15–$80. Jobs (completed) must be non-negative integers.
    `.trim()
  },
  'web_10_autowork_skills': {
    projectName: 'Web10 Autowork - Skills',
    dataType: 'skills',
    interfaceDefinition: `
export interface AutoworkSkill { name: string; }
    `.trim(),
    examples: [ { name: "Engine diagnostics" } ],
    categories: ["Brakes","Engine","Suspension","Electrical","AC","Transmission","Detailing","Bodywork"],
    namingRules: {},
    additionalRequirements: `
Generate a concise list of automotive skills relevant to workshops and mobile mechanics. Names must be non-empty and human readable.
    `.trim()
  },
  'web_10_autowork_experts': {
    projectName: 'Web10 Autowork - Experts',
    dataType: 'experts',
    interfaceDefinition: `
export interface AutoworkExpert {
  slug: string;
  name: string;
  country: string;
  role: string; // Senior Diagnostic Expert, Master Mechanic, etc.
  avatar: string; // randomuser.me
  rate: string; // $/hr
  rating: number; // 1.0 - 5.0
  jobs: number; // completed jobs
  specialties: string[];
  bio: string;
}
    `.trim(),
    examples: [
      {
        slug: "amir-k",
        name: "Amir K.",
        country: "Pakistan",
        role: "Senior Diagnostic Expert",
        avatar: "https://randomuser.me/api/portraits/men/31.jpg",
        rate: "$65.00/hr",
        rating: 4.9,
        jobs: 210,
        specialties: ["ECU","Electrical","OBD-II"],
        bio: "15+ years diagnosing complex electrical and ECU faults for Japanese and European vehicles."
      }
    ],
    categories: ["Diagnostics","Performance","Restoration","Fleet","Hybrid & EV"],
    namingRules: {
      slug: "{first_name_lower}-{last_initial_lower}",
      avatar: "https://randomuser.me/api/portraits/{gender}/{number}.jpg"
    },
    additionalRequirements: `
Experts must include slug, role, rate, rating, jobs, and valid avatar URLs. Ratings 4.2–5.0, jobs 20–1000.
    `.trim()
  }
};

/**
 * Generate data for a specific Web10 project
 */
export async function generateProjectData(
  projectKey: string,
  count = 10,
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
  
  const cacheKey = getCacheKey(projectKey);
  const cached = getCachedData(cacheKey);
  if (cached && cached.length >= Math.max(1, Math.min(200, count))) {
    const generationTime = (Date.now() - startTime) / 1000;
    console.log(`[Autowork] Using cached data: ${cacheKey} (count: ${cached.length})`);
    return { success: true, data: cached, count: cached.length, generationTime };
  }

  const dbMode = isDbLoadModeEnabled();
  const aiEnabled = isDataGenerationEnabled();
  const resolvedBaseUrl = getApiBaseUrl();
  console.log(`[Autowork] Generation flags -> aiEnabled=${aiEnabled}, dbMode=${dbMode}, apiBaseUrl=${resolvedBaseUrl}`);

  // If DB mode is enabled, prefer seeded first for determinism (only if pool is available)
  if (dbMode) {
    try {
      const pool = await fetchPoolInfo(projectKey, config.dataType);
      if (!pool) throw new Error('No dataset pool available');
      console.log(`[Autowork] Using seeded data (DB mode) ...`);
      const seeded = await trySeeded(projectKey, config, count);
      const validated = validateAutoworkData(projectKey, seeded);
      if (validated.length > 0) {
        const generationTime = (Date.now() - startTime) / 1000;
        setCachedData(cacheKey, validated);
        console.log(`[Autowork] Cache set: ${cacheKey} (count: ${validated.length}) generationTime: ${generationTime}s`);
        return { success: true, data: validated, count: validated.length, generationTime };
      }
    } catch (e) {
      console.warn(`[Autowork] Seeded load skipped/failed in DB mode:`, e);
    }
  }

  // Primary: AI generation
  if (aiEnabled) {
    try {
      console.log(`[Autowork] Using AI data generation...`);
      const baseUrl = resolvedBaseUrl;

      // Per-session entropy salt to diversify outputs across sessions
      let entropySalt = '';
      if (typeof window !== 'undefined') {
        try {
          const key = 'autowork_entropy_v1';
          const existing = localStorage.getItem(key);
          if (existing) {
            entropySalt = existing;
          } else {
            entropySalt = Math.random().toString(36).slice(2) + Date.now().toString(36);
            localStorage.setItem(key, entropySalt);
          }
        } catch {}
      }

      const response = await fetch(`${baseUrl}/datasets/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interface_definition: config.interfaceDefinition,
          examples: config.examples,
          count: Math.max(1, Math.min(200, count)),
          categories: categories || config.categories,
          additional_requirements: `${config.additionalRequirements}\n\nUse this entropy token to vary names, locations and values: ${entropySalt}`,
          naming_rules: config.namingRules,
          project_key: projectKey,
          entity_type: config.dataType,
          save_to_db: true,
        }),
      });
      if (!response.ok) {
        let bodyText = '';
        try { bodyText = await response.text(); } catch {}
        console.warn(`[Autowork] AI request failed`, { status: response.status, body: bodyText.slice(0, 400) });
        throw new Error(`API request failed: ${response.status}`);
      }
      const result = await response.json();
      const rawData = (result?.generated_data ?? []) as any[];
      const validated = validateAutoworkData(projectKey, rawData);
      const generationTime = (Date.now() - startTime) / 1000;
      console.log(`[Autowork] Using AI data generation... count: ${validated.length} generationTime: ${generationTime}s`);
      if (validated.length > 0) {
        setCachedData(cacheKey, validated);
        console.log(`[Autowork] Cache set: ${cacheKey} (count: ${validated.length}) generationTime: ${generationTime}s`);
        return { success: true, data: validated, count: validated.length, generationTime };
      }
    } catch (e) {
      console.warn(`[Autowork] AI generation failed:`, e);
    }
  }

  // Secondary: Seeded data (only if pool is available)
  try {
    const pool = await fetchPoolInfo(projectKey, config.dataType);
    if (pool) {
      console.log(`[Autowork] Falling back to seeded data...`);
      const seeded = await trySeeded(projectKey, config, count);
      const validated = validateAutoworkData(projectKey, seeded);
      if (validated.length > 0) {
        const generationTime = (Date.now() - startTime) / 1000;
        setCachedData(cacheKey, validated);
        console.log(`[Autowork] Cache set: ${cacheKey} (count: ${validated.length}) generationTime: ${generationTime}s`);
        return { success: true, data: validated, count: validated.length, generationTime };
      }
    }
  } catch (e) {
    console.warn(`[Autowork] Seeded data skipped/failed:`, e);
  }

  // Tertiary: Static fallback (examples)
  console.log(`[Autowork] Loaded static fallback data...`);
  const fallbackValidated = validateAutoworkData(projectKey, config.examples);
  const generationTime = (Date.now() - startTime) / 1000;
  if (fallbackValidated.length > 0) {
    setCachedData(cacheKey, fallbackValidated);
    console.log(`[Autowork] Cache set: ${cacheKey} (count: ${fallbackValidated.length}) generationTime: ${generationTime}s`);
    return { success: true, data: fallbackValidated, count: fallbackValidated.length, generationTime };
  }

  return {
    success: false,
    data: [],
    count: 0,
    generationTime,
    error: 'All tiers failed: cache miss, AI and seeded generation failed, and no valid examples.'
  };
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

// -----------------------
// Caching helpers (localStorage)
// -----------------------

/**
 * Build a versioned cache key per project
 */
function getCacheKey(projectKey: string): string {
  const short = projectKey
    .replace('web_10_', '')
    .replace('autowork_', '')
    .replace(/[^a-z0-9_]/gi, '');
  return `autowork_${short || projectKey}_v1`;
}

/**
 * Read cached dataset metadata wrapper { timestamp, count, data }
 */
export function getCachedData(key: string): any[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed; // legacy
    if (parsed && Array.isArray(parsed.data)) return parsed.data;
    return null;
  } catch {
    return null;
  }
}

/**
 * Store dataset with metadata for future invalidation strategies
 */
export function setCachedData(key: string, data: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = { timestamp: Date.now(), count: data.length, data };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}

// -----------------------
// Seeded loading helper
// -----------------------
async function trySeeded(projectKey: string, config: ProjectDataConfig, count: number): Promise<any[]> {
  const seed = getSeedValueFromEnv(1);
  const limit = Math.max(1, Math.min(200, count));
  const data = await fetchSeededSelection<any>({
    projectKey,
    entityType: config.dataType,
    seedValue: seed,
    limit,
    method: 'select'
  });
  return data || [];
}

// -----------------------
// Validation & normalization
// -----------------------
function clamp(num: number, min: number, max: number): number {
  if (Number.isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

function normalizeStatus(status: string): 'Open' | 'Assigned' | 'In progress' | 'Completed' {
  const allowed = ['Open','Assigned','In progress','Completed'];
  const found = allowed.find(s => s.toLowerCase() === (status||'').toLowerCase());
  return (found as any) || 'Open';
}

function parseMoneyToRange(value: string): { min: number; max: number } | null {
  if (!value) return null;
  const nums = (value.match(/\d+(?:\.\d+)?/g) || []).map(n => Number.parseFloat(n));
  if (nums.length === 0) return null;
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) };
}

/**
 * Validate and normalize datasets based on project key semantics
 */
export function validateAutoworkData(projectKey: string, items: any[]): any[] {
  if (!Array.isArray(items) || items.length === 0) return [];

  const type = PROJECT_CONFIGS[projectKey]?.dataType;
  const out: any[] = [];
  for (const item of items) {
    try {
      if (type === 'jobs') {
        if (!item?.title || !item?.location || !item?.budget) {
          console.warn('[Autowork] Skipped invalid record: missing required job fields');
          continue;
        }
        const skills = Array.isArray(item.requiredSkills) ? item.requiredSkills.filter((s: any) => !!s) : [];
        if (skills.length === 0) {
          console.warn('[Autowork] Skipped invalid record: requiredSkills empty');
          continue;
        }
        const normalized = {
          ...item,
          status: normalizeStatus(item.status),
          requiredSkills: skills,
        };
        out.push(normalized);
      } else if (type === 'hires') {
        const rating = clamp(Number(item?.rating ?? 0), 1.0, 5.0);
        const jobs = Math.max(0, Number.parseInt(String(item?.jobs ?? 0), 10) || 0);
        const rate = typeof item?.rate === 'string' && item.rate.includes('$') ? item.rate : `$${Number(item?.rate ?? 0)}/hr`;
        const avatar = typeof item?.avatar === 'string' && isValidUrl(item.avatar) ? item.avatar : 'https://randomuser.me/api/portraits/men/1.jpg';
        if (!item?.name) { console.warn('[Autowork] Skipped invalid record: name missing'); continue; }
        out.push({ ...item, rating, jobs, rate, avatar });
      } else if (type === 'skills') {
        if (!item?.name || String(item.name).trim().length === 0) {
          console.warn('[Autowork] Skipped invalid record: skill name empty');
          continue;
        }
        out.push({ name: String(item.name).trim() });
      } else if (type === 'experts') {
        if (!item?.slug || !item?.name || !item?.role) {
          console.warn('[Autowork] Skipped invalid record: expert fields missing');
          continue;
        }
        const rating = clamp(Number(item?.rating ?? 0), 1.0, 5.0);
        const jobs = Math.max(0, Number.parseInt(String(item?.jobs ?? 0), 10) || 0);
        const rate = typeof item?.rate === 'string' && item.rate.includes('$') ? item.rate : `$${Number(item?.rate ?? 0)}/hr`;
        const avatar = typeof item?.avatar === 'string' && isValidUrl(item.avatar) ? item.avatar : 'https://randomuser.me/api/portraits/men/2.jpg';
        out.push({ ...item, rating, jobs, rate, avatar });
      } else {
        // Unknown type: accept as-is
        out.push(item);
      }
    } catch (e) {
      console.warn('[Autowork] Skipped invalid record:', (e as Error).message);
    }
  }

  if (out.length === 0) {
    console.warn('[Autowork] No valid records after validation');
  }
  return out;
}

// -----------------------
// Filter helpers for DynamicDataProvider compatibility
// -----------------------
export function filterAutoworkData<T = any>(data: T[], filters: {
  category?: string;
  minRating?: number;
  locationQuery?: string;
  minBudget?: number;
  maxBudget?: number;
}): T[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  let out = data.slice();

  if (filters.category) {
    const cat = filters.category.toLowerCase();
    out = out.filter((item: any) => {
      const skills: string[] = Array.isArray(item?.requiredSkills) ? item.requiredSkills : (Array.isArray(item?.skills) ? item.skills : []);
      return skills.some(s => String(s).toLowerCase().includes(cat));
    });
  }

  if (typeof filters.minRating === 'number') {
    out = out.filter((item: any) => Number(item?.rating ?? 0) >= filters.minRating!);
  }

  if (filters.locationQuery) {
    const q = filters.locationQuery.toLowerCase();
    out = out.filter((item: any) => String(item?.location ?? item?.country ?? '').toLowerCase().includes(q));
  }

  if (typeof filters.minBudget === 'number' || typeof filters.maxBudget === 'number') {
    out = out.filter((item: any) => {
      const range = parseMoneyToRange(String(item?.budget ?? item?.rate ?? ''));
      if (!range) return false;
      const minOk = typeof filters.minBudget === 'number' ? range.max >= filters.minBudget! : true;
      const maxOk = typeof filters.maxBudget === 'number' ? range.min <= filters.maxBudget! : true;
      return minOk && maxOk;
    });
  }

  return out as T[];
}

// Example usage:
// generateProjectData('web_10_autowork_jobs', 20).then(r => console.log('[Autowork Test]', r));
