import type { Job, Post, Recommendation, User } from "@/library/dataset";
import {
  initializeJobs,
  initializePosts,
  initializeRecommendations,
  initializeUsers,
} from "@/data/autoconnect-enhanced";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

const BOOL_TRUE = new Set(["true", "1", "yes", "on"]);

const FALLBACK_USERS: User[] = [
  {
    username: "alexsmith",
    name: "Alex Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Product leader scaling professional communities across mobility and AI.",
    title: "Head of Product • Orbit Mobility",
    about:
      "Leader focused on building inclusive professional communities for transportation and AI.\n\nAlex has shipped multi-platform experiences for Orbit, Lyft, and several YC startups.",
    experience: [
      {
        title: "Head of Product",
        company: "Orbit Mobility",
        logo: "https://logo.clearbit.com/orbitz.com",
        duration: "Apr 2021 - Present • 3 yrs",
        location: "San Francisco, CA",
        description:
          "Leading the product team behind Orbit's professional network. Covering user growth, discovery, and monetization programs.",
      },
      {
        title: "Product Lead",
        company: "Lyft",
        logo: "https://logo.clearbit.com/lyft.com",
        duration: "Nov 2017 - Mar 2021 • 3 yrs 5 mos",
        location: "San Francisco, CA",
        description:
          "Launched the driver's earning dashboard (DAU 2.1M) and scaled cross-rider acquisition funnels.",
      },
    ],
  },
  {
    username: "mayarodriguez",
    name: "Maya Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    bio: "Design lead building accessible ecosystems for global teams.",
    title: "Design Systems Lead • Canvas",
    about:
      "Maya heads the design system program for Canvas. She focuses on inclusive collaboration, scalable component libraries, and mentorship.",
    experience: [
      {
        title: "Design Systems Lead",
        company: "Canvas",
        logo: "https://logo.clearbit.com/canvas.com",
        duration: "Jul 2020 - Present • 4 yrs",
        location: "Remote",
        description:
          "Owned design tooling, accessibility audits, and multi-brand UI libraries. Mentored 12 designers across 3 regions.",
      },
      {
        title: "Senior Product Designer",
        company: "Figma",
        logo: "https://logo.clearbit.com/figma.com",
        duration: "Jan 2017 - Jun 2020 • 3 yrs 6 mos",
        location: "San Francisco, CA",
        description:
          "Led creator monetization tools and contributed to the prototyping system.",
      },
    ],
  },
  {
    username: "priyapatel",
    name: "Priya Patel",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Machine learning engineer creating trustworthy automation.",
    title: "Staff ML Engineer • LumenAI",
    about:
      "Priya builds ML platforms for logistics and healthcare. She enjoys scaling teams, running ML guilds, and mentoring engineers transitioning into AI.",
    experience: [
      {
        title: "Staff ML Engineer",
        company: "LumenAI",
        logo: "https://logo.clearbit.com/openai.com",
        duration: "Feb 2019 - Present • 5 yrs",
        location: "Seattle, WA",
        description:
          "Designed active-learning pipelines for an 8B event dataset, driving 35% faster retraining cycles.",
      },
      {
        title: "Senior Data Scientist",
        company: "Convoy",
        logo: "https://logo.clearbit.com/convoy.com",
        duration: "2016 - 2019 • 3 yrs",
        location: "Seattle, WA",
        description:
          "Launched the ETA prediction engine and orchestration for automated matching.",
      },
    ],
  },
];

