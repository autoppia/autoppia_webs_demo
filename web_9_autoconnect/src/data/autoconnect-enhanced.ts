"use client";

import type { User, Post, Job, Recommendation } from "@/library/dataset";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";

const PROJECT_KEY = "web_9_autoconnect";

const FALLBACK_USERS: User[] = [
  {
    username: "alexsmith",
    name: "Alex Smith",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    bio: "Product designer crafting end-to-end experiences.",
    title: "Lead Product Designer",
    about:
      "Designer with 8+ years leading cross-functional teams to ship delightful SaaS experiences. Passionate about accessibility, rapid prototyping, and mentoring early career designers.",
    experience: [
      {
        title: "Lead Product Designer",
        company: "Northstar Studio",
        logo: "https://logo.clearbit.com/northstar.com",
        duration: "Jan 2022 – Present · 2 yrs",
        location: "Remote",
        description:
          "Driving the design vision for a suite of B2B tools, collaborating with research, product, and engineering.",
      },
    ],
  },
  {
    username: "maria.lee",
    name: "Maria Lee",
    avatar: "https://randomuser.me/api/portraits/women/21.jpg",
    bio: "Software engineer obsessed with DX & tooling.",
    title: "Senior Software Engineer",
    experience: [
      {
        title: "Senior SWE",
        company: "Pulse Systems",
        logo: "https://logo.clearbit.com/pulsesys.com",
        duration: "Apr 2020 – Present · 4 yrs",
        location: "New York, USA",
        description:
          "Building internal developer tools in React, Node, and GraphQL; leading migration to typed APIs.",
      },
    ],
  },
];

const FALLBACK_POSTS: Post[] = [
  {
    id: "p-fallback-1",
    user: FALLBACK_USERS[0],
    content: "Shipped a design system refresh that cut build time by 30%. 🎉",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    likes: 42,
    liked: false,
    comments: [],
  },
  {
    id: "p-fallback-2",
    user: FALLBACK_USERS[1],
    content: "Speaking at FrontendConf about scaling developer portals next month!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    likes: 18,
    liked: false,
    comments: [],
  },
];

const FALLBACK_JOBS: Job[] = [
  {
    id: "j-fallback-1",
    title: "Sr. Frontend Engineer",
    company: "Arcadia Labs",
    location: "Remote",
    logo: "https://logo.clearbit.com/arcadialabs.com",
    salary: "$130k - $150k",
    type: "Full-time",
    experience: "5+ years",
    description:
      "Own the dashboard experience for our analytics platform. Work with React/TypeScript and GraphQL.",
    postedDate: new Date().toISOString(),
    applicationCount: 82,
    companySize: "100-250",
    industry: "Software",
    remote: true,
  },
];

const FALLBACK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r-fallback-1",
    type: "user",
    title: "Jordan Patel",
    description: "Staff Engineer · Replatform initiatives, API design",
    reason: "People you may know",
    relevanceScore: 0.92,
    category: "people",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    metadata: { location: "Toronto, CA", industry: "Software" },
  },
];

const FALLBACK_MAP: Record<string, any[]> = {
  users: FALLBACK_USERS,
  posts: FALLBACK_POSTS,
  jobs: FALLBACK_JOBS,
  recommendations: FALLBACK_RECOMMENDATIONS,
};

type LoadOptions = {
  limit?: number;
  method?: "select" | "shuffle" | "filter" | "distribute";
  filterKey?: string;
  filterValues?: string[];
};

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autoconnectV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

function resolveSeed(entityType: string, v2SeedValue?: number | null): number {
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {
    dbModeEnabled = false;
  }

  if (dbModeEnabled) {
    // If v2 is enabled, use the v2-seed provided OR from window OR default to 1
    if (typeof v2SeedValue === "number" && v2SeedValue >= 1 && v2SeedValue <= 300) {
      return v2SeedValue;
    }
    // Try to get from window
    const fromWindow = getRuntimeV2Seed();
    if (fromWindow !== null) {
      return fromWindow;
    }
    // Default to 1 if no v2-seed provided
    return 1;
  }

  // If v2 is NOT enabled, automatically use seed=1
  return 1;
}

async function loadEntity<T>(
  entityType: string,
  options: LoadOptions,
  v2SeedValue?: number | null
): Promise<T[]> {
  if (typeof window !== "undefined") {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const seed = resolveSeed(entityType, v2SeedValue);

  try {
    const payload = await fetchSeededSelection<T>({
      projectKey: PROJECT_KEY,
      entityType,
      seedValue: seed,
      limit: options.limit ?? 100,
      method: options.method ?? "shuffle",
      filterKey: options.filterKey,
      filterValues: options.filterValues,
    });

    if (payload && payload.length > 0) {
      console.log(`[autoconnect] Loaded ${payload.length} ${entityType} with seed=${seed}`);
      return payload;
    }

    console.warn(
      `[autoconnect] Empty dataset for ${entityType} (seed=${seed}). Falling back to local sample data.`
    );
  } catch (error) {
    console.error(
      `[autoconnect] Failed to load ${entityType} from dataset (seed=${seed}). Using fallback.`,
      error
    );
  }

  const fallback = FALLBACK_MAP[entityType];
  if (fallback && fallback.length > 0) {
    return fallback as T[];
  }

  return [];
}

export async function initializeUsers(v2SeedValue?: number | null): Promise<User[]> {
  return loadEntity<User>(
    "users",
    {
      limit: 80,
      method: "shuffle",
    },
    v2SeedValue
  );
}

export async function initializePosts(v2SeedValue?: number | null): Promise<Post[]> {
  return loadEntity<Post>(
    "posts",
    {
      limit: 60,
      method: "shuffle",
    },
    v2SeedValue
  );
}

export async function initializeJobs(v2SeedValue?: number | null): Promise<Job[]> {
  return loadEntity<Job>(
    "jobs",
    {
      limit: 60,
      method: "shuffle",
    },
    v2SeedValue
  );
}

export async function initializeRecommendations(
  v2SeedValue?: number | null
): Promise<Recommendation[]> {
  return loadEntity<Recommendation>(
    "recommendations",
    {
      limit: 50,
      method: "shuffle",
    },
    v2SeedValue
  );
}
