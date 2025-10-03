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

  // Static CRM data - always available
  public getStaticClients(): Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    lastContact: string;
  }> {
    return [
      {
        id: "1",
        name: "Acme Corporation",
        email: "contact@acme.com",
        status: "Active",
        lastContact: "2024-01-15"
      },
      {
        id: "2", 
        name: "TechStart Inc",
        email: "hello@techstart.com",
        status: "Prospect",
        lastContact: "2024-01-10"
      },
      {
        id: "3",
        name: "Global Solutions Ltd",
        email: "info@globalsolutions.com",
        status: "Active",
        lastContact: "2024-01-12"
      },
      {
        id: "4",
        name: "Innovation Partners",
        email: "team@innovation.com",
        status: "Inactive",
        lastContact: "2023-12-20"
      }
    ];
  }

  public getStaticMatters(): Array<{
    id: string;
    title: string;
    client: string;
    status: string;
    priority: string;
    dueDate: string;
  }> {
    return [
      {
        id: "1",
        title: "Contract Review - Acme Corp",
        client: "Acme Corporation",
        status: "In Progress",
        priority: "High",
        dueDate: "2024-02-15"
      },
      {
        id: "2",
        title: "IP Protection Strategy",
        client: "TechStart Inc",
        status: "Pending",
        priority: "Medium",
        dueDate: "2024-02-20"
      },
      {
        id: "3",
        title: "Merger Documentation",
        client: "Global Solutions Ltd",
        status: "Completed",
        priority: "High",
        dueDate: "2024-01-30"
      },
      {
        id: "4",
        title: "Trademark Application",
        client: "Innovation Partners",
        status: "Draft",
        priority: "Low",
        dueDate: "2024-03-01"
      }
    ];
  }

  public getStaticDocuments(): Array<{
    id: string;
    name: string;
    type: string;
    matter: string;
    uploadDate: string;
    size: string;
  }> {
    return [
      {
        id: "1",
        name: "Contract_Draft_v2.pdf",
        type: "Contract",
        matter: "Contract Review - Acme Corp",
        uploadDate: "2024-01-15",
        size: "2.3 MB"
      },
      {
        id: "2",
        name: "IP_Strategy_2024.docx",
        type: "Strategy Document",
        matter: "IP Protection Strategy",
        uploadDate: "2024-01-10",
        size: "1.8 MB"
      },
      {
        id: "3",
        name: "Merger_Agreement_Final.pdf",
        type: "Legal Document",
        matter: "Merger Documentation",
        uploadDate: "2024-01-30",
        size: "5.2 MB"
      },
      {
        id: "4",
        name: "Trademark_Application.pdf",
        type: "Application",
        matter: "Trademark Application",
        uploadDate: "2024-01-05",
        size: "890 KB"
      }
    ];
  }

  public getStaticCalendarEvents(): Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    type: string;
    client?: string;
  }> {
    return [
      {
        id: "1",
        title: "Client Meeting - Acme Corp",
        date: "2024-02-15",
        time: "10:00 AM",
        type: "Meeting",
        client: "Acme Corporation"
      },
      {
        id: "2",
        title: "Court Hearing - Smith vs. Jones",
        date: "2024-02-18",
        time: "2:00 PM",
        type: "Court"
      },
      {
        id: "3",
        title: "Document Review Session",
        date: "2024-02-20",
        time: "9:00 AM",
        type: "Work"
      },
      {
        id: "4",
        title: "Client Call - TechStart Inc",
        date: "2024-02-22",
        time: "3:30 PM",
        type: "Call",
        client: "TechStart Inc"
      }
    ];
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);

// Static data helpers
export const getStaticClients = () => dynamicDataProvider.getStaticClients();
export const getStaticMatters = () => dynamicDataProvider.getStaticMatters();
export const getStaticDocuments = () => dynamicDataProvider.getStaticDocuments();
export const getStaticCalendarEvents = () => dynamicDataProvider.getStaticCalendarEvents();