const FALLBACK_POSTS: Post[] = [
  {
    id: "p1",
    user: FALLBACK_USERS[0],
    content:
      "Rolled out a guided onboarding checklist for Orbit creators. 32% of new accounts now publish within the first week. Shipping a few learnings soon.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    likes: 42,
    liked: false,
    comments: [
      {
        id: "c1",
        user: FALLBACK_USERS[1],
        text: "Love how you framed the activation metric. Congrats to the team!",
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ],
  },
  {
    id: "p2",
    user: FALLBACK_USERS[1],
    content:
      "Just finished our quarterly accessibility audit: 94 tickets resolved, and we rolled dark-mode tokens across all partner workspaces.",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    likes: 31,
    liked: false,
    comments: [
      {
        id: "c2",
        user: FALLBACK_USERS[2],
        text: "Amazing numbers. Would love to read the migration notes for the tokens.",
        timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      },
    ],
  },
  {
    id: "p3",
    user: FALLBACK_USERS[2],
    content:
      "Prototyped an internal \"trust score\" dashboard that blends active-learning confidence with human review results. Early beta is promising.",
    timestamp: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    likes: 54,
    liked: false,
    comments: [
      {
        id: "c3",
        user: FALLBACK_USERS[0],
        text: "That sounds incredible. Do you open source that dashboard?",
        timestamp: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
      },
    ],
  },
];

const FALLBACK_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Senior Product Designer",
    company: "Northstar Systems",
    location: "Remote - US",
    logo: "https://logo.clearbit.com/northstar.com",
    salary: "$130,000 - $155,000",
    type: "Full-time",
    experience: "5+ years",
    description:
      "Lead design sprints for automation tooling, partnering closely with research and engineering to ship multi-platform workflows.",
    requirements: [
      "Expert in Figma and systems thinking",
      "Experience building enterprise platforms",
    ],
    benefits: ["Flexible remote setup", "Annual learning stipend"],
    postedDate: "2024-02-12",
    applicationCount: 48,
    companySize: "200-500 employees",
    industry: "Software",
    remote: true,
  },
  {
    id: "job-2",
    title: "Staff Machine Learning Engineer",
    company: "Verdant AI",
    location: "Seattle, WA",
    logo: "https://logo.clearbit.com/verdant.ai",
    salary: "$165,000 - $190,000",
    type: "Full-time",
    experience: "7+ years",
    description:
      "Architect ML platforms that power Verdant's industrial sustainability products. Blend experimentation tooling with production infra.",
    requirements: [
      "Strong experience with Python, PyTorch, and distributed systems",
      "Track record leading technical roadmaps",
    ],
    benefits: ["Hybrid work policy", "Employee climate stipend"],
    postedDate: "2024-02-15",
    applicationCount: 36,
    companySize: "100-200 employees",
    industry: "Climate & AI",
    remote: false,
  },
  {
    id: "job-3",
    title: "Community Program Manager",
    company: "Signalset",
    location: "New York, NY",
    logo: "https://logo.clearbit.com/signal.ai",
    salary: "$95,000 - $120,000",
    type: "Full-time",
    experience: "4+ years",
    description:
      "Grow Signalset's professional creator network through onboarding programs, live events, and curated recommendation loops.",
    requirements: [
      "Background in community or customer success",
      "Comfort with experimentation and analytics",
    ],
    benefits: ["401k match", "Quarterly company retreats"],
    postedDate: "2024-02-09",
    applicationCount: 62,
    companySize: "50-100 employees",
    industry: "Media & Community",
    remote: false,
  },
];

const FALLBACK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-user-1",
    type: "user",
    title: "Sasha Liu",
    description:
      "Growth PM leading activation initiatives at a fast-scaling HR tech startup.",
    reason: "You both focus on onboarding funnels and cross-functional pods.",
    relevanceScore: 0.86,
    category: "People to follow",
    metadata: { location: "Remote" },
  },
  {
    id: "rec-job-1",
    type: "job",
    title: "Director of Community • AeroStack",
    description:
      "Own multiplatform creator programs and launch new membership experiences.",
    reason: "Matches your experience leading professional memberships.",
    relevanceScore: 0.78,
    category: "Jobs",
    metadata: {
      location: "Hybrid • San Francisco",
      salary: "$150k - $175k",
      skills: ["Community strategy", "Lifecycle marketing"],
    },
  },
  {
    id: "rec-skill-1",
    type: "skill",
    title: "Responsible AI Frameworks Workshop",
    description:
      "Live cohort training covering LLM evaluation, trust scoring, and policy reviews.",
    reason: "You recently engaged with content about ML observability.",
    relevanceScore: 0.72,
    category: "Skills",
    metadata: { location: "Virtual", industry: "AI" },
  },
];

