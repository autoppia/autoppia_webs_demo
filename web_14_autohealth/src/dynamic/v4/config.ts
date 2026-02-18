/**
 * V4 - Popup definitions (AutoHealth: doctors, appointments, healthcare)
 */

export type PopupPlacement = "center" | "bottom-right" | "bottom-left" | "banner" | "top-right" | "top-left" | "top-banner" | "middle-right" | "middle-left";

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
    placements: ["center", "bottom-right", "top-right", "bottom-left", "banner", "top-banner"],
    texts: {
      title: ["Welcome to AutoHealth", "Your healthcare portal", "Manage your care"],
      body: [
        "Find doctors, book appointments, and view your health info. Use the menu to browse providers, appointments, and your profile. New features are added regularly.",
        "We've set up your portal so you can search providers, schedule visits, and access your records. Use the main navigation to get started.",
        "Whether you're booking a check-up or checking results, the portal gives you one place for appointments and health info. Start from the home page.",
      ],
      cta: ["Get started", "Find a doctor", "Continue", "OK"],
    },
  },
  {
    id: "doctors",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center", "top-right", "bottom-left", "top-banner"],
    texts: {
      title: ["Find a doctor", "Browse providers", "Book with specialists"],
      body: [
        "Search by specialty, location, or name. View profiles, ratings, and availability. Book an appointment directly from the provider page.",
        "Provider profiles show credentials, accepted insurance, and patient reviews. You can filter by distance, language, or appointment type.",
        "Use the search or browse by specialty. Click a provider to see times and book. Telehealth and in-person options are shown where available.",
      ],
      cta: ["Search doctors", "Browse", "Got it", "Continue"],
    },
  },
  {
    id: "appointments",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right", "top-left", "bottom-left", "top-banner"],
    texts: {
      title: ["Your appointments", "Upcoming visits", "Schedule"],
      body: [
        "View upcoming and past appointments in one place. Reschedule or cancel from the appointment detail. Add to your calendar with one click.",
        "Appointments show provider, date, time, and location. You can join a telehealth visit from the same page when it's time.",
        "Use the appointments section to manage your visits. Get reminders and instructions before each appointment. Past visits stay in your history.",
      ],
      cta: ["View appointments", "Schedule", "Continue", "OK"],
    },
  },
  {
    id: "health",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center", "top-right", "bottom-left", "banner", "top-left"],
    texts: {
      title: ["Your health info", "Records and results", "Stay informed"],
      body: [
        "Access your health records, lab results, and visit summaries when available. Your data is secure and you control who can see it.",
        "Results and after-visit notes appear in your portal. You can download or share with other providers when needed.",
        "Use the health section to see your timeline and documents. Message your care team or request records from the same place.",
      ],
      cta: ["View records", "See results", "Got it", "Continue"],
    },
  },
];
