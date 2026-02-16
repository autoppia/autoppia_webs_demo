import type { AutoworkJob, AutoworkHire, AutoworkExpert } from "@/shared/data-generator";
import { initializeJobs, initializeHires, initializeExperts, initializeSkills } from "@/data/autowork-enhanced";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

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

  private jobSubscribers: Array<(data: AutoworkJob[]) => void> = [];
  private hireSubscribers: Array<(data: AutoworkHire[]) => void> = [];
  private expertSubscribers: Array<(data: AutoworkExpert[]) => void> = [];
  private skillSubscribers: Array<(data: string[]) => void> = [];

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

  private getSeed(): number {
    // V2 rule: if V2 is disabled, always act as seed=1.
    if (!isV2Enabled()) return 1;
    if (typeof window === "undefined") return 1;
    return getSeedFromUrl();
  }

  private async initialize(): Promise<void> {
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    const seed = this.getSeed();
    this.currentSeed = seed;

    try {
      const [jobs, hires, experts, skills] = await Promise.all([
        initializeJobs(seed),
        initializeHires(seed),
        initializeExperts(seed),
        initializeSkills(seed),
      ]);

      this.setJobs(jobs);
      this.setHires(hires);
      this.setExperts(experts);
      this.setSkills(skills);
    } catch (error) {
      // No dataset fallback. If the backend is down, the site is expected to fail.
      console.error("[autowork/data-provider] Failed to initialize data:", error);
      this.ready = true;
      this.resolveReady();
    }
  }

  public reloadIfSeedChanged(seed?: number | null): void {
    const seedToUse = seed !== undefined && seed !== null ? seed : this.getSeed();
    if (seedToUse !== this.currentSeed) {
      this.reload(seedToUse);
    }
  }

  public async reload(seedValue?: number | null): Promise<void> {
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        const seed = clampSeed(seedValue ?? this.getSeed());
        this.currentSeed = seed;

        this.ready = false;
        this.readyPromise = new Promise<void>((resolve) => {
          this.resolveReady = resolve;
        });

        // Clear current data so UI doesn't show stale seed data.
        this.jobs = [];
        this.hires = [];
        this.experts = [];
        this.skills = [];
        this.notifyJobs();
        this.notifyHires();
        this.notifyExperts();
        this.notifySkills();

        const [jobs, hires, experts, skills] = await Promise.all([
          initializeJobs(seed),
          initializeHires(seed),
          initializeExperts(seed),
          initializeSkills(seed),
        ]);

        this.setJobs(jobs);
        this.setHires(hires);
        this.setExperts(experts);
        this.setSkills(skills);
      } catch (error) {
        console.error("[autowork/data-provider] Failed to reload data:", error);
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();

    return this.loadingPromise;
  }

  private setJobs(nextJobs: AutoworkJob[]): void {
    this.jobs = nextJobs;
    this.notifyJobs();
    this.checkAndResolveReady();
  }

  private setHires(nextHires: AutoworkHire[]): void {
    this.hires = nextHires;
    this.notifyHires();
    this.checkAndResolveReady();
  }

  private setExperts(nextExperts: AutoworkExpert[]): void {
    this.experts = nextExperts;
    this.notifyExperts();
    this.checkAndResolveReady();
  }

  private setSkills(nextSkills: string[]): void {
    this.skills = nextSkills;
    this.notifySkills();
    this.checkAndResolveReady();
  }

  private checkAndResolveReady(): void {
    // Mark as ready when we have any jobs loaded (same contract as before).
    if (!this.ready && this.jobs.length > 0) {
      this.ready = true;
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
    let job = this.jobs.find((job) => job.id === id);
    if (!job) {
      const numId = Number(id);
      if (Number.isFinite(numId)) {
        job = this.jobs.find((j) => {
          const jId = typeof j.id === "string" ? Number(j.id) : j.id;
          return Number.isFinite(jId) && jId === numId;
        });
      }
    }
    if (!job) {
      job = this.jobs.find(
        (j) => String(j.id).includes(String(id)) || String(id).includes(String(j.id))
      );
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

    let found = this.experts.find((e) => String(e.slug || "").trim().toLowerCase() === searchSlug);
    if (found) return found;

    const normalizedSearch = searchSlug.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    found = this.experts.find((e) => {
      const expertName = String(e.name || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return expertName === normalizedSearch;
    });
    if (found) return found;

    found = this.experts.find((e) => {
      const expertSlug = String(e.slug || "").trim().toLowerCase();
      return expertSlug.includes(searchSlug) || searchSlug.includes(expertSlug);
    });
    if (found) return found;

    found = this.experts.find((e) => {
      const expertName = String(e.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const normalizedSearchNoDots = normalizedSearch.replace(/\./g, "");
      const expertNameNoDots = expertName.replace(/\./g, "");
      return (
        expertName.includes(normalizedSearch) ||
        normalizedSearch.includes(expertName) ||
        expertNameNoDots === normalizedSearchNoDots
      );
    });
    return found;
  }

  public getExpertByName(name: string): AutoworkExpert | undefined {
    const searchName = String(name || "").trim().toLowerCase();

    let found = this.experts.find((e) => String(e.name || "").trim().toLowerCase() === searchName);
    if (found) return found;

    const normalizedSearch = searchName.replace(/[^a-z0-9]+/g, "").replace(/\./g, "");
    found = this.experts.find((e) => {
      const expertName = String(e.name || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .replace(/\./g, "");
      return expertName === normalizedSearch;
    });
    if (found) return found;

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
    return isV2Enabled();
  }

  public getLayoutConfig(seed?: number) {
    return { seed: clampSeed(seed ?? 1) };
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
