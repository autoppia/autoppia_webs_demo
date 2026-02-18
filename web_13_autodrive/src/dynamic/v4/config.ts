/**
 * V4 - Popup definitions (AutoDrive: rides, trips, booking)
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
      title: ["Welcome to AutoDrive", "Book rides", "Smart trip management"],
      body: [
        "Book rides, view trip history, and manage your account. Use the menu to switch between home, trips, and profile. New features are added regularly.",
        "We've set up your account so you can request a ride, track the driver, and see past trips. Use the main screen to get started.",
        "Whether you're booking a ride or checking a past trip, the app gives you quick access to booking and history. Start from the home screen.",
      ],
      cta: ["Get started", "Book ride", "Continue", "OK"],
    },
  },
  {
    id: "book",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center"],
    texts: {
      title: ["Book a ride", "Request a trip", "Where to?"],
      body: [
        "Enter pickup and destination to see options and price. Choose ride type and confirm. Your driver will be on the way.",
        "You can schedule a ride for later or book now. The map shows pickup and drop-off. Add a stop if you need multiple destinations.",
        "Fare estimates are shown before you confirm. After booking you can track the driver and share your trip with others.",
      ],
      cta: ["Book now", "Get estimate", "Got it", "Continue"],
    },
  },
  {
    id: "trips",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right"],
    texts: {
      title: ["Your trips", "Trip history", "Past rides"],
      body: [
        "View past and upcoming trips in one place. Tap a trip for details, receipt, or to rebook the same route.",
        "Trips show date, route, fare, and driver. You can rate the ride, get a receipt, or contact support from the trip page.",
        "Use the trips list to see all your activity. Filter by past or upcoming. Rebook or report an issue from the trip detail.",
      ],
      cta: ["View trips", "See history", "Continue", "OK"],
    },
  },
  {
    id: "profile",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center"],
    texts: {
      title: ["Your profile", "Payment and preferences", "Account settings"],
      body: [
        "Update your profile, payment methods, and preferences. Add a photo and set your default addresses for faster booking.",
        "Payment methods are stored securely. You can set a default or choose at booking. View and manage from the profile section.",
        "Notification and privacy settings are in profile. Choose how you get trip updates and who can see your trip status.",
      ],
      cta: ["View profile", "Settings", "Got it", "Continue"],
    },
  },
];
