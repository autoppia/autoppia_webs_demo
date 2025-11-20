import { getSeedLayout } from "@/dynamic/v1-layouts";

const isDynamicHtmlEnabled = (): boolean => {
  const rawFlag =
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1_STRUCTURE ??
    process.env.NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE ??
    process.env.ENABLE_DYNAMIC_V1_STRUCTURE ??
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 ??
    process.env.ENABLE_DYNAMIC_V1 ??
    "";

  const normalized = rawFlag.toString().trim().toLowerCase();
  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "on"
  );
};

class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled = false;
  private ready: boolean = true;
  private readyPromise: Promise<void>;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
    this.readyPromise = Promise.resolve();
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

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getEffectiveSeed(providedSeed: number = 1): number {
    if (!this.isEnabled) {
      return 1;
    }

    if (providedSeed < 1 || providedSeed > 300) {
      return 1;
    }

    return providedSeed;
  }

  public getLayoutConfig(seed?: number) {
    return getSeedLayout(seed);
  }

  public getStaticTasks() {
    return [
      {
        id: "1",
        name: "Complete project proposal",
        description: "Write and submit the quarterly project proposal",
        priority: 1,
        status: "pending",
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        name: "Review team performance",
        description: "Analyze Q1 team metrics and prepare feedback",
        priority: 2,
        status: "pending",
        createdAt: "2024-01-14",
      },
      {
        id: "3",
        name: "Update documentation",
        description: "Refresh API documentation and user guides",
        priority: 3,
        status: "in_progress",
        createdAt: "2024-01-13",
      },
      {
        id: "4",
        name: "Schedule team meeting",
        description: "Plan next week's team retrospectives",
        priority: 4,
        status: "completed",
        createdAt: "2024-01-12",
      },
    ];
  }

  public getStaticCalendarEvents() {
    return [
      {
        id: "1",
        title: "Daily Standup",
        date: "2024-01-15",
        time: "9:00 AM",
        type: "meeting",
        description: "Team daily sync",
      },
      {
        id: "2",
        title: "Client Presentation",
        date: "2024-01-16",
        time: "2:00 PM",
        type: "presentation",
      },
      {
        id: "3",
        title: "Code Review Session",
        date: "2024-01-17",
        time: "10:30 AM",
        type: "work",
        description: "Review pending PRs",
      },
      {
        id: "4",
        title: "Team Retrospective",
        date: "2024-01-18",
        time: "4:00 PM",
        type: "retrospective",
      },
    ];
  }

  public getStaticProjects() {
    return [
      {
        id: "1",
        name: "Product Redesign",
        description: "Complete overhaul of user interface",
        progress: 75,
        teamSize: 8,
        deadline: "2024-02-15",
      },
      {
        id: "2",
        name: "Mobile App Launch",
        description: "iOS and Android app rollout",
        progress: 45,
        teamSize: 12,
        deadline: "2024-03-01",
      },
      {
        id: "3",
        name: "Security Audit",
        description: "Comprehensive security assessment",
        progress: 90,
        teamSize: 4,
        deadline: "2024-01-30",
      },
      {
        id: "4",
        name: "Performance Optimization",
        description: "Database and API performance tuning",
        progress: 60,
        teamSize: 6,
        deadline: "2024-02-28",
      },
    ];
  }

  public getStaticTeams() {
    return [
      {
        id: "1",
        name: "Frontend Team",
        members: ["Alice Johnson", "Bob Smith", "Carol Brown"],
        role: "Development",
        avatar: "👨‍💻",
      },
      {
        id: "2",
        name: "Backend Team",
        members: ["David Wilson", "Emma Davis"],
        role: "Development",
        avatar: "⚙️",
      },
      {
        id: "3",
        name: "Design Team",
        members: ["Frank Miller", "Grace Lee"],
        role: "Design",
        avatar: "🎨",
      },
      {
        id: "4",
        name: "QA Team",
        members: ["Henry Taylor", "Ivy Chen", "Jack Wilson"],
        role: "Quality Assurance",
        avatar: "🧪",
      },
    ];
  }
}

const dynamicDataProvider = DynamicDataProvider.getInstance();

export const isDynamicModeEnabled = () =>
  dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) =>
  dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) =>
  dynamicDataProvider.getLayoutConfig(seed);

export const getStaticTasks = () => dynamicDataProvider.getStaticTasks();
export const getStaticCalendarEvents = () =>
  dynamicDataProvider.getStaticCalendarEvents();
export const getStaticProjects = () => dynamicDataProvider.getStaticProjects();
export const getStaticTeams = () => dynamicDataProvider.getStaticTeams();
export const whenReady = () => dynamicDataProvider.whenReady();
