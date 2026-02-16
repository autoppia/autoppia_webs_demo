import type { AutoworkJob, AutoworkHire, AutoworkExpert } from "@/shared/data-generator";
import { initializeJobs, initializeHires, initializeExperts, initializeSkills } from "@/data/autowork-enhanced";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { clampBaseSeed } from "@/shared/seed-resolver";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private jobs: AutoworkJob[] = [];
  private hires: AutoworkHire[] = [];
  private experts: AutoworkExpert[] = [];
  private skills: string[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady: () => void = () => {};
  private currentSeed: number | null = null;
  private loadingPromise: Promise<void> | null = null;

  // Subscribers
  private jobSubscribers: Array<(data: AutoworkJob[]) => void> = [];
  private hireSubscribers: Array<(data: AutoworkHire[]) => void> = [];
  private expertSubscribers: Array<(data: AutoworkExpert[]) => void> = [];
  private skillSubscribers: Array<(data: string[]) => void> = [];

  private constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    // Set up event listener BEFORE initialization to catch seed changes
    if (typeof window !== "undefined") {
      window.addEventListener("autowork:v2SeedChange", (event) => {
        this.handleSeedEvent(event);
      });
    }

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
    const value = (window as any).__autoworkV2Seed;
    if (typeof value === "number" && Number.isFinite(value)) {
      return clampBaseSeed(value);
    }
    return null;
  }

  private async initialize(): Promise<void> {
    // Reset ready state when initializing (in case of seed change)
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    const baseSeed = this.getBaseSeedFromUrl();
    const runtimeSeed = this.getRuntimeV2Seed();

    try {
      // If base seed = 1, use fallback data directly (skip DB mode)
      if (baseSeed === 1) {
        console.log("[autowork/data-provider] Base seed is 1, using fallback data");
        const [jobs, hires, experts, skills] = await Promise.all([
          initializeJobs(runtimeSeed ?? undefined),
          initializeHires(runtimeSeed ?? undefined),
          initializeExperts(runtimeSeed ?? undefined),
          initializeSkills(runtimeSeed ?? undefined),
        ]);
        this.setJobs(jobs);
        this.setHires(hires);
        this.setExperts(experts);
        this.setSkills(skills);
        return;
      }

      this.currentSeed = runtimeSeed ?? 1;

      // Check if DB mode is enabled - only try DB if enabled
      const dbModeEnabled = isDbLoadModeEnabled();
      console.log("[autowork/data-provider] DB mode enabled:", dbModeEnabled, "runtimeSeed:", runtimeSeed, "baseSeed:", baseSeed);

      if (dbModeEnabled) {
        // Try DB mode first if enabled
        console.log("[autowork/data-provider] Attempting to load from DB...");
        // Let initializeJobs/Hires/etc handle DB loading
      }

      // Initialize all data types (they handle DB mode internally)
      const [jobs, hires, experts, skills] = await Promise.all([
        initializeJobs(runtimeSeed ?? undefined),
        initializeHires(runtimeSeed ?? undefined),
        initializeExperts(runtimeSeed ?? undefined),
        initializeSkills(runtimeSeed ?? undefined),
      ]);

      this.setJobs(jobs);
      this.setHires(hires);
      this.setExperts(experts);
      this.setSkills(skills);

      console.log("[autowork/data-provider] ✅ Data initialized:", {
        jobs: jobs.length,
        hires: hires.length,
        experts: experts.length,
        skills: skills.length,
      });
    } catch (error) {
      console.error("[autowork/data-provider] Failed to initialize data:", error);
      // Even if there's an error, we should mark as ready with fallback data
      // to prevent infinite loading state
      try {
        const [jobs, hires, experts, skills] = await Promise.all([
          initializeJobs(runtimeSeed ?? undefined),
          initializeHires(runtimeSeed ?? undefined),
          initializeExperts(runtimeSeed ?? undefined),
          initializeSkills(runtimeSeed ?? undefined),
        ]);
        this.setJobs(jobs);
        this.setHires(hires);
        this.setExperts(experts);
        this.setSkills(skills);
      } catch (fallbackError) {
        console.error("[autowork/data-provider] Failed to initialize fallback data:", fallbackError);
        // Last resort: mark as ready to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      }
    }
  }

  private handleSeedEvent = (event?: Event) => {
    console.log("[autowork/data-provider] Seed change event received");
    const customEvent = event as CustomEvent<{ seed: number | null }> | undefined;
    const seedFromEvent = customEvent?.detail?.seed;
    this.reloadIfSeedChanged(seedFromEvent);
  };

  /**
   * Reload data if seed has changed
   */
  public reloadIfSeedChanged(seed?: number | null): void {
    const runtimeSeed = this.getRuntimeV2Seed();
    const seedToUse = seed !== undefined && seed !== null ? seed : runtimeSeed;
    if (seedToUse !== null && seedToUse !== this.currentSeed) {
      console.log(`[autowork] Seed changed from ${this.currentSeed} to ${seedToUse}, reloading...`);
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
        const v2Seed = clampBaseSeed(seedValue ?? runtimeSeed ?? 1);

        console.log(`[autowork/data-provider] Reload: Seed changing from ${this.currentSeed} to ${v2Seed}`);

        // If base seed = 1, use fallback data directly
        if (baseSeed === 1) {
          console.log("[autowork/data-provider] Reload: Base seed is 1, using fallback data");
          this.currentSeed = 1;
        } else {
          this.currentSeed = v2Seed;
        }

        // Reset ready state FIRST
        this.ready = false;
        this.readyPromise = new Promise<void>((resolve) => {
          this.resolveReady = resolve;
        });

        // CRITICAL: Clear all existing data BEFORE loading new data
        // This ensures no old seed data is preserved
        console.log("[autowork/data-provider] Clearing old data before loading new seed data...");
        this.jobs = [];
        this.hires = [];
        this.experts = [];
        this.skills = [];

        // Notify all subscribers with empty arrays to clear UI immediately
        this.notifyJobs();
        this.notifyHires();
        this.notifyExperts();
        this.notifySkills();

        // Small delay to ensure subscribers have processed the clear
        await new Promise(resolve => setTimeout(resolve, 50));

        // Now load new data for the new seed
        const [jobs, hires, experts, skills] = await Promise.all([
          initializeJobs(v2Seed),
          initializeHires(v2Seed),
          initializeExperts(v2Seed),
          initializeSkills(v2Seed),
        ]);

        // Set new data (this will notify subscribers again with new data)
        this.setJobs(jobs);
        this.setHires(hires);
        this.setExperts(experts);
        this.setSkills(skills);

        console.log("[autowork/data-provider] ✅ Data reloaded for seed", v2Seed, ":", {
          jobs: jobs.length,
          hires: hires.length,
          experts: experts.length,
          skills: skills.length,
        });
      } catch (error) {
        console.error("[autowork] Failed to reload data:", error);
        // Mark as ready even on error to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();

    return this.loadingPromise;
  }

  private setJobs(nextJobs: AutoworkJob[]): void {
    console.log("[autowork/data-provider] setJobs called with", nextJobs.length, "jobs");
    this.jobs = nextJobs;
    this.notifyJobs();
    this.checkAndResolveReady();
  }

  private setHires(nextHires: AutoworkHire[]): void {
    console.log("[autowork/data-provider] setHires called with", nextHires.length, "hires");
    this.hires = nextHires;
    this.notifyHires();
    this.checkAndResolveReady();
  }

  private setExperts(nextExperts: AutoworkExpert[]): void {
    console.log("[autowork/data-provider] setExperts called with", nextExperts.length, "experts");
    this.experts = nextExperts;
    this.notifyExperts();
    this.checkAndResolveReady();
  }

  private setSkills(nextSkills: string[]): void {
    console.log("[autowork/data-provider] setSkills called with", nextSkills.length, "skills");
    this.skills = nextSkills;
    this.notifySkills();
    this.checkAndResolveReady();
  }

  private checkAndResolveReady(): void {
    // Mark as ready when all data types are loaded
    if (!this.ready && this.jobs.length > 0) {
      this.ready = true;
      console.log("[autowork/data-provider] Marking as ready");
      this.resolveReady();
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getJobs(): AutoworkJob[] {
    return this.jobs;
  }

  public getJobById(id: string): AutoworkJob | undefined {
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

  public searchJobs(query: string): AutoworkJob[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.jobs;
    return this.jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(normalized) ||
        job.location.toLowerCase().includes(normalized) ||
        job.requiredSkills.some((skill) => skill.toLowerCase().includes(normalized))
    );
  }

  public getHires(): AutoworkHire[] {
    return this.hires;
  }

  public getHireByName(name: string): AutoworkHire | undefined {
    const searchName = String(name || "").trim().toLowerCase();
    return this.hires.find((h) => {
      const hireName = String(h.name || "").trim().toLowerCase();
      return hireName === searchName || hireName.includes(searchName) || searchName.includes(hireName);
    });
  }

  public searchHires(query: string): AutoworkHire[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.hires;
    return this.hires.filter(
      (hire) =>
        hire.name.toLowerCase().includes(normalized) ||
        hire.role.toLowerCase().includes(normalized) ||
        hire.country.toLowerCase().includes(normalized) ||
        (hire.skills && hire.skills.some((skill) => skill.toLowerCase().includes(normalized)))
    );
  }

  public getExperts(): AutoworkExpert[] {
    return this.experts;
  }

  public getExpertBySlug(slug: string): AutoworkExpert | undefined {
    const searchSlug = String(slug || "").trim().toLowerCase();

    // Strategy 1: Exact match by slug
    let found = this.experts.find((e) => {
      const expertSlug = String(e.slug || "").trim().toLowerCase();
      return expertSlug === searchSlug;
    });

    if (found) return found;

    // Strategy 2: Match by name (normalized)
    const normalizedSearch = searchSlug.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    found = this.experts.find((e) => {
      const expertName = String(e.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return expertName === normalizedSearch;
    });

    if (found) return found;

    // Strategy 3: Partial match by slug
    found = this.experts.find((e) => {
      const expertSlug = String(e.slug || "").trim().toLowerCase();
      return expertSlug.includes(searchSlug) || searchSlug.includes(expertSlug);
    });

    if (found) return found;

    // Strategy 4: Partial match by name
    found = this.experts.find((e) => {
      const expertName = String(e.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const normalizedSearchNoDots = normalizedSearch.replace(/\./g, '');
      const expertNameNoDots = expertName.replace(/\./g, '');
      return expertName.includes(normalizedSearch) || normalizedSearch.includes(expertName) ||
             expertNameNoDots === normalizedSearchNoDots;
    });

    return found;
  }

  public getExpertByName(name: string): AutoworkExpert | undefined {
    const searchName = String(name || "").trim().toLowerCase();

    // Strategy 1: Exact match by name
    let found = this.experts.find((e) => {
      const expertName = String(e.name || "").trim().toLowerCase();
      return expertName === searchName;
    });

    if (found) return found;

    // Strategy 2: Match without dots or special chars
    const normalizedSearch = searchName.replace(/[^a-z0-9]+/g, '').replace(/\./g, '');
    found = this.experts.find((e) => {
      const expertName = String(e.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/\./g, '');
      return expertName === normalizedSearch;
    });

    if (found) return found;

    // Strategy 3: Partial match
    found = this.experts.find((e) => {
      const expertName = String(e.name || "").trim().toLowerCase();
      return expertName.includes(searchName) || searchName.includes(expertName);
    });

    return found;
  }

  public searchExperts(query: string): AutoworkExpert[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.experts;
    return this.experts.filter(
      (expert) =>
        expert.name.toLowerCase().includes(normalized) ||
        expert.role.toLowerCase().includes(normalized) ||
        expert.country.toLowerCase().includes(normalized) ||
        expert.specialties.some((specialty) => specialty.toLowerCase().includes(normalized)) ||
        expert.bio.toLowerCase().includes(normalized)
    );
  }

  public getSkills(): string[] {
    return this.skills;
  }

  public subscribeJobs(callback: (data: AutoworkJob[]) => void): () => void {
    this.jobSubscribers.push(callback);
    callback(this.jobs);
    return () => {
      this.jobSubscribers = this.jobSubscribers.filter((cb) => cb !== callback);
    };
  }

  public subscribeHires(callback: (data: AutoworkHire[]) => void): () => void {
    this.hireSubscribers.push(callback);
    callback(this.hires);
    return () => {
      this.hireSubscribers = this.hireSubscribers.filter((cb) => cb !== callback);
    };
  }

  public subscribeExperts(callback: (data: AutoworkExpert[]) => void): () => void {
    this.expertSubscribers.push(callback);
    callback(this.experts);
    return () => {
      this.expertSubscribers = this.expertSubscribers.filter((cb) => cb !== callback);
    };
  }

  public subscribeSkills(callback: (data: string[]) => void): () => void {
    this.skillSubscribers.push(callback);
    callback(this.skills);
    return () => {
      this.skillSubscribers = this.skillSubscribers.filter((cb) => cb !== callback);
    };
  }

  private notifyJobs(): void {
    this.jobSubscribers.forEach((cb) => cb(this.jobs));
  }

  private notifyHires(): void {
    this.hireSubscribers.forEach((cb) => cb(this.hires));
  }

  private notifyExperts(): void {
    this.expertSubscribers.forEach((cb) => cb(this.experts));
  }

  private notifySkills(): void {
    this.skillSubscribers.forEach((cb) => cb(this.skills));
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
export const getJobs = () => dynamicDataProvider.getJobs();
export const getJobById = (id: string) => dynamicDataProvider.getJobById(id);
export const searchJobs = (query: string) => dynamicDataProvider.searchJobs(query);
export const getHires = () => dynamicDataProvider.getHires();
export const getHireByName = (name: string) => dynamicDataProvider.getHireByName(name);
export const searchHires = (query: string) => dynamicDataProvider.searchHires(query);
export const getExperts = () => dynamicDataProvider.getExperts();
export const getExpertBySlug = (slug: string) => dynamicDataProvider.getExpertBySlug(slug);
export const getExpertByName = (name: string) => dynamicDataProvider.getExpertByName(name);
export const searchExperts = (query: string) => dynamicDataProvider.searchExperts(query);
export const getSkills = () => dynamicDataProvider.getSkills();
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
