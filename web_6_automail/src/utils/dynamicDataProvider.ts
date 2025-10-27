import { getEffectiveLayoutConfig, isDynamicEnabled } from "./seedLayout";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled: boolean = false;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
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

  // Get emails by folder
  public getEmailsByFolder(folder: string) {
    return this.getStaticEmails().filter(email => email.folder === folder);
  }

  // Get unread emails
  public getUnreadEmails() {
    return this.getStaticEmails().filter(email => !email.isRead);
  }

  // Get starred emails
  public getStarredEmails() {
    return this.getStaticEmails().filter(email => email.isStarred);
  }

  // Get important emails
  public getImportantEmails() {
    return this.getStaticEmails().filter(email => email.isImportant);
  }

  // Search emails
  public searchEmails(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return this.getStaticEmails().filter(email => 
      email.subject.toLowerCase().includes(lowercaseQuery) ||
      email.from.toLowerCase().includes(lowercaseQuery) ||
      email.to.toLowerCase().includes(lowercaseQuery) ||
      email.body?.toLowerCase().includes(lowercaseQuery) ||
      email.labels?.some(label => label.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get email by ID
  public getEmailById(id: string) {
    return this.getStaticEmails().find(email => email.id === id);
  }

  // Get emails by label
  public getEmailsByLabel(label: string) {
    return this.getStaticEmails().filter(email => 
      email.labels?.includes(label)
    );
  }

  // Get email statistics
  public getEmailStats() {
    const emails = this.getStaticEmails();
    return {
      total: emails.length,
      unread: emails.filter(e => !e.isRead).length,
      starred: emails.filter(e => e.isStarred).length,
      important: emails.filter(e => e.isImportant).length,
      byFolder: {
        inbox: emails.filter(e => e.folder === 'inbox').length,
        sent: emails.filter(e => e.folder === 'sent').length,
        drafts: emails.filter(e => e.folder === 'drafts').length,
        trash: emails.filter(e => e.folder === 'trash').length,
        spam: emails.filter(e => e.folder === 'spam').length
      }
    };
  }

  // Get recent emails (last 7 days)
  public getRecentEmails() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return this.getStaticEmails().filter(email => {
      const emailDate = new Date(email.date);
      return emailDate >= sevenDaysAgo;
    });
  }

  // Get email threads
  public getEmailThreads() {
    const emails = this.getStaticEmails();
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
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);

// Static data helpers
export const getStaticEmails = () => dynamicDataProvider.getStaticEmails();
export const getStaticLabels = () => dynamicDataProvider.getStaticLabels();
export const getStaticFolders = () => dynamicDataProvider.getStaticFolders();
export const getStaticThemes = () => dynamicDataProvider.getStaticThemes();

// Email data helpers
export const getEmailsByFolder = (folder: string) => dynamicDataProvider.getEmailsByFolder(folder);
export const getUnreadEmails = () => dynamicDataProvider.getUnreadEmails();
export const getStarredEmails = () => dynamicDataProvider.getStarredEmails();
export const getImportantEmails = () => dynamicDataProvider.getImportantEmails();
export const searchEmails = (query: string) => dynamicDataProvider.searchEmails(query);
export const getEmailById = (id: string) => dynamicDataProvider.getEmailById(id);
export const getEmailsByLabel = (label: string) => dynamicDataProvider.getEmailsByLabel(label);
export const getEmailStats = () => dynamicDataProvider.getEmailStats();
export const getRecentEmails = () => dynamicDataProvider.getRecentEmails();
export const getEmailThreads = () => dynamicDataProvider.getEmailThreads();
