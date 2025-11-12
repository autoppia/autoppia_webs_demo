import { getSeedLayout } from "@/library/layouts";

// Check if dynamic HTML is enabled via environment variable (strictly use dynamic_html_structure flag)
const isDynamicHtmlEnabled = (): boolean => {
  const rawFlag =
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE ??
    process.env.NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE ??
    process.env.ENABLE_DYNAMIC_HTML_STRUCTURE ??
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML ??
    process.env.ENABLE_DYNAMIC_HTML ??
    '';

  const normalized = rawFlag.toString().trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
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
    return getSeedLayout(seed);
  }

  // Static task data - always available
  public getStaticTasks(): Array<{
    id: string;
    name: string;
    description: string;
    priority: number;
    status: string;
    createdAt: string;
  }> {
    return [
      {
        id: "1",
        name: "Complete project proposal",
        description: "Write and submit the quarterly project proposal",
        priority: 1,
        status: "pending",
        createdAt: "2024-01-15"
      },
      {
        id: "2", 
        name: "Review team performance",
        description: "Analyze Q1 team metrics and prepare feedback",
        priority: 2,
        status: "pending",
        createdAt: "2024-01-14"
      },
      {
        id: "3",
        name: "Update documentation",
        description: "Refresh API documentation and user guides",
        priority: 3,
        status: "in_progress",
        createdAt: "2024-01-13"
      },
      {
        id: "4",
        name: "Schedule team meeting",
        description: "Plan next week's team retrospectives",
        priority: 4,
        status: "completed",
        createdAt: "2024-01-12"
      }
    ];
  }

  public getStaticCalendarEvents(): Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    type: string;
    description?: string;
  }> {
    return [
      {
        id: "1",
        title: "Daily Standup",
        date: "2024-01-15",
        time: "9:00 AM",
        type: "meeting",
        description: "Team daily sync"
      },
      {
        id: "2",
        title: "Client Presentation",
        date: "2024-01-16",
        time: "2:00 PM",
        type: "presentation"
      },
      {
        id: "3",
        title: "Code Review Session",
        date: "2024-01-17",
        time: "10:30 AM",
        type: "work",
        description: "Review pending PRs"
      },
      {
        id: "4",
        title: "Team Retrospective",
        date: "2024-01-18",
        time: "4:00 PM",
        type: "retrospective"
      }
    ];
  }

  public getStaticProjects(): Array<{
    id: string;
    name: string;
    description: string;
    progress: number;
    teamSize: number;
    deadline: string;
  }> {
    return [
      {
        id: "1",
        name: "Product Redesign",
        description: "Complete overhaul of user interface",
        progress: 75,
        teamSize: 8,
        deadline: "2024-02-15"
      },
      {
        id: "2",
        name: "Mobile App Launch",
        description: "iOS and Android app rollout",
        progress: 45,
        teamSize: 12,
        deadline: "2024-03-01"
      },
      {
        id: "3",
        name: "Security Audit",
        description: "Comprehensive security assessment",
        progress: 90,
        teamSize: 4,
        deadline: "2024-01-30"
      },
      {
        id: "4",
        name: "Performance Optimization",
        description: "Database and API performance tuning",
        progress: 60,
        teamSize: 6,
        deadline: "2024-02-28"
      }
    ];
  }

  public getStaticTeams(): Array<{
    id: string;
    name: string;
    members: string[];
    role: string;
    avatar?: string;
  }> {
    return [
      {
        id: "1",
        name: "Frontend Team",
        members: ["Alice Johnson", "Bob Smith", "Carol Brown"],
        role: "Development",
        avatar: "👨‍💻"
      },
      {
        id: "2",
        name: "Backend Team", 
        members: ["David Wilson", "Emma Davis"],
        role: "Development",
        avatar: "⚙️"
      },
      {
        id: "3",
        name: "Design Team",
        members: ["Frank Miller", "Grace Lee"],
        role: "Design",
        avatar: "🎨"
      },
      {
        id: "4",
        name: "QA Team",
        members: ["Henry Taylor", "Ivy Chen", "Jack Wilson"],
        role: "Quality Assurance",
        avatar: "🧪"
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
export const getStaticTasks = () => dynamicDataProvider.getStaticTasks();
export const getStaticCalendarEvents = () => dynamicDataProvider.getStaticCalendarEvents();
export const getStaticProjects = () => dynamicDataProvider.getStaticProjects();
export const getStaticTeams = () => dynamicDataProvider.getStaticTeams();
