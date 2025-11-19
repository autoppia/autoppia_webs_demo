import { getEffectiveLayoutConfig, isDynamicEnabled } from "@/dynamic/v1-layouts";
import { isDataGenerationEnabled } from "@/shared/data-generator";
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

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled: boolean = false;
  private dataGenerationEnabled: boolean = false;
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private clients: any[] = [];
  private matters: any[] = [];
  private files: any[] = [];
  private events: any[] = [];
  private logs: any[] = [];

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
    this.dataGenerationEnabled = isDataGenerationEnabled();
    
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
    
    // Initialize data with data generation if enabled
    this.initializeData();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initializeData(): Promise<void> {
    try {
      // Try DB mode first if enabled
      const runtimeSeed = (typeof window !== "undefined" ? (window as any).__autocrmV2Seed : null) as number | null;
      if (runtimeSeed) {
        console.log("[DynamicDataProvider] Using runtime v2Seed for DB load:", runtimeSeed);
      }
      const dbClients = await loadClientsFromDb(runtimeSeed ?? undefined);
      const dbMatters = await loadMattersFromDb(runtimeSeed ?? undefined);
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
        initializeClients(),
        initializeMatters(),
        initializeFiles(),
        initializeEvents(),
        initializeLogs(),
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
      
      // Mark as ready only when either generation is disabled or we have generated data
      if (!this.dataGenerationEnabled || this.clients.length > 0 || this.matters.length > 0) {
        this.ready = true;
        this.resolveReady();
      }

    } catch (error) {
      console.error("❌ Error initializing CRM data:", error);
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

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  public getClients(): any[] {
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
    return this.clients.find((client) => client.id === id);
  }

  public getMatterById(id: string): any | undefined {
    return this.matters.find((matter) => matter.id === id);
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
export const isReady = () => dynamicDataProvider.isReady();
export const whenReady = () => dynamicDataProvider.whenReady();

// Static data helpers
export const getStaticClients = () => dynamicDataProvider.getStaticClients();
export const getStaticMatters = () => dynamicDataProvider.getStaticMatters();
export const getStaticDocuments = () => dynamicDataProvider.getStaticDocuments();
export const getStaticCalendarEvents = () => dynamicDataProvider.getStaticCalendarEvents();
