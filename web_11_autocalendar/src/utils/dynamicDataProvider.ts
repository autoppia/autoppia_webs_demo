import { getEffectiveLayoutConfig, isDynamicEnabled } from "./seedLayout";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

// Dynamic data provider that manages calendar data and dynamic HTML state
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

  // Static Calendar data - always available
  public getStaticCalendar(): Array<{
    id: string;
    name: string;
    color: string;
    isSelected: boolean;
    eventsCount: number;
  }> {
    return [
      {
        id: "1",
        name: "My Calendar",
        color: "#4285f4",
        isSelected: true,
        eventsCount: 12
      },
      {
        id: "2", 
        name: "Work",
        color: "#ea4335",
        isSelected: true,
        eventsCount: 8
      },
      {
        id: "3",
        name: "Personal",
        color: "#34a853",
        isSelected: false,
        eventsCount: 5
      },
      {
        id: "4",
        name: "Travel",
        color: "#fbbc04",
        isSelected: false,
        eventsCount: 3
      }
    ];
  }

  public getStaticEvents(): Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    date: string;
    calendarId: string;
    attendees: string[];
    location?: string;
  }> {
    return [
      {
        id: "1",
        title: "Team Meeting - Project Review",
        startTime: "10:00",
        endTime: "11:30",
        date: "2024-01-15",
        calendarId: "2",
        attendees: ["john@company.com", "sarah@company.com"],
        location: "Conference Room A"
      },
      {
        id: "2",
        title: "Personal Development Workshop",
        startTime: "14:00",
        endTime: "16:00",
        date: "2024-01-16",
        calendarId: "1",
        attendees: ["user@example.com"],
        location: "Online"
      },
      {
        id: "3",
        title: "Client Presentation",
        startTime: "09:00",
        endTime: "12:00",
        date: "2024-01-18",
        calendarId: "2",
        attendees: ["client@company.com", "team@company.com"],
        location: "Meeting Room B"
      },
      {
        id: "4",
        title: "Weekend Getaway Planning",
        startTime: "19:00",
        endTime: "20:00",
        date: "2024-01-20",
        calendarId: "3",
        attendees: ["partner@example.com"]
      }
    ];
  }

  public getStaticReminders(): Array<{
    id: string;
    name: string;
    timeBefore: string;
    isActive: boolean;
  }> {
    return [
      {
        id: "1",
        name: "15 minutes before",
        timeBefore: "15m",
        isActive: true
      },
      {
        id: "2",
        name: "1 hour before",
        timeBefore: "1h",
        isActive: true
      },
      {
        id: "3",
        name: "1 day before",
        timeBefore: "1d",
        isActive: false
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
export const getStaticCalendar = () => dynamicDataProvider.getStaticCalendar();
export const getStaticEvents = () => dynamicDataProvider.getStaticEvents();
export const getStaticReminders = () => dynamicDataProvider.getStaticReminders();
