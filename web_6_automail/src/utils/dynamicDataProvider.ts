import type { Email } from "@/types/email";
import { getEffectiveLayoutConfig, isDynamicEnabled } from "./seedLayout";
import { emails, initializeEmails, loadEmailsFromDb, writeCachedEmails, readCachedEmails } from "@/data/emails-enhanced";
import { isDataGenerationEnabled } from "@/shared/data-generator";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
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
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initializeEmails(): Promise<void> {
    try {
      // Try DB mode first if enabled
      const dbEmails = await loadEmailsFromDb();
      if (dbEmails.length > 0) {
        this.emails = dbEmails;
        writeCachedEmails(this.emails);
        this.ready = true;
        this.resolveReady();
        return;
      }
      
      // Fallback to existing behavior
      const initializedEmails = await initializeEmails();
      this.emails = initializedEmails;
      if (this.emails.length > 0) {
        writeCachedEmails(this.emails);
      }

      // Mark as ready only when either generation is disabled or we have generated data
      if (!this.dataGenerationEnabled || this.emails.length > 0) {
        this.ready = true;
        this.resolveReady();
      }

    } catch (error) {
      // Keep silent in production; initialize readiness when generation off
      // If generation is enabled, do not mark ready here; the gate will continue showing loading
      if (!this.dataGenerationEnabled) {
        this.ready = true;
        this.resolveReady();
      }
    }
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

  public getEmailById(id: string): Email | undefined {
    return this.emails.find((email) => email.id === id);
  }

  public getEmailsByCategory(category: string): Email[] {
    return this.emails.filter((email) => email.category === category);
  }

  public getUnreadEmails(): Email[] {
    return this.emails.filter((email) => !email.isRead);
  }

  public getStarredEmails(): Email[] {
    return this.emails.filter((email) => email.isStarred);
  }

  public searchEmails(query: string): Email[] {
    const lowercaseQuery = query.toLowerCase();
    return this.emails.filter((email) => 
      email.subject.toLowerCase().includes(lowercaseQuery) ||
      email.body?.toLowerCase().includes(lowercaseQuery) ||
      email.from.name?.toLowerCase().includes(lowercaseQuery) ||
      email.from.email?.toLowerCase().includes(lowercaseQuery)
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
    return getEffectiveLayoutConfig(seed);
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
        folder: "inbox"
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
        folder: "inbox"
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
        folder: "inbox"
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
        folder: "inbox"
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
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const getEmails = () => dynamicDataProvider.getEmails();
export const getEmailById = (id: string) => dynamicDataProvider.getEmailById(id);
export const getEmailsByCategory = (category: string) => dynamicDataProvider.getEmailsByCategory(category);
export const getUnreadEmails = () => dynamicDataProvider.getUnreadEmails();
export const getStarredEmails = () => dynamicDataProvider.getStarredEmails();
export const searchEmails = (query: string) => dynamicDataProvider.searchEmails(query);
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);

// Static data helpers
export const getStaticEmails = () => dynamicDataProvider.getStaticEmails();
export const getStaticLabels = () => dynamicDataProvider.getStaticLabels();
export const getStaticFolders = () => dynamicDataProvider.getStaticFolders();
export const getStaticThemes = () => dynamicDataProvider.getStaticThemes();
