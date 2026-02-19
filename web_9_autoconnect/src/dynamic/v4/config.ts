/**
 * V4 - Popup definitions (AutoConnect: social, connections, profile)
 */

export type PopupPlacement = "center" | "bottom-right" | "bottom-left" | "banner" | "top-right" | "top-left" | "top-banner" | "middle-right" | "middle-left";

export interface PopupDef {
  id: string;
  probability: number;
  delayMs: [number, number];
  placements: PopupPlacement[];
  texts: Record<string, string[]>;
}

/** Placements that stay visible on screen (center and bottom area; avoid top/middle that can be off-screen or behind nav). */
const ALL_PLACEMENTS: PopupPlacement[] = [
  "center", "bottom-right", "bottom-left", "banner",
];

export const POPUPS: PopupDef[] = [
  {
    id: "welcome",
    probability: 1,
    delayMs: [800, 3200],
    placements: ALL_PLACEMENTS,
    texts: {
      title: ["Welcome to AutoConnect", "Your professional network", "Connect and share"],
      body: [
        "Build your profile, connect with others, and share updates. Explore the feed, discover jobs, and grow your network. New features are added regularly.",
        "We've set up your professional space so you can post updates, follow connections, and browse opportunities. Use the menu to switch between feed, profile, and jobs.",
        "Whether you're updating your profile or browsing the feed, the platform gives you quick access to connections and content. Start from the main feed or your profile.",
      ],
      cta: ["Get started", "Go to feed", "Continue", "OK"],
    },
  },
  {
    id: "feed",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ALL_PLACEMENTS,
    texts: {
      title: ["Your feed and updates", "Stay connected", "See what's new"],
      body: [
        "The feed shows updates from your connections and the wider network. Like, comment, or share posts. You can also create your own posts from here.",
        "Scroll the feed to stay in touch with your network. Post updates, react to others' content, and discover new connections and jobs.",
        "Use the feed to catch up on activity and share your own updates. Each post can be liked, commented on, or shared with your network.",
      ],
      cta: ["View feed", "See updates", "Got it", "Continue"],
    },
  },
  {
    id: "profile",
    probability: 1,
    delayMs: [900, 3800],
    placements: ALL_PLACEMENTS,
    texts: {
      title: ["Your profile", "Edit and showcase", "Manage your presence"],
      body: [
        "Your profile is where others see your info and activity. Edit your headline, summary, and experience. Add a photo and keep your profile up to date.",
        "The profile page shows your public information and recent activity. You can edit details and control what's visible to your network.",
        "Keep your profile updated so connections and recruiters see your latest info. Edit from the profile page and preview how it looks to others.",
      ],
      cta: ["View profile", "Edit profile", "Continue", "OK"],
    },
  },
  {
    id: "connections",
    probability: 1,
    delayMs: [600, 4000],
    placements: ALL_PLACEMENTS,
    texts: {
      title: ["Grow your network", "Find connections", "Connect with others"],
      body: [
        "Use search or suggestions to find people to connect with. Send connection requests and accept invites to grow your network.",
        "Your connections appear in the feed and in search. You can message them, see their updates, and discover mutual connections.",
        "Browse suggested connections or search by name or role. Building your network helps you stay visible and discover opportunities.",
      ],
      cta: ["Find connections", "Search", "Got it", "Continue"],
    },
  },
];
