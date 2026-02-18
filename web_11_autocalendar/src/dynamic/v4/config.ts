/**
 * V4 - Popup definitions (AutoCalendar: events, scheduling)
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
      title: ["Welcome to AutoCalendar", "Your scheduling assistant", "Plan with ease"],
      body: [
        "Create events, view day or month, and sync across devices. Use the sidebar to switch views and manage calendars. New features are added regularly.",
        "We've set up your calendar so you can add events, set reminders, and see your schedule at a glance. Use the menu for different views and settings.",
        "Whether you're scheduling a meeting or checking the week, the app gives you quick access to events and availability. Start from today or the month view.",
      ],
      cta: ["Get started", "View calendar", "Continue", "OK"],
    },
  },
  {
    id: "events",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center"],
    texts: {
      title: ["Create events", "Schedule meetings", "Add to calendar"],
      body: [
        "Click a time slot or use the New event button to create an event. Set title, time, and optional reminder. Events show on all your views.",
        "Events can be one-time or repeating. Add a location, description, or guests. You can edit or delete any event from the same dialog.",
        "Use quick-add or the full form to create events. Drag to resize or move them in day or week view. Your changes sync automatically.",
      ],
      cta: ["New event", "Create", "Got it", "Continue"],
    },
  },
  {
    id: "views",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right"],
    texts: {
      title: ["Switch views", "Day, week, month", "See your schedule"],
      body: [
        "Use the view toggle to switch between day, week, and month. Each view shows the same events in a different layout. Pick what works for you.",
        "Day view is best for detailed planning. Week and month give you the big picture. Use the arrows or today to navigate quickly.",
        "Your current view is saved. You can also open a mini calendar or list view from the sidebar for a different perspective.",
      ],
      cta: ["Change view", "OK", "Continue", "Got it"],
    },
  },
  {
    id: "reminders",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center"],
    texts: {
      title: ["Set reminders", "Never miss an event", "Get notified"],
      body: [
        "Add reminders when creating or editing an event. Choose a time before the event (e.g. 10 minutes or 1 day). Notifications appear on your device.",
        "Reminders can be email, push, or in-app. You can have multiple reminders per event and manage them in settings.",
        "Use default reminder settings to apply the same preference to new events. Override per event when you need something different.",
      ],
      cta: ["Add reminder", "Settings", "Got it", "Continue"],
    },
  },
];
