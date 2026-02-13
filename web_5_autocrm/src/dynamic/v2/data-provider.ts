import { clampBaseSeed } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";
import {
  initializeClients,
  initializeMatters,
  initializeFiles,
  initializeEvents,
  initializeLogs,
  loadClientsFromDb,
  loadMattersFromDb,
  readCachedClients,
  readCachedMatters,
  writeCachedClients,
  writeCachedMatters,
} from "@/data/crm-enhanced";


const BASE_SEED_STORAGE_KEY = "autocrm_seed_base";

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled: boolean = false;
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private clients: any[] = [];
  private matters: any[] = [];
  private files: any[] = [];
  private events: any[] = [];
  private logs: any[] = [];
  private currentSeed: number = 1;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.isEnabled = isV2Enabled();
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }

    // hydrate from cache if available to keep content stable across reloads (unless unique mode is enabled)
    const uniqueFlag = (process.env.NEXT_PUBLIC_DATA_GENERATION_UNIQUE || process.env.DATA_GENERATION_UNIQUE || '').toString().toLowerCase();
    const isUnique = uniqueFlag === 'true' || uniqueFlag === '1' || uniqueFlag === 'yes' || uniqueFlag === 'on';
    if (!isUnique) {
      const cachedClients = readCachedClients();
      const cachedMatters = readCachedMatters();
      this.clients = Array.isArray(cachedClients) && cachedClients.length > 0 ? cachedClients : [];
      this.matters = Array.isArray(cachedMatters) && cachedMatters.length > 0 ? cachedMatters : [];
    }

    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    // Initialize data with enhanced loader only (no dataset.ts)
    this.initializeData();

    if (typeof window !== "undefined") {
      window.addEventListener("autocrm:v2SeedChange", (event) => {
        const detail = (event as CustomEvent<{ seed: number | null }>).detail;
        this.reload(detail?.seed ?? null);
      });
    }
  }

  private getBaseSeed(): number {
    if (typeof window === "undefined") {
      return clampBaseSeed(1);
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("seed");
      if (raw) {
        const parsed = clampBaseSeed(Number.parseInt(raw, 10));
        window.localStorage.setItem(BASE_SEED_STORAGE_KEY, parsed.toString());
        return parsed;
      }
      const stored = window.localStorage.getItem(BASE_SEED_STORAGE_KEY);
      if (stored) {
        return clampBaseSeed(Number.parseInt(stored, 10));
      }
    } catch (error) {
      console.warn("[autocrm] Failed to resolve base seed from URL/localStorage", error);
    }
    return clampBaseSeed(1);
  }

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const value = (window as any).__autocrmV2Seed;
    if (typeof value === "number" && Number.isFinite(value)) {
      return clampBaseSeed(value);
    }
    return null;
  }

  private async reloadIfSeedChanged(): Promise<void> {
    const newSeed = this.getBaseSeed();
    if (newSeed !== this.currentSeed) {
      console.log(`[autocrm] Seed changed from ${this.currentSeed} to ${newSeed}, reloading data...`);
      this.currentSeed = newSeed;
      await this.reload();
    }
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initializeData(): Promise<void> {
    try {
      const baseSeed = this.getBaseSeed();
      const v2Seed = this.getRuntimeV2Seed();
      const effectiveSeed = clampBaseSeed(v2Seed ?? baseSeed);
      this.currentSeed = effectiveSeed;

      // Try DB mode first if enabled
      const dbClients = await loadClientsFromDb(effectiveSeed);
      const dbMatters = await loadMattersFromDb(effectiveSeed);
      if (dbClients.length > 0) {
        this.clients = dbClients;
        writeCachedClients(this.clients);
      }
      if (dbMatters.length > 0) {
        this.matters = dbMatters;
        writeCachedMatters(this.matters);
      }

      if (dbClients.length > 0 || dbMatters.length > 0) {
        // Still initialize other entities even if DB provided clients/matters
        await Promise.all([
          initializeFiles(),
          initializeEvents(),
          initializeLogs(),
        ]).then(([files, events, logs]) => {
          this.files = files;
          this.events = events;
          this.logs = logs;
        });

        this.ready = true;
        this.resolveReady();
        return;
      }

      // Generate all data in parallel for better performance
      console.log("🚀 Initializing all CRM data...");
      const [initializedClients, initializedMatters, initializedFiles, initializedEvents, initializedLogs] = await Promise.all([
        initializeClients(effectiveSeed),
        initializeMatters(effectiveSeed),
        initializeFiles(effectiveSeed),
        initializeEvents(effectiveSeed),
        initializeLogs(effectiveSeed),
      ]);

      this.clients = initializedClients;
      this.matters = initializedMatters;
      this.files = initializedFiles;
      this.events = initializedEvents;
      this.logs = initializedLogs;

      // Cache primary entities to maintain stability across navigations
      if (this.clients.length > 0) writeCachedClients(this.clients);
      if (this.matters.length > 0) writeCachedMatters(this.matters);
      console.log("✅ All CRM data initialized successfully");

      this.ready = true;
      this.resolveReady();

    } catch (error) {
      console.error("❌ Error initializing CRM data:", error);
      this.ready = true;
      this.resolveReady();
    }
  }

  public async reload(seedValue?: number | null): Promise<void> {
    if (typeof window === "undefined") return;

    const runtimeSeed = seedValue !== undefined && seedValue !== null
      ? seedValue
      : this.getRuntimeV2Seed();
    const targetSeed = runtimeSeed !== null ? clampBaseSeed(runtimeSeed) : this.getBaseSeed();

    if (targetSeed === this.currentSeed && this.ready) {
      return; // Already loaded with this seed
    }

    console.log(`[autocrm] Reloading data for base seed=${targetSeed}...`);
    this.currentSeed = targetSeed;
    this.ready = false;

    // If already loading, wait for it
    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    // Start new load
    this.loadingPromise = (async () => {
      try {
        // Use initializeClients/initializeMatters which handle seed derivation internally
        const [clients, matters, files, events, logs] = await Promise.all([
          initializeClients(targetSeed),
          initializeMatters(targetSeed),
          initializeFiles(targetSeed),
          initializeEvents(targetSeed),
          initializeLogs(targetSeed),
        ]);

        this.clients = clients;
        this.matters = matters;
        this.files = files;
        this.events = events;
        this.logs = logs;

        // Cache primary entities
        if (this.clients.length > 0) writeCachedClients(this.clients);
        if (this.matters.length > 0) writeCachedMatters(this.matters);

        this.ready = true;
        console.log(`[autocrm] Data reloaded: ${this.clients.length} clients, ${this.matters.length} matters`);
      } catch (error) {
        console.error("[autocrm] Failed to reload data", error);
        this.ready = true; // Mark as ready even on error to prevent blocking
      } finally {
        this.loadingPromise = null;
      }
    })();

    await this.loadingPromise;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  public getClients(): any[] {
    // Trigger reload if seed changed
    if (typeof window !== "undefined") {
      this.reloadIfSeedChanged().catch((error) => {
        console.error("[autocrm] Failed to check/reload on seed change:", error);
      });
    }
    return this.clients;
  }

  public getMatters(): any[] {
    return this.matters;
  }

  public getFiles(): any[] {
    return this.files;
  }

  public getEvents(): any[] {
    return this.events;
  }

  public getLogs(): any[] {
    return this.logs;
  }

  public getClientById(id: string): any | undefined {
    if (!Array.isArray(this.clients)) {
      console.log("[autocrm] getClientById: clients array is not valid");
      return undefined;
    }

    // Ensure id is a string
    const searchId = String(id || '');
    if (!searchId) {
      console.log("[autocrm] getClientById: invalid id provided");
      return undefined;
    }

    // Try exact match first
    let found = this.clients.find((client) => {
      const clientId = String(client.id || '');
      return clientId === searchId;
    });

    // If not found, try with URL decoding
    if (!found) {
      try {
        const decodedId = decodeURIComponent(searchId);
        found = this.clients.find((client) => {
          const clientId = String(client.id || '');
          return clientId === decodedId;
        });
      } catch (e) {
        // Ignore decode errors
      }
    }

    // If still not found, try matching without 'CL-' prefix (if ID is numeric)
    if (!found && /^\d+$/.test(searchId)) {
      found = this.clients.find((client) => {
        const clientId = String(client.id || '');
        // Try matching the numeric part
        const numericId = clientId.replace(/^CL-/, '');
        return numericId === searchId || clientId === searchId;
      });
    }

    // If still not found, try partial match (in case ID was transformed)
    if (!found) {
      found = this.clients.find((client) => {
        const clientId = String(client.id || '');
        return clientId.includes(searchId) || searchId.includes(clientId);
      });
    }

    // Log available client IDs for debugging if not found
    if (!found && this.clients.length > 0) {
      console.log(`[autocrm] Client ${searchId} not found. Available clients (${this.clients.length}):`,
        this.clients.slice(0, 5).map(c => ({ id: c.id, name: c.name }))
      );
    }

    return found;
  }

  public getMatterById(id: string): any | undefined {
    if (!Array.isArray(this.matters)) {
      console.log("[autocrm] getMatterById: matters array is not valid");
      return undefined;
    }

    // Ensure id is a string
    const searchId = String(id || '');
    if (!searchId) {
      console.log("[autocrm] getMatterById: invalid id provided");
      return undefined;
    }

    // Try exact match first
    let found = this.matters.find((matter) => {
      const matterId = String(matter.id || '');
      return matterId === searchId;
    });

    // If not found, try with URL decoding
    if (!found) {
      try {
        const decodedId = decodeURIComponent(searchId);
        found = this.matters.find((matter) => {
          const matterId = String(matter.id || '');
          return matterId === decodedId;
        });
      } catch (e) {
        // Ignore decode errors
      }
    }

    // If still not found, try matching without 'MAT-' prefix (if ID is numeric)
    if (!found && /^\d+$/.test(searchId)) {
      found = this.matters.find((matter) => {
        const matterId = String(matter.id || '');
        // Try matching the numeric part
        const numericId = matterId.replace(/^MAT-/, '');
        return numericId === searchId || matterId === searchId;
      });
    }

    // If still not found, try partial match (in case ID was transformed)
    if (!found) {
      found = this.matters.find((matter) => {
        const matterId = String(matter.id || '');
        return matterId.includes(searchId) || searchId.includes(matterId);
      });
    }

    // Log available matter IDs for debugging if not found
    if (!found && this.matters.length > 0) {
      console.log(`[autocrm] Matter ${searchId} not found. Available matters (${this.matters.length}):`,
        this.matters.slice(0, 5).map(m => ({ id: m.id, name: m.name }))
      );
    }

    return found;
  }

  public searchClients(query: string): any[] {
    const lowercaseQuery = query.toLowerCase();
    return this.clients.filter((client) =>
      client.name.toLowerCase().includes(lowercaseQuery) ||
      client.email?.toLowerCase().includes(lowercaseQuery)
    );
  }

  public searchMatters(query: string): any[] {
    const lowercaseQuery = query.toLowerCase();
    return this.matters.filter((matter) =>
      matter.name.toLowerCase().includes(lowercaseQuery) ||
      matter.client?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get effective seed value - returns 1 (default) when dynamic HTML is disabled
  // Validates seed is between 1-300, defaults to 1 if invalid
  public getEffectiveSeed(providedSeed: number = 1): number {
    if (!this.isEnabled) {
      return 1;
    }

    // Validate seed range (1-300), default to 1 if invalid
    if (providedSeed < 1 || providedSeed > 300) {
      return 1;
    }

    return providedSeed;
  }

  // Get layout configuration based on seed
  public getLayoutConfig(seed?: number) {
    return getEffectiveLayoutConfig(seed);
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);

// Data access helpers
export const getClients = () => dynamicDataProvider.getClients();
export const getMatters = () => dynamicDataProvider.getMatters();
export const getFiles = () => dynamicDataProvider.getFiles();
export const getEvents = () => dynamicDataProvider.getEvents();
export const getLogs = () => dynamicDataProvider.getLogs();
export const getClientById = (id: string) => dynamicDataProvider.getClientById(id);
export const getMatterById = (id: string) => dynamicDataProvider.getMatterById(id);
export const searchClients = (query: string) => dynamicDataProvider.searchClients(query);
export const searchMatters = (query: string) => dynamicDataProvider.searchMatters(query);
export const whenReady = () => dynamicDataProvider.whenReady();
