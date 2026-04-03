import type { Email } from "@/types/email";
import type { MailTemplate } from "@/types/template";
import {
  emails,
  templates,
  initializeEmails,
  initializeTemplates,
  loadEmailsFromDb,
  loadTemplatesFromDb,
  writeCachedEmails,
  readCachedEmails,
  writeCachedTemplates,
  readCachedTemplates,
} from "@/data/automail-enhanced";
import { isV2Enabled } from "@/dynamic/shared/flags";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private emails: Email[] = [];
  private templates: MailTemplate[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private listeners = new Set<(emails: Email[]) => void>();
  private templateListeners = new Set<(templates: MailTemplate[]) => void>();
  private currentSeed: number | null = null;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    if (typeof window === "undefined") {
      this.ready = true;
      this.resolveReady();
      return;
    }

    // hydrate from cache if available to keep content stable across reloads
    const cachedEmails = readCachedEmails();
    this.emails = Array.isArray(cachedEmails) && cachedEmails.length > 0 ? cachedEmails : emails;
    const cachedTemplates = readCachedTemplates();
    this.templates = Array.isArray(cachedTemplates) && cachedTemplates.length > 0 ? cachedTemplates : templates;

    // Initialize dynamic data with data generation if enabled
    this.initializeData();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initializeData(): Promise<void> {
    const seed = this.getSeed();
    this.currentSeed = seed;

    try {
      const [dbEmails, dbTemplates] = await Promise.all([
        loadEmailsFromDb(seed),
        loadTemplatesFromDb(seed),
      ]);
      const initializedEmails = dbEmails.length > 0 ? dbEmails : await initializeEmails(seed);
      const initializedTemplates = dbTemplates.length > 0 ? dbTemplates : await initializeTemplates(seed);
      this.setData(initializedEmails, initializedTemplates);
    } catch (error) {
      console.warn("[automail/data-provider] Failed to load data:", error);
      try {
        const [initializedEmails, initializedTemplates] = await Promise.all([
          initializeEmails(seed),
          initializeTemplates(seed),
        ]);
        this.setData(initializedEmails, initializedTemplates);
      } catch {
        this.setData([], []);
      }
    }
  }
    /**
   * Reload data with a new seed
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
        const previousResolve = this.resolveReady;
        this.readyPromise = new Promise<void>((resolve) => {
          this.resolveReady = resolve;
        });
        previousResolve(); // Unblock any waiter (e.g. DataReadyGate) that was waiting on the old promise

        const [initializedEmails, initializedTemplates] = await Promise.all([
          initializeEmails(v2Seed),
          initializeTemplates(v2Seed),
        ]);
        this.setData(initializedEmails, initializedTemplates);
      } catch (error) {
        console.warn("[automail] Failed to reload data:", error);
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

  public getTemplates(): MailTemplate[] {
    return this.templates;
  }

  public subscribe(listener: (emails: Email[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeTemplates(listener: (templates: MailTemplate[]) => void): () => void {
    this.templateListeners.add(listener);
    return () => {
      this.templateListeners.delete(listener);
    };
  }
  // Get effective seed value - returns 1 (default) when dynamic HTML is disabled
  private getSeed(): number {
    if (!isV2Enabled()) return 1;
    if (typeof window === "undefined") return 1;
    return clampSeed(getSeedFromUrl());
  }

  private setData(nextEmails: Email[], nextTemplates: MailTemplate[]): void {
    this.emails = nextEmails;
    this.templates = nextTemplates;
    if (this.emails.length > 0) {
      writeCachedEmails(this.emails);
    }
    if (this.templates.length > 0) {
      writeCachedTemplates(this.templates);
    }
    this.ready = true;
    this.resolveReady();
    this.notifyListeners();
    this.notifyTemplateListeners();
  }

  private notifyListeners(): void {
    const snapshot = [...this.emails];
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn("[dynamicDataProvider] listener error", err);
      }
    }
  }

  private notifyTemplateListeners(): void {
    const snapshot = [...this.templates];
    for (const listener of this.templateListeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn("[dynamicDataProvider] template listener error", err);
      }
    }
  }

  public async refreshEmailsForSeed(seedOverride?: number | null): Promise<void> {
    await this.reload(seedOverride);
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Keep only the provider singleton; seed handling is centralized in SeedContext + EmailContext.
