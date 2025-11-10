import { getEffectiveLayoutConfig, isDynamicEnabled } from "../library/layouts";
import { initializeUsers, initializePosts, initializeJobs, initializeRecommendations } from "../data/autoconnect-enhanced";
import type { User, Post, Job, Recommendation } from "../library/dataset";

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
      
      this.users = users;
      this.posts = posts;
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
    return this.users.find(user => user.username === username);
  }

  /**
   * Get posts by user
   */
  getPostsByUser(username: string): Post[] {
    return this.posts.filter(post => post.user.username === username);
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
      user.bio.toLowerCase().includes(searchTerm)
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

