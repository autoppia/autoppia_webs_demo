import type { Email, EmailFolder } from "@/types/email";
import { emails, initializeEmails, loadEmailsFromDb, writeCachedEmails, readCachedEmails } from "@/data/emails-enhanced";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { isDataGenerationEnabled } from "@/shared/data-generator";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 === "true" || process.env.ENABLE_DYNAMIC_V1 === "true";
};

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private emails: Email[] = [];
  private isEnabled: boolean = false;
  private dataGenerationEnabled: boolean = false;
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private listeners = new Set<(emails: Email[]) => void>();
  private currentSeed: number | null = null;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
    this.dataGenerationEnabled = isDataGenerationEnabled();
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
   * Reload data if seed has changed
   */
  public reloadIfSeedChanged(): void {
    const runtimeSeed = this.getRuntimeV2Seed();
    if (runtimeSeed !== null && runtimeSeed !== this.currentSeed) {
      console.log(`[automail] Seed changed from ${this.currentSeed} to ${runtimeSeed}, reloading...`);
      this.reload(runtimeSeed);
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

  public getEmailById(id: string): Email | undefined {
    return this.emails.find((email) => email.id === id);
  }

  public getEmailsByCategory(category: string): Email[] {
    return this.emails.filter((email) => email.category === category);
  }

  public getEmailsByFolder(folder: EmailFolder): Email[] {
    return this.emails.filter((email) => this.matchesFolder(email, folder));
  }

  public getUnreadEmails(): Email[] {
    return this.emails.filter((email) => !email.isRead);
  }

  public getStarredEmails(): Email[] {
    return this.emails.filter((email) => email.isStarred);
  }

  public getImportantEmails(): Email[] {
    return this.emails.filter((email) => email.isImportant);
  }

  public searchEmails(query: string): Email[] {
    const lowercaseQuery = query.toLowerCase();
    return this.emails.filter((email) => 
      email.subject.toLowerCase().includes(lowercaseQuery) ||
      email.body.toLowerCase().includes(lowercaseQuery) ||
      email.from.name?.toLowerCase().includes(lowercaseQuery) ||
      email.from.email?.toLowerCase().includes(lowercaseQuery)
    );
  }

  public getEmailsByLabel(labelId: string): Email[] {
    return this.emails.filter((email) =>
      email.labels?.some((label) => label.id === labelId)
    );
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
    return { layoutType: "fixed", seed: seed ?? 1 };
  }

  // Static Email data - always available
  public getStaticEmails(): Array<{
    id: string;
    subject: string;
    from: string;
    to: string;
    date: string;
    isRead: boolean;
    isStarred: boolean;
    isImportant: boolean;
    folder: string;
    body?: string;
    attachments?: Array<{ name: string; size: string; type: string }>;
    labels?: string[];
    threadId?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
  }> {
    return [
      {
        id: "1",
        subject: "Welcome to AutoMail",
        from: "noreply@automail.com",
        to: "user@example.com",
        date: "2024-01-15",
        isRead: false,
        isStarred: false,
        isImportant: true,
        folder: "inbox",
        body: "Welcome to AutoMail! This is your new email client with advanced features and modern design.",
        labels: ["welcome", "system"],
        threadId: "thread-1"
      },
      {
        id: "2",
        subject: "Meeting Reminder - Project Review",
        from: "manager@company.com",
        to: "user@example.com",
        date: "2024-01-14",
        isRead: true,
        isStarred: true,
        isImportant: false,
        folder: "inbox",
        body: "Don't forget about our project review meeting tomorrow at 2 PM. Please prepare your presentation.",
        labels: ["work", "meeting"],
        threadId: "thread-2",
        attachments: [
          { name: "project_review.pdf", size: "2.3 MB", type: "application/pdf" }
        ]
      },
      {
        id: "3",
        subject: "Invoice #12345 - Payment Due",
        from: "billing@service.com",
        to: "user@example.com",
        date: "2024-01-13",
        isRead: false,
        isStarred: false,
        isImportant: true,
        folder: "inbox",
        body: "Your invoice #12345 is due for payment. Amount: $299.99. Please pay by January 20th.",
        labels: ["billing", "urgent"],
        threadId: "thread-3"
      },
      {
        id: "4",
        subject: "Newsletter - Weekly Updates",
        from: "newsletter@tech.com",
        to: "user@example.com",
        date: "2024-01-12",
        isRead: true,
        isStarred: false,
        isImportant: false,
        folder: "inbox",
        body: "This week's tech newsletter includes updates on AI, web development, and new tools.",
        labels: ["newsletter", "tech"],
        threadId: "thread-4"
      },
      {
        id: "5",
        subject: "Team Collaboration Update",
        from: "team@company.com",
        to: "user@example.com",
        date: "2024-01-11",
        isRead: true,
        isStarred: false,
        isImportant: false,
        folder: "inbox",
        body: "The team has made great progress this week. Here's what we accomplished...",
        labels: ["team", "update"],
        threadId: "thread-5",
        cc: ["colleague1@company.com", "colleague2@company.com"]
      },
      {
        id: "6",
        subject: "Security Alert - Login from New Device",
        from: "security@automail.com",
        to: "user@example.com",
        date: "2024-01-10",
        isRead: false,
        isStarred: false,
        isImportant: true,
        folder: "inbox",
        body: "We detected a login from a new device. If this wasn't you, please secure your account.",
        labels: ["security", "alert"],
        threadId: "thread-6"
      },
      {
        id: "7",
        subject: "Draft: Project Proposal",
        from: "user@example.com",
        to: "client@company.com",
        date: "2024-01-09",
        isRead: true,
        isStarred: false,
        isImportant: false,
        folder: "drafts",
        body: "Here's the project proposal we discussed. Please review and let me know your thoughts.",
        labels: ["draft", "proposal"],
        threadId: "thread-7"
      },
      {
        id: "8",
        subject: "Re: Meeting Follow-up",
        from: "colleague@company.com",
        to: "user@example.com",
        date: "2024-01-08",
        isRead: true,
        isStarred: true,
        isImportant: false,
        folder: "inbox",
        body: "Thanks for the great meeting yesterday. I'll send over the documents we discussed.",
        labels: ["work", "follow-up"],
        threadId: "thread-8",
        replyTo: "user@example.com"
      }
    ];
  }

  public getStaticLabels(): Array<{
    id: string;
    name: string;
    color: string;
    count: number;
  }> {
    return [
      {
        id: "1",
        name: "Work",
        color: "blue",
        count: 15
      },
      {
        id: "2",
        name: "Personal",
        color: "green",
        count: 8
      },
      {
        id: "3",
        name: "Important",
        color: "red",
        count: 3
      },
      {
        id: "4",
        name: "Projects",
        color: "purple",
        count: 12
      }
    ];
  }

  public getStaticFolders(): Array<{
    id: string;
    name: string;
    icon: string;
    count: number;
    unreadCount: number;
  }> {
    return [
      {
        id: "inbox",
        name: "Inbox",
        icon: "inbox",
        count: 25,
        unreadCount: 5
      },
      {
        id: "starred",
        name: "Starred",
        icon: "star",
        count: 8,
        unreadCount: 0
      },
      {
        id: "sent",
        name: "Sent",
        icon: "send",
        count: 42,
        unreadCount: 0
      },
      {
        id: "drafts",
        name: "Drafts",
        icon: "edit",
        count: 3,
        unreadCount: 0
      },
      {
        id: "trash",
        name: "Trash",
        icon: "trash",
        count: 12,
        unreadCount: 0
      }
    ];
  }

  public getStaticThemes(): Array<{
    id: string;
    name: string;
    description: string;
    isActive: boolean;
  }> {
    return [
      {
        id: "light",
        name: "Light",
        description: "Clean and bright interface",
        isActive: true
      },
      {
        id: "dark",
        name: "Dark",
        description: "Easy on the eyes",
        isActive: false
      },
      {
        id: "system",
        name: "System",
        description: "Follows system preference",
        isActive: false
      }
    ];
  }

  // Get email statistics
  public getEmailStats() {
    const emails = this.emails;
    return {
      total: emails.length,
      unread: emails.filter(e => !e.isRead).length,
      starred: emails.filter(e => e.isStarred).length,
      important: emails.filter(e => e.isImportant).length,
      byFolder: {
        inbox: emails.filter((e) => this.matchesFolder(e, "inbox")).length,
        sent: emails.filter((e) => this.matchesFolder(e, "sent")).length,
        drafts: emails.filter((e) => this.matchesFolder(e, "drafts")).length,
        trash: emails.filter((e) => this.matchesFolder(e, "trash")).length,
        spam: emails.filter((e) => this.matchesFolder(e, "spam")).length,
      }
    };
  }

  // Get recent emails (last 7 days)
  public getRecentEmails(days: number = 7) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - days);
    
    return this.emails.filter(email => {
      const emailDate = new Date(email.timestamp);
      return emailDate >= sevenDaysAgo;
    });
  }

  // Get email threads
  public getEmailThreads() {
    const emails = this.emails;
    const threadMap = new Map<string, typeof emails>();
    
    emails.forEach(email => {
      if (email.threadId) {
        if (!threadMap.has(email.threadId)) {
          threadMap.set(email.threadId, []);
        }
        threadMap.get(email.threadId)!.push(email);
      }
    });
    
    return Array.from(threadMap.values());
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

  private matchesFolder(email: Email, folder: EmailFolder): boolean {
    const hasLabel = (labelId: string) =>
      email.labels?.some((label) => label.id === labelId);

    switch (folder) {
      case "inbox":
        return (
          !email.isDraft &&
          !hasLabel("trash") &&
          !hasLabel("spam") &&
          !hasLabel("sent")
        );
      case "starred":
        return email.isStarred && !hasLabel("trash") && !hasLabel("spam");
      case "snoozed":
        return email.isSnoozed && !hasLabel("trash") && !hasLabel("spam");
      case "sent":
        return (
          hasLabel("sent") ||
          (!email.isDraft &&
            email.from.email?.toLowerCase() === "me@gmail.com" &&
            !hasLabel("trash"))
        );
      case "drafts":
        return email.isDraft && !hasLabel("trash");
      case "spam":
        return hasLabel("spam");
      case "trash":
        return hasLabel("trash");
      case "important":
        return email.isImportant && !hasLabel("trash") && !hasLabel("spam");
      default:
        return false;
    }
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const getEmails = () => dynamicDataProvider.getEmails();
export const getEmailById = (id: string) => dynamicDataProvider.getEmailById(id);
export const getEmailsByCategory = (category: string) => dynamicDataProvider.getEmailsByCategory(category);
export const getEmailsByFolder = (folder: EmailFolder) => dynamicDataProvider.getEmailsByFolder(folder);
export const getUnreadEmails = () => dynamicDataProvider.getUnreadEmails();
export const getStarredEmails = () => dynamicDataProvider.getStarredEmails();
export const getImportantEmails = () => dynamicDataProvider.getImportantEmails();
export const searchEmails = (query: string) => dynamicDataProvider.searchEmails(query);
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);

// Static data helpers
export const getStaticEmails = () => dynamicDataProvider.getStaticEmails();
export const getStaticLabels = () => dynamicDataProvider.getStaticLabels();
export const getStaticFolders = () => dynamicDataProvider.getStaticFolders();
export const getStaticThemes = () => dynamicDataProvider.getStaticThemes();
export const getEmailsByLabel = (label: string) => dynamicDataProvider.getEmailsByLabel(label);
export const getEmailStats = () => dynamicDataProvider.getEmailStats();
export const getRecentEmails = () => dynamicDataProvider.getRecentEmails();
export const getEmailThreads = () => dynamicDataProvider.getEmailThreads();
