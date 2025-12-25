import type { Job, Post, Recommendation, User } from "@/library/dataset";
import { users, posts, jobs, recommendations } from "@/data/autoconnect-data";
import { clampBaseSeed } from "@/shared/seed-resolver";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private users: User[] = [];
  private posts: Post[] = [];
  private jobs: Job[] = [];
  private recommendations: Recommendation[] = [];
  private ready = false;
  private readyPromise: Promise<void>;

  private constructor() {
    this.readyPromise = this.initialize();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initialize(): Promise<void> {
    // V2 (DB mode) is disabled by default. Use original data immediately.
    this.users = users;
    this.posts = posts;
    this.jobs = jobs;
    this.recommendations = recommendations;
    this.ready = true;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public searchUsers(query: string): User[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.users;
    return this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalized) ||
        user.username.toLowerCase().includes(normalized) ||
        user.title.toLowerCase().includes(normalized) ||
        user.bio.toLowerCase().includes(normalized)
    );
  }

  public getPosts(): Post[] {
    return this.posts.map((post) => ({
      ...post,
      comments: post.comments || [],
    }));
  }

  public getJobs(): Job[] {
    return this.jobs;
  }

  public getJobById(id: string): Job | undefined {
    return this.jobs.find((job) => job.id === id);
  }

  public searchJobs(query: string): Job[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.jobs;
    return this.jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(normalized) ||
        job.company.toLowerCase().includes(normalized) ||
        (job.location && job.location.toLowerCase().includes(normalized))
    );
  }

  public getRecommendations(): Recommendation[] {
    return this.recommendations;
  }

  public isDynamicModeEnabled(): boolean {
    // V2 is currently off (always uses original data)
    return false;
  }

  public getLayoutConfig(seed?: number) {
    return { seed: clampBaseSeed(seed ?? 1) };
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const whenReady = () => dynamicDataProvider.whenReady();
export const getUsers = () => dynamicDataProvider.getUsers();
export const searchUsers = (query: string) => dynamicDataProvider.searchUsers(query);
export const getPosts = () => dynamicDataProvider.getPosts();
export const getJobs = () => dynamicDataProvider.getJobs();
export const getJobById = (id: string) => dynamicDataProvider.getJobById(id);
export const searchJobs = (query: string) => dynamicDataProvider.searchJobs(query);
export const getRecommendations = () => dynamicDataProvider.getRecommendations();
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
