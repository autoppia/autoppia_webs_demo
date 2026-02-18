/**
 * V4 - Popup definitions (AutoList: tasks, to-dos, lists)
 */

export type PopupPlacement = "center" | "bottom-right" | "bottom-left" | "banner" | "top-right" | "top-left" | "top-banner" | "middle-right" | "middle-left";

export interface PopupDef {
  id: string;
  probability: number;
  delayMs: [number, number];
  placements: PopupPlacement[];
  texts: Record<string, string[]>;
}

/** All placements so popups can appear in different positions. */
const ALL_PLACEMENTS: PopupPlacement[] = [
  "center", "bottom-right", "bottom-left", "banner", "top-right", "top-left", "top-banner", "middle-right", "middle-left",
];

export const POPUPS: PopupDef[] = [
  {
    id: "welcome",
    probability: 1,
    delayMs: [800, 3200],
    placements: ALL_PLACEMENTS,
    texts: {
      title: ["Welcome to AutoList", "Your smart to-do app", "Get things done"],
      body: [
        "Create lists, add tasks, and track progress. Use the sidebar to switch between lists and views. New features are added regularly.",
        "We've set up your workspace so you can add tasks, set due dates, and organize with lists. Use the menu for filters and settings.",
        "Whether you're capturing a quick task or planning the week, the app gives you one place for all your to-dos. Start from the main list or create a new one.",
      ],
      cta: ["Get started", "Add task", "Continue", "OK"],
    },
  },
  {
    id: "tasks",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ALL_PLACEMENTS,
    texts: {
      title: ["Add and complete tasks", "Stay on track", "Your to-dos"],
      body: [
        "Add tasks with a title and optional due date or list. Mark them complete when done. Use filters to see active, completed, or overdue.",
        "Tasks can have notes, subtasks, or reminders. Reorder by drag and drop. Archive or delete when you're done with them.",
        "Use the quick-add bar for new tasks. Click a task to edit details. Completed tasks can be hidden or shown in the list view.",
      ],
      cta: ["Add task", "View list", "Got it", "Continue"],
    },
  },
  {
    id: "lists",
    probability: 1,
    delayMs: [900, 3800],
    placements: ALL_PLACEMENTS,
    texts: {
      title: ["Organize with lists", "Create lists", "Group your tasks"],
      body: [
        "Create multiple lists for work, personal, or projects. Each list has its own tasks. Switch between lists from the sidebar.",
        "Lists help you separate contexts. You can rename, reorder, or archive lists. Tasks in a list can be filtered and sorted.",
        "Use lists to keep work and personal tasks separate, or to group by project. Add as many lists as you need.",
      ],
      cta: ["New list", "View lists", "Continue", "OK"],
    },
  },
  {
    id: "reminders",
    probability: 1,
    delayMs: [600, 4000],
    placements: ALL_PLACEMENTS,
    texts: {
      title: ["Set reminders", "Never forget", "Due dates"],
      body: [
        "Add due dates to tasks and get reminders. Overdue tasks stand out so you can reprioritize. Notifications keep you on track.",
        "You can set a time or just a date. Reminders appear in the app and optionally as push or email. Manage them in task detail.",
        "Use the today view to see what's due. Filter by overdue or upcoming. Mark complete when done.",
      ],
      cta: ["Set due date", "View today", "Got it", "Continue"],
    },
  },
];
