/**
 * V4 - Popup definitions (AutoWork: tasks, freelancers, projects)
 */

export type PopupPlacement = "center" | "bottom-right" | "banner";

export interface PopupDef {
  id: string;
  probability: number;
  delayMs: [number, number];
  placements: PopupPlacement[];
  texts: Record<string, string[]>;
}

export const POPUPS: PopupDef[] = [
  {
    id: "welcome",
    probability: 1,
    delayMs: [800, 3200],
    placements: ["center", "bottom-right"],
    texts: {
      title: ["Welcome to AutoWork", "Hire freelancers", "Get work done"],
      body: [
        "Browse freelancers, post projects, and manage tasks. Use the dashboard to track progress and messages. New features are added regularly.",
        "We've set up your workspace so you can find talent, create projects, and collaborate. Use the sidebar to switch between dashboard, projects, and messages.",
        "Whether you're hiring or managing a project, the platform gives you quick access to freelancers and tasks. Start from the dashboard or browse talent.",
      ],
      cta: ["Get started", "Go to dashboard", "Continue", "OK"],
    },
  },
  {
    id: "projects",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center"],
    texts: {
      title: ["Your projects", "Manage work", "Track progress"],
      body: [
        "Create and manage projects from the dashboard. Assign tasks to freelancers, set milestones, and track delivery. All in one place.",
        "Projects show status, budget, and team. You can invite freelancers, add tasks, and see activity. Use filters to find active or completed work.",
        "Use projects to organize work and collaborate. Each project has its own tasks, messages, and timeline. Stay on top of deadlines and deliverables.",
      ],
      cta: ["View projects", "Create project", "Got it", "Continue"],
    },
  },
  {
    id: "freelancers",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right"],
    texts: {
      title: ["Find freelancers", "Browse talent", "Hire skilled pros"],
      body: [
        "Search and filter freelancers by skill, rate, and availability. View profiles, reviews, and portfolios. Invite them to your projects with one click.",
        "The talent pool is updated regularly. You can save favorites, compare profiles, and send direct messages before hiring.",
        "Use filters to narrow by category, budget, or location. Each profile shows experience and past work. Hire when you're ready.",
      ],
      cta: ["Browse talent", "Search", "Continue", "OK"],
    },
  },
  {
    id: "messages",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center"],
    texts: {
      title: ["Messages", "Stay in touch", "Collaborate"],
      body: [
        "Message freelancers and clients from the messages section. Threads are grouped by project so you keep context clear.",
        "Reply to invites, discuss scope, and share files in one place. Notifications help you never miss an update.",
        "Use messages to negotiate, clarify tasks, and coordinate. All conversations are stored and searchable.",
      ],
      cta: ["Open messages", "Reply", "Got it", "Continue"],
    },
  },
];
