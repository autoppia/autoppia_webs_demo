import {
  initializeUsers,
  initializePosts,
  initializeJobs,
  initializeRecommendations,
  type User,
  type Post,
  type Job,
  type Recommendation,
} from "@/data/autoconnect-enhanced";
import { getEffectiveLayoutConfig } from "@/dynamic/v1-layouts";

const isV2Enabled = (): boolean => {
  return (
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE === "true" ||
    process.env.ENABLE_DYNAMIC_V2_DB_MODE === "true"
  );
};

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private ready = false;
  private readyPromise: Promise<void>;
  private isEnabled = false;
  private cleanup?: () => void;

  private users: User[] = [];
  private posts: Post[] = [];
  private jobs: Job[] = [];
  private recommendations: Recommendation[] = [];

  private constructor() {
    this.isEnabled = isV2Enabled();

    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }

    this.readyPromise = this.loadAll();

    const handler = ((event: Event) => {
      const custom = event as CustomEvent<{ seed: number | null }>;
      const nextSeed = custom.detail?.seed ?? undefined;
      this.loadAll(nextSeed).catch((err) =>
        console.error("[DynamicDataProvider] Failed to reload data:", err)
      );
    }) as EventListener;

    window.addEventListener("autoconnect:v2SeedChange", handler);
    this.cleanup = () => window.removeEventListener("autoconnect:v2SeedChange", handler);
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getRuntimeV2Seed(): number | undefined {
    if (typeof window === "undefined") return undefined;
    const value = (window as any).__autoconnectV2Seed;
    if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
      return value;
    }
    return undefined;
  }

  private async loadAll(seedOverride?: number | null): Promise<void> {
    try {
      const v2Seed =
        typeof seedOverride === "number" && Number.isFinite(seedOverride)
          ? seedOverride
          : this.getRuntimeV2Seed();

      const [users, posts, jobs, recommendations] = await Promise.all([
        initializeUsers(v2Seed ?? undefined),
        initializePosts(v2Seed ?? undefined),
        initializeJobs(v2Seed ?? undefined),
        initializeRecommendations(v2Seed ?? undefined),
      ]);

      this.users = users ?? [];
      this.posts = posts ?? [];
      this.jobs = jobs ?? [];
      this.recommendations = recommendations ?? [];
    } catch (error) {
      console.error("[DynamicDataProvider] Failed to load v2 data:", error);
    } finally {
      this.ready = true;
    }
  }

  public async whenReady(): Promise<void> {
    await this.readyPromise;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public isDynamicEnabled(): boolean {
    return this.isEnabled;
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
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return this.users;
    }
    return this.users.filter((user) => {
      return (
        user.name.toLowerCase().includes(normalized) ||
        user.username.toLowerCase().includes(normalized) ||
        (user.title || "").toLowerCase().includes(normalized)
      );
    });
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicEnabled();
export const getLayoutConfig = (seed?: number) => getEffectiveLayoutConfig(seed);
