import { getEffectiveLayoutConfig, isDynamicEnabled } from "../library/layouts";
import { initializeUsers, initializePosts, initializeJobs, initializeRecommendations } from "../data/autoconnect-enhanced";
import type { User, Post, Job, Recommendation, PostComment } from "../library/dataset";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

// Dynamic data provider that manages data loading and layout configuration
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled: boolean = false;
  private users: User[] = [];
  private posts: Post[] = [];
  private jobs: Job[] = [];
  private recommendations: Recommendation[] = [];
  private ready = false;
  private readyPromise: Promise<void>;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
    this.readyPromise = this.initialize();
  }

  private createSlugFromName(name?: string | null): string | null {
    if (!name) return null;
    const cleaned = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return cleaned || null;
  }

  private normalizeUsername(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.toLowerCase();
  }

  private determineUsername(user: User): string | null {
    const provided = this.normalizeUsername(user.username);
    const looksLikeNameSlug = provided && /[._-]/.test(provided);
    if (provided && looksLikeNameSlug) {
      return provided;
    }

    const nameSlug = this.createSlugFromName(user.name);
    if (nameSlug) {
      return nameSlug;
    }

    return provided;
  }

  private mergeUsersFromSources(users: User[], posts: Post[]): { users: User[]; posts: Post[] } {
    const userMap = new Map<string, User>();
    const insertionOrder: string[] = [];

    const rememberUser = (candidate: User | undefined | null): User | undefined => {
      if (!candidate || !candidate.username) {
        if (!candidate?.name) {
          return undefined;
        }
      }

      const slug = this.determineUsername(candidate);
      if (!slug) {
        return undefined;
      }

      const key = slug;
      if (!key) {
        return undefined;
      }

      const existing = userMap.get(key);
      if (existing) {
        this.enrichUser(existing, candidate);
        if (!existing.username) {
          existing.username = key;
        }
        return existing;
      }

      const normalizedUser: User = {
        ...candidate,
        username: key,
        about: candidate.about,
        experience: candidate.experience,
      };

      userMap.set(key, normalizedUser);
      insertionOrder.push(key);
      return normalizedUser;
    };

    users.forEach((user) => {
      rememberUser(user);
    });

    const normalizeComment = (comment: PostComment): PostComment => {
      const normalizedUser = rememberUser(comment.user) ?? comment.user;
      if (normalizedUser && normalizedUser.username) {
        return {
          ...comment,
          user: {
            ...normalizedUser,
            username: normalizedUser.username,
          },
        };
      }
      return {
        ...comment,
        user: comment.user,
      };
    };

    const normalizedPosts = posts.map((post) => {
      const normalizedUser = rememberUser(post.user) ?? post.user;
      const normalizedComments = Array.isArray(post.comments)
        ? post.comments.map((comment) => normalizeComment(comment))
        : [];

      return {
        ...post,
        user: normalizedUser && normalizedUser.username
          ? { ...normalizedUser, username: normalizedUser.username }
          : post.user,
        comments: normalizedComments,
      };
    });

    const normalizedUsers = insertionOrder
      .map((key) => userMap.get(key))
      .filter((user): user is User => Boolean(user));

    return { users: normalizedUsers, posts: normalizedPosts };
  }

  private enrichUser(target: User, source: User) {
    if (!target.bio && source.bio) {
      target.bio = source.bio;
    }
    if (!target.title && source.title) {
      target.title = source.title;
    }
    if (!target.avatar && source.avatar) {
      target.avatar = source.avatar;
    }
    if (!target.about && source.about) {
      target.about = source.about;
    }
    if ((!target.experience || target.experience.length === 0) && source.experience && source.experience.length > 0) {
      target.experience = source.experience;
    }
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  /**
   * Initialize the data provider
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Autoconnect data provider...');
      
      // Load all data types in parallel
      const [users, posts, jobs, recommendations] = await Promise.all([
        initializeUsers(),
        initializePosts(),
        initializeJobs(),
        initializeRecommendations()
      ]);
      
      const merged = this.mergeUsersFromSources(users, posts);

      this.users = merged.users;
      this.posts = merged.posts;
      this.jobs = jobs;
      this.recommendations = recommendations;
      this.ready = true;
      
      console.log('✅ Autoconnect data provider initialized:', {
        users: this.users.length,
        posts: this.posts.length,
        jobs: this.jobs.length,
        recommendations: this.recommendations.length
      });
    } catch (error) {
      console.error('❌ Failed to initialize Autoconnect data provider:', error);
      this.ready = true; // Mark as ready even if failed to prevent infinite loading
    }
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  // Get effective seed value - returns 1 (default) when dynamic HTML is disabled
  // Validates seed is between 1-300, defaults to 1 if invalid
  public getEffectiveSeed(providedSeed: number = 1): number {
    if (!this.isEnabled) {
      return 1;
    }
    
    // Validate seed range (1-300)
    if (providedSeed < 1 || providedSeed > 300) {
      return 1;
    }
    
    return providedSeed;
  }

  // Get layout configuration based on seed
  public getLayoutConfig(seed?: number) {
    return getEffectiveLayoutConfig(seed);
  }

  /**
   * Get all users
   */
  getUsers(): User[] {
    return this.users;
  }

  /**
   * Get all posts
   */
  getPosts(): Post[] {
    return this.posts;
  }

  /**
   * Get all jobs
   */
  getJobs(): Job[] {
    return this.jobs;
  }

  /**
   * Get all recommendations
   */
  getRecommendations(): Recommendation[] {
    return this.recommendations;
  }

  /**
   * Get user by username
   */
  getUserByUsername(username: string): User | undefined {
    const normalized = this.normalizeUsername(username);
    if (!normalized) return undefined;
    return this.users.find((user) => this.normalizeUsername(user.username) === normalized);
  }

  /**
   * Get posts by user
   */
  getPostsByUser(username: string): Post[] {
    const normalized = this.normalizeUsername(username);
    if (!normalized) {
      return [];
    }
    return this.posts.filter((post) => this.normalizeUsername(post.user.username) === normalized);
  }

  /**
   * Get job by ID
   */
  getJobById(id: string): Job | undefined {
    return this.jobs.find(job => job.id === id);
  }

  /**
   * Search users by name or title
   */
  searchUsers(query: string): User[] {
    const searchTerm = query.toLowerCase();
    return this.users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.title.toLowerCase().includes(searchTerm) ||
      user.bio.toLowerCase().includes(searchTerm) ||
      (user.username && user.username.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Search jobs by title, company, or location
   */
  searchJobs(query: string): Job[] {
    const searchTerm = query.toLowerCase();
    return this.jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.location.toLowerCase().includes(searchTerm) ||
      (job.description && job.description.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Check if data is ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Wait for data to be ready
   */
  async whenReady(): Promise<void> {
    await this.readyPromise;
  }

  /**
   * Get data loading status
   */
  getStatus(): { ready: boolean; users: number; posts: number; jobs: number } {
    return {
      ready: this.ready,
      users: this.users.length,
      posts: this.posts.length,
      jobs: this.jobs.length
    };
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);