class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private users: User[] = FALLBACK_USERS;
  private posts: Post[] = FALLBACK_POSTS;
  private jobs: Job[] = FALLBACK_JOBS;
  private recommendations: Recommendation[] = FALLBACK_RECOMMENDATIONS;
  private ready = false;
  private readyPromise: Promise<void>;
  private readonly dynamicV2Enabled: boolean;
  private readonly dbModeEnabled: boolean;

  private constructor() {
    this.dynamicV2Enabled = this.resolveDynamicFlag();
    this.dbModeEnabled = isDbLoadModeEnabled();
    this.readyPromise = this.initialize();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private resolveDynamicFlag(): boolean {
    const candidates = [
      process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2,
      process.env.ENABLE_DYNAMIC_V2,
      process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE,
      process.env.ENABLE_DYNAMIC_V2_DB_MODE,
    ];
    return candidates.some((value) => {
      if (!value) return false;
      return BOOL_TRUE.has(value.toLowerCase());
    });
  }

  private shouldLoadRemote(): boolean {
    return this.dbModeEnabled;
  }

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const value = (window as any).__autoconnectV2Seed;
    if (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 1 &&
      value <= 300
    ) {
      return value;
    }
    return null;
  }

  private normalizeSeed(seed?: number | null): number {
    if (typeof seed !== "number" || !Number.isFinite(seed)) return 1;
    if (seed < 1) return 1;
    if (seed > 300) return 300;
    return Math.floor(seed);
  }

  private async initialize(seedOverride?: number | null): Promise<void> {
    this.ready = false;

    if (!this.shouldLoadRemote()) {
      this.ready = true;
      return;
    }

    try {
      // Allow SeedContext to push the value to window before fetching
      if (typeof window !== "undefined") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const runtimeSeed = seedOverride ?? this.getRuntimeV2Seed();
      const effectiveSeed = this.normalizeSeed(runtimeSeed ?? 1);

      const [users, posts, jobs, recommendations] = await Promise.allSettled([
        initializeUsers(effectiveSeed),
        initializePosts(effectiveSeed),
        initializeJobs(effectiveSeed),
        initializeRecommendations(effectiveSeed),
      ]);

      if (users.status === "fulfilled" && users.value.length > 0) {
        this.users = users.value;
      }
      if (posts.status === "fulfilled" && posts.value.length > 0) {
        this.posts = posts.value;
      }
      if (jobs.status === "fulfilled" && jobs.value.length > 0) {
        this.jobs = jobs.value;
      }
      if (
        recommendations.status === "fulfilled" &&
        recommendations.value.length > 0
      ) {
        this.recommendations = recommendations.value;
      }
    } catch (error) {
      console.error("[DynamicDataProvider] Failed to load remote data:", error);
    } finally {
      this.ready = true;
    }
  }

  public refreshDataForSeed(seedOverride?: number | null) {
    this.readyPromise = this.initialize(seedOverride);
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public isDynamicModeEnabled(): boolean {
    return this.dynamicV2Enabled;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getPosts(): Post[] {
    return this.posts;
  }

  public getJobs(): Job[] {
    return this.jobs;
  }

  public getJobById(id: string): Job | undefined {
    return this.jobs.find((job) => job.id === id);
  }

  public getRecommendations(): Recommendation[] {
    return this.recommendations;
  }

  public searchUsers(query: string): User[] {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return this.users
      .filter((user) => {
        return (
          user.name.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term) ||
          (user.title?.toLowerCase().includes(term) ?? false)
        );
      })
      .slice(0, 6);
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

if (typeof window !== "undefined") {
  window.addEventListener("autoconnect:v2SeedChange", (event: any) => {
    const newSeed = event?.detail?.seed ?? null;
    dynamicDataProvider.refreshDataForSeed(newSeed);
  });
}

export const isDynamicModeEnabled = () =>
  dynamicDataProvider.isDynamicModeEnabled();

export const getLayoutConfig = (seed?: number) => {
  const { getEffectiveLayoutConfig } = require("@/dynamic/v1-layouts");
  return getEffectiveLayoutConfig(seed);
};
