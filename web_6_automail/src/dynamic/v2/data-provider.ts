import type { Email } from "@/types/email";
import { emails, initializeEmails, loadEmailsFromDb, writeCachedEmails, readCachedEmails } from "@/data/emails-enhanced";
import { isV2Enabled } from "@/dynamic/shared/flags";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { sanitizeEmailList } from "@/utils/emailValidation";

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private emails: Email[] = [];
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private listeners = new Set<(emails: Email[]) => void>();
  private currentSeed: number | null = null;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    // Hydrate from cache if available; sanitize to handle corrupted or outdated shape
    const cached = readCachedEmails();
    const fromCache = Array.isArray(cached) && cached.length > 0 ? sanitizeEmailList(cached) : [];
    this.emails = fromCache.length > 0 ? fromCache : emails;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    // Initialize emails with data generation if enabled
    this.initializeEmails();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initializeEmails(): Promise<void> {
    const seed = this.getSeed();
    this.currentSeed = seed;

    const fallbackCached = (): Email[] => {
      const cached = readCachedEmails();
      return Array.isArray(cached) && cached.length > 0 ? cached : [];
    };

    const fallbackStatic = (): Email[] => (emails.length > 0 ? [...emails] : []);

    try {
      const dbEmails = await loadEmailsFromDb(seed);
      const sanitizedDb = sanitizeEmailList(dbEmails);
      if (sanitizedDb.length > 0) {
        this.setEmails(sanitizedDb);
        return;
      }
    } catch (error) {
      console.warn("[automail/data-provider] loadEmailsFromDb failed:", error);
    }

    try {
      const initializedEmails = await initializeEmails(seed);
      const sanitized = sanitizeEmailList(initializedEmails);
      if (sanitized.length > 0) {
        this.setEmails(sanitized);
        return;
      }
    } catch (error) {
      console.warn("[automail/data-provider] initializeEmails failed:", error);
    }

    const cached = fallbackCached();
    if (cached.length > 0) {
      this.setEmails(cached);
      return;
    }

    const staticEmails = fallbackStatic();
    this.setEmails(staticEmails);
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
        const v2Seed = isV2Enabled()
          ? clampSeed(seedValue ?? this.getSeed())
          : 1;
        this.currentSeed = v2Seed;

        this.ready = false;
        this.readyPromise = new Promise<void>((resolve) => {
          this.resolveReady = resolve;
        });

        let loaded: Email[] = [];
        try {
          loaded = await initializeEmails(v2Seed);
        } catch (error) {
          console.warn("[automail] reload initializeEmails failed:", error);
          const cached = readCachedEmails();
          loaded = Array.isArray(cached) && cached.length > 0 ? cached : [];
        }
        const sanitized = sanitizeEmailList(loaded);
        this.setEmails(sanitized.length > 0 ? sanitized : loaded);
      } catch (error) {
        console.warn("[automail] Failed to reload emails:", error);
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
  private getSeed(): number {
    if (!isV2Enabled()) return 1;
    if (typeof window === "undefined") return 1;
    return clampSeed(getSeedFromUrl());
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
    await this.reload(seedOverride);
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Keep only the provider singleton; seed handling is centralized in SeedContext + EmailContext.
