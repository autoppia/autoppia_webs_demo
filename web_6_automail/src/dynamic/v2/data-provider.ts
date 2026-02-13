import type { Email, EmailFolder } from "@/types/email";
import { emails, initializeEmails, loadEmailsFromDb, writeCachedEmails, readCachedEmails } from "@/data/emails-enhanced";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { isV2Enabled } from "@/dynamic/shared/flags";

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private emails: Email[] = [];
  private isEnabled: boolean = false;
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private listeners = new Set<(emails: Email[]) => void>();
  private currentSeed: number | null = null;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.isEnabled = isV2Enabled();
    // hydrate from cache if available to keep content stable across reloads
    const cached = readCachedEmails();
    this.emails = Array.isArray(cached) && cached.length > 0 ? cached : emails;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    
    // Initialize emails with data generation if enabled
    this.initializeEmails();

    if (typeof window !== "undefined") {
      window.addEventListener("automail:v2SeedChange", (event) => {
        const detail = (event as CustomEvent<{ seed: number | null }>).detail;
        this.refreshEmailsForSeed(detail?.seed ?? null);
      });
    }
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initializeEmails(): Promise<void> {
    const baseSeed = this.getBaseSeedFromUrl();
    const runtimeSeed = this.getRuntimeV2Seed();
    
    try {
      // If base seed = 1, use fallback data directly (skip DB/AI)
      if (baseSeed === 1) {
        console.log("[automail/data-provider] Base seed is 1, using fallback data");
        const initializedEmails = await initializeEmails(runtimeSeed ?? undefined);
        this.setEmails(initializedEmails);
        return;
      }
      
      this.currentSeed = runtimeSeed ?? 1;
      
      // Check if DB mode is enabled - only try DB if enabled
      const dbModeEnabled = isDbLoadModeEnabled();
        console.log("[automail/data-provider] DB mode enabled:", dbModeEnabled, "runtimeSeed:", runtimeSeed, "baseSeed:", baseSeed);
        
        if (dbModeEnabled) {
          // Try DB mode first if enabled
          console.log("[automail/data-provider] Attempting to load emails from DB...");
          const dbEmails = await loadEmailsFromDb(runtimeSeed ?? undefined);
          console.log("[automail/data-provider] loadEmailsFromDb returned:", dbEmails.length, "emails");
        
        if (dbEmails.length > 0) {
          console.log("[automail/data-provider] ✅ Successfully loaded", dbEmails.length, "emails from DB");
          this.setEmails(dbEmails);
          return;
        } else {
          console.log("[automail/data-provider] ⚠️ No emails from DB, will try initializeEmails...");
        }
      }
      
      // If DB mode not enabled or DB returned empty, use initializeEmails
      // This will handle AI generation mode or fallback
      const initializedEmails = await initializeEmails(runtimeSeed ?? undefined);
      this.setEmails(initializedEmails);

    } catch (error) {
      console.error("[automail/data-provider] Failed to initialize emails:", error);
      // Even if there's an error, we should mark as ready with fallback data
      // to prevent infinite loading state
      try {
        const initializedEmails = await initializeEmails(runtimeSeed ?? undefined);
        this.setEmails(initializedEmails);
      } catch (fallbackError) {
        console.error("[automail/data-provider] Failed to initialize fallback emails:", fallbackError);
        // Last resort: mark as ready with empty array to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      }
    }
  }
    /**
   * Reload emails with a new seed
   */
  public async reload(seedValue?: number | null): Promise<void> {
    // Prevent concurrent reloads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    this.loadingPromise = (async () => {
      try {
        const baseSeed = this.getBaseSeedFromUrl();
        const v2Seed = seedValue ?? this.getRuntimeV2Seed() ?? 1;
        
        // If base seed = 1, use fallback data directly (skip DB/AI)
        if (baseSeed === 1) {
          console.log("[automail/data-provider] Reload: Base seed is 1, using fallback data");
          this.currentSeed = 1;
        } else {
          this.currentSeed = v2Seed;
        }
        
        // Reset ready state
        this.ready = false;
        this.readyPromise = new Promise<void>((resolve) => {
          this.resolveReady = resolve;
        });
        
        const initializedEmails = await initializeEmails(v2Seed);
        this.setEmails(initializedEmails);
      } catch (error) {
        console.error("[automail] Failed to reload emails:", error);
        // Mark as ready even on error to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();
    
    return this.loadingPromise;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getEmails(): Email[] {
    return this.emails; // Return empty until ready when generation is enabled
  }

  public subscribe(listener: (emails: Email[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
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
    return { layoutType: "fixed", seed: seed ?? 1 };
  }

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const seed = (window as any).__automailV2Seed;
    if (typeof seed === "number" && Number.isFinite(seed) && seed >= 1 && seed <= 300) {
      return seed;
    }
    return null;
  }

  private getBaseSeedFromUrl(): number | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get("seed");
    if (seedParam) {
      const parsed = Number.parseInt(seedParam, 10);
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 300) {
        return parsed;
      }
    }
    return null;
  }

  private setEmails(nextEmails: Email[]): void {
    this.emails = nextEmails;
    if (this.emails.length > 0) {
      writeCachedEmails(this.emails);
    }
    this.ready = true;
    this.resolveReady();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const snapshot = [...this.emails];
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn("[dynamicDataProvider] listener error", err);
      }
    });
  }

  public async refreshEmailsForSeed(seedOverride?: number | null): Promise<void> {
    if (!isDbLoadModeEnabled()) return;
    await this.reload(seedOverride);
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy accessexport const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);
