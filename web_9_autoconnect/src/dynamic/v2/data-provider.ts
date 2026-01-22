import type { Job, Post, Recommendation, User } from "@/library/dataset";
import { initializeUsers, initializePosts, initializeJobs, initializeRecommendations } from "@/data/autoconnect-enhanced";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private users: User[] = [];
  private posts: Post[] = [];
  private jobs: Job[] = [];
  private recommendations: Recommendation[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady: () => void = () => {};
  private currentSeed: number | null = null;
  private loadingPromise: Promise<void> | null = null;
  
  // Subscribers
  private userSubscribers: Array<(data: User[]) => void> = [];
  private postSubscribers: Array<(data: Post[]) => void> = [];
  private jobSubscribers: Array<(data: Job[]) => void> = [];
  private recommendationSubscribers: Array<(data: Recommendation[]) => void> = [];

  private constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.initialize();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getBaseSeedFromUrl(): number | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get("seed");
    if (seedParam) {
      const parsed = Number.parseInt(seedParam, 10);
      if (Number.isFinite(parsed)) {
        return clampBaseSeed(parsed);
      }
    }
    return null;
  }

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const value = (window as any).__autoconnectV2Seed;
    if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
      return value;
    }
    return null;
  }

  private async initialize(): Promise<void> {
    // Reset ready state when initializing
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    
    const baseSeed = this.getBaseSeedFromUrl();
    const runtimeSeed = this.getRuntimeV2Seed();
    
    // Resolve V2 seed from base seed
    let v2Seed: number | null = null;
    if (baseSeed !== null) {
      const resolvedSeeds = resolveSeedsSync(baseSeed);
      v2Seed = resolvedSeeds.v2;
    }
    if (v2Seed === null) {
      v2Seed = runtimeSeed;
    }
    if (v2Seed === null) {
      v2Seed = 1;
    }
    
    this.currentSeed = v2Seed;
    
    try {
      console.log("[autoconnect/data-provider] Initializing data - baseSeed:", baseSeed, "v2Seed:", v2Seed);
      
      // Initialize all data types
      const [users, posts, jobs, recommendations] = await Promise.all([
        initializeUsers(v2Seed),
        initializePosts(v2Seed),
        initializeJobs(v2Seed),
        initializeRecommendations(v2Seed),
      ]);
      
      this.setUsers(users);
      this.setPosts(posts);
      this.setJobs(jobs);
      this.setRecommendations(recommendations);
      
      console.log("[autoconnect/data-provider] ✅ Data initialized:", {
        users: users.length,
        posts: posts.length,
        jobs: jobs.length,
        recommendations: recommendations.length,
      });
    } catch (error) {
      console.error("[autoconnect/data-provider] Failed to initialize data:", error);
      // Mark as ready even on error to prevent infinite loading
      this.ready = true;
      this.resolveReady();
    }
    
    // Listen for seed changes
    if (typeof window !== "undefined") {
      window.addEventListener("autoconnect:v2SeedChange", this.handleSeedEvent.bind(this));
    }
  }

  private handleSeedEvent = () => {
    console.log("[autoconnect/data-provider] Seed change event received");
    this.reload();
  };

  /**
   * Reload data if seed has changed
   */
  public reloadIfSeedChanged(seed?: number | null): void {
    const runtimeSeed = this.getRuntimeV2Seed();
    const seedToUse = seed !== undefined && seed !== null ? seed : runtimeSeed;
    if (seedToUse !== null && seedToUse !== this.currentSeed) {
      console.log(`[autoconnect] Seed changed from ${this.currentSeed} to ${seedToUse}, reloading...`);
      this.reload(seedToUse);
    }
  }

  /**
   * Reload all data with a new seed
   */
  public async reload(seedValue?: number | null): Promise<void> {
    // Prevent concurrent reloads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    this.loadingPromise = (async () => {
      try {
        const baseSeed = this.getBaseSeedFromUrl();
        const runtimeSeed = this.getRuntimeV2Seed();
        const v2Seed = seedValue ?? runtimeSeed ?? 1;
        
        // If base seed = 1, use fallback data directly
        if (baseSeed === 1) {
          console.log("[autoconnect/data-provider] Reload: Base seed is 1, using fallback data");
          this.currentSeed = 1;
        } else {
          this.currentSeed = v2Seed;
        }
        
        // Reset ready state
        this.ready = false;
        this.readyPromise = new Promise<void>((resolve) => {
          this.resolveReady = resolve;
        });
        
        // Reload all data
        const [users, posts, jobs, recommendations] = await Promise.all([
          initializeUsers(v2Seed),
          initializePosts(v2Seed),
          initializeJobs(v2Seed),
          initializeRecommendations(v2Seed),
        ]);
        
        this.setUsers(users);
        this.setPosts(posts);
        this.setJobs(jobs);
        this.setRecommendations(recommendations);
        
        console.log("[autoconnect/data-provider] ✅ Data reloaded:", {
          users: users.length,
          posts: posts.length,
          jobs: jobs.length,
          recommendations: recommendations.length,
        });
      } catch (error) {
        console.error("[autoconnect] Failed to reload data:", error);
        // Mark as ready even on error to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();
    
    return this.loadingPromise;
  }

  private setUsers(nextUsers: User[]): void {
    console.log("[autoconnect/data-provider] setUsers called with", nextUsers.length, "users");
    this.users = nextUsers;
    
    // Re-normalize posts when users are updated to ensure correct user references
    if (this.posts.length > 0) {
      console.log("[autoconnect/data-provider] Re-normalizing posts with updated users...");
      this.posts = this.posts.map((p) => {
        if (p.user && p.user.username && this.users.length > 0) {
          const postUsername = String(p.user.username || "").trim().toLowerCase();
          
          // Strategy 1: Exact match (case-insensitive)
          let matchingUser = this.users.find(
            (u) => String(u.username || "").trim().toLowerCase() === postUsername
          );
          
          // Strategy 2: Match without dots
          if (!matchingUser) {
            const postUsernameNoDots = postUsername.replace(/\./g, "");
            matchingUser = this.users.find(
              (u) => String(u.username || "").trim().toLowerCase().replace(/\./g, "") === postUsernameNoDots
            );
          }
          
          // Strategy 3: Partial match
          if (!matchingUser) {
            matchingUser = this.users.find(
              (u) => {
                const uUsername = String(u.username || "").trim().toLowerCase();
                return uUsername.includes(postUsername) || postUsername.includes(uUsername);
              }
            );
          }
          
          if (matchingUser) {
            return {
              ...p,
              user: matchingUser,
              comments: p.comments || [],
            };
          }
        }
        return {
          ...p,
          comments: p.comments || [],
        };
      });
      // Notify posts subscribers that posts have been updated
      this.notifyPosts();
    }
    
    this.notifyUsers();
    this.checkAndResolveReady();
  }

  private setPosts(nextPosts: Post[]): void {
    console.log("[autoconnect/data-provider] setPosts called with", nextPosts.length, "posts");
    console.log("[autoconnect/data-provider] Current users count:", this.users.length);
    
    // Normalize posts to use correct user references
    this.posts = nextPosts.map((p) => {
      // Normalize user reference - find matching user from our users array
      let normalizedUser = p.user;
      
      // Try to find the user by username to ensure we use the correct user object
      if (p.user && p.user.username && this.users.length > 0) {
        const postUsername = String(p.user.username || "").trim().toLowerCase();
        
        // Strategy 1: Exact match (case-insensitive)
        let matchingUser = this.users.find(
          (u) => String(u.username || "").trim().toLowerCase() === postUsername
        );
        
        // Strategy 2: Match without dots
        if (!matchingUser) {
          const postUsernameNoDots = postUsername.replace(/\./g, "");
          matchingUser = this.users.find(
            (u) => String(u.username || "").trim().toLowerCase().replace(/\./g, "") === postUsernameNoDots
          );
        }
        
        // Strategy 3: Partial match
        if (!matchingUser) {
          matchingUser = this.users.find(
            (u) => {
              const uUsername = String(u.username || "").trim().toLowerCase();
              return uUsername.includes(postUsername) || postUsername.includes(uUsername);
            }
          );
        }
        
        if (matchingUser) {
          normalizedUser = matchingUser;
        } else {
          // Only log warning if we have users loaded (to avoid spam during initialization)
          if (this.users.length > 0) {
            console.warn(`[autoconnect/data-provider] Could not find matching user for post.user.username: "${p.user.username}"`);
            console.warn(`[autoconnect/data-provider] Available usernames (first 10):`, 
              this.users.slice(0, 10).map(u => u.username).join(', '));
          }
        }
      } else if (p.user && p.user.username && this.users.length === 0) {
        // Users not loaded yet, will be normalized in getPosts()
        console.log(`[autoconnect/data-provider] Post has user "${p.user.username}" but users array is empty - will normalize later`);
      }
      
      return {
        ...p,
        user: normalizedUser,
        comments: p.comments || [],
      };
    });
    
    this.notifyPosts();
    this.checkAndResolveReady();
  }

  private setJobs(nextJobs: Job[]): void {
    console.log("[autoconnect/data-provider] setJobs called with", nextJobs.length, "jobs");
    this.jobs = nextJobs;
    this.notifyJobs();
    this.checkAndResolveReady();
  }

  private setRecommendations(nextRecommendations: Recommendation[]): void {
    console.log("[autoconnect/data-provider] setRecommendations called with", nextRecommendations.length, "recommendations");
    this.recommendations = nextRecommendations;
    this.notifyRecommendations();
    this.checkAndResolveReady();
  }

  private checkAndResolveReady(): void {
    // Mark as ready when all data types are loaded
    if (!this.ready && this.users.length > 0) {
      this.ready = true;
      console.log("[autoconnect/data-provider] Marking as ready");
      this.resolveReady();
    }
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

  public getUserByUsername(username: string): User | undefined {
    if (!Array.isArray(this.users) || this.users.length === 0) {
      console.log("[autoconnect] getUserByUsername: users array is empty or invalid");
      return undefined;
    }
    
    // Normalize search username
    const searchUsername = String(username || "").trim().toLowerCase();
    console.log(`[autoconnect] getUserByUsername: searching for username="${username}" (normalized: "${searchUsername}") in ${this.users.length} users`);
    
    // Strategy 1: Exact match (case-insensitive)
    let found = this.users.find((user) => {
      const userUsername = String(user.username || "").trim().toLowerCase();
      return userUsername === searchUsername;
    });
    
    if (found) {
      console.log(`[autoconnect] getUserByUsername: ✅ Found via exact match`);
      return found;
    }
    
    // Strategy 2: Partial match
    found = this.users.find((user) => {
      const userUsername = String(user.username || "").trim().toLowerCase();
      return userUsername.includes(searchUsername) || searchUsername.includes(userUsername);
    });
    
    if (found) {
      console.log(`[autoconnect] getUserByUsername: ✅ Found via partial match`);
      return found;
    }
    
    // Strategy 3: URL decode and try again
    try {
      const decodedUsername = decodeURIComponent(username);
      if (decodedUsername !== username) {
        const decodedSearch = decodedUsername.trim().toLowerCase();
        found = this.users.find((user) => {
          const userUsername = String(user.username || "").trim().toLowerCase();
          return userUsername === decodedSearch || userUsername.includes(decodedSearch) || decodedSearch.includes(userUsername);
        });
        
        if (found) {
          console.log(`[autoconnect] getUserByUsername: ✅ Found via URL decoded match`);
          return found;
        }
      }
    } catch (e) {
      // Ignore decode errors
    }
    
    // Strategy 4: Handle dot-separated usernames (e.g., "alexsmith" vs "alex.smith")
    if (!found) {
      // Remove dots from search and compare
      const searchWithoutDots = searchUsername.replace(/\./g, "");
      found = this.users.find((user) => {
        const userUsername = String(user.username || "").trim().toLowerCase();
        const userWithoutDots = userUsername.replace(/\./g, "");
        return userWithoutDots === searchWithoutDots || 
               userWithoutDots.includes(searchWithoutDots) || 
               searchWithoutDots.includes(userWithoutDots);
      });
      
      if (found) {
        console.log(`[autoconnect] getUserByUsername: ✅ Found via dot-removed match`);
        return found;
      }
    }
    
    // Log for debugging if not found
    if (!found && this.users.length > 0) {
      console.log(`[autoconnect] getUserByUsername: ❌ User not found after all strategies`);
      console.log(`[autoconnect] Searched for:`, { 
        original: username, 
        normalized: searchUsername,
        withoutDots: searchUsername.replace(/\./g, "")
      });
      
      // Show ALL usernames, not just first 10
      const allUsernames = this.users.map(u => {
        const uUsername = String(u.username || "").trim();
        return {
          username: uUsername,
          usernameLower: uUsername.toLowerCase(),
          usernameWithoutDots: uUsername.toLowerCase().replace(/\./g, ""),
          usernameType: typeof u.username,
          name: u.name
        };
      });
      
      // Log all usernames in a more readable format
      console.log(`[autoconnect] Available usernames (ALL ${allUsernames.length}):`);
      allUsernames.forEach((u, idx) => {
        console.log(`  [${idx + 1}] "${u.username}" (lower: "${u.usernameLower}", no-dots: "${u.usernameWithoutDots}") - ${u.name}`);
      });
      
      // Also check if there's a close match
      const searchWithoutDots = searchUsername.replace(/\./g, "");
      console.log(`[autoconnect] Search without dots: "${searchWithoutDots}"`);
      
      const closeMatches = allUsernames.filter(u => 
        u.usernameWithoutDots === searchWithoutDots ||
        u.usernameWithoutDots.includes(searchWithoutDots) || 
        searchWithoutDots.includes(u.usernameWithoutDots)
      );
      if (closeMatches.length > 0) {
        console.log(`[autoconnect] ⚠️ Close matches found (without dots):`, closeMatches);
        console.log(`[autoconnect] ⚠️ This suggests the dot-removal strategy should have worked!`);
      } else {
        console.log(`[autoconnect] No close matches found even after removing dots`);
      }
    }
    
    return found;
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
    return this.posts.map((post) => {
      // Normalize user reference - find matching user from our users array
      let normalizedUser = post.user;
      
      // Try to find the user by username to ensure we use the correct user object
      if (post.user && post.user.username && this.users.length > 0) {
        const postUsername = String(post.user.username || "").trim().toLowerCase();
        
        // Strategy 1: Exact match (case-insensitive)
        let matchingUser = this.users.find(
          (u) => String(u.username || "").trim().toLowerCase() === postUsername
        );
        
        // Strategy 2: Match without dots
        if (!matchingUser) {
          const postUsernameNoDots = postUsername.replace(/\./g, "");
          matchingUser = this.users.find(
            (u) => String(u.username || "").trim().toLowerCase().replace(/\./g, "") === postUsernameNoDots
          );
        }
        
        // Strategy 3: Partial match
        if (!matchingUser) {
          matchingUser = this.users.find(
            (u) => {
              const uUsername = String(u.username || "").trim().toLowerCase();
              return uUsername.includes(postUsername) || postUsername.includes(uUsername);
            }
          );
        }
        
        if (matchingUser) {
          normalizedUser = matchingUser;
        } else {
          // Log warning with more context
          console.warn(`[autoconnect/data-provider] Could not find matching user for post.user.username: "${post.user.username}"`);
          console.warn(`[autoconnect/data-provider] Available usernames (first 10):`, 
            this.users.slice(0, 10).map(u => u.username).join(', '));
        }
      } else if (post.user && post.user.username && this.users.length === 0) {
        console.warn(`[autoconnect/data-provider] Post has user "${post.user.username}" but users array is empty`);
      }
      
      return {
        ...post,
        user: normalizedUser,
        comments: post.comments || [],
      };
    });
  }

  public getJobs(): Job[] {
    return this.jobs;
  }

  public getJobById(id: string): Job | undefined {
    // Try exact match first
    let job = this.jobs.find((job) => job.id === id);
    
    // If not found, try string conversion
    if (!job) {
      const numId = Number(id);
      if (Number.isFinite(numId)) {
        job = this.jobs.find((j) => {
          const jId = typeof j.id === 'string' ? Number(j.id) : j.id;
          return Number.isFinite(jId) && jId === numId;
        });
      }
    }
    
    // If still not found, try partial match
    if (!job) {
      job = this.jobs.find((j) => String(j.id).includes(String(id)) || String(id).includes(String(j.id)));
    }
    
    return job;
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

  public subscribeUsers(callback: (data: User[]) => void): () => void {
    this.userSubscribers.push(callback);
    callback(this.users);
    return () => {
      this.userSubscribers = this.userSubscribers.filter((cb) => cb !== callback);
    };
  }

  public subscribePosts(callback: (data: Post[]) => void): () => void {
    this.postSubscribers.push(callback);
    callback(this.posts);
    return () => {
      this.postSubscribers = this.postSubscribers.filter((cb) => cb !== callback);
    };
  }

  public subscribeJobs(callback: (data: Job[]) => void): () => void {
    this.jobSubscribers.push(callback);
    callback(this.jobs);
    return () => {
      this.jobSubscribers = this.jobSubscribers.filter((cb) => cb !== callback);
    };
  }

  public subscribeRecommendations(callback: (data: Recommendation[]) => void): () => void {
    this.recommendationSubscribers.push(callback);
    callback(this.recommendations);
    return () => {
      this.recommendationSubscribers = this.recommendationSubscribers.filter((cb) => cb !== callback);
    };
  }

  private notifyUsers(): void {
    this.userSubscribers.forEach((cb) => cb(this.users));
  }

  private notifyPosts(): void {
    this.postSubscribers.forEach((cb) => cb(this.posts));
  }

  private notifyJobs(): void {
    this.jobSubscribers.forEach((cb) => cb(this.jobs));
  }

  private notifyRecommendations(): void {
    this.recommendationSubscribers.forEach((cb) => cb(this.recommendations));
  }

  public isDynamicModeEnabled(): boolean {
    return isDbLoadModeEnabled();
  }

  public getLayoutConfig(seed?: number) {
    return { seed: clampBaseSeed(seed ?? 1) };
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const whenReady = () => dynamicDataProvider.whenReady();
export const getUsers = () => dynamicDataProvider.getUsers();
export const getUserByUsername = (username: string) => dynamicDataProvider.getUserByUsername(username);
export const searchUsers = (query: string) => dynamicDataProvider.searchUsers(query);
export const getPosts = () => dynamicDataProvider.getPosts();
export const getJobs = () => dynamicDataProvider.getJobs();
export const getJobById = (id: string) => dynamicDataProvider.getJobById(id);
export const searchJobs = (query: string) => dynamicDataProvider.searchJobs(query);
export const getRecommendations = () => dynamicDataProvider.getRecommendations();
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
