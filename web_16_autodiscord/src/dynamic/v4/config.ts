/**
 * V4 - Popup definitions and config
 * Domain: Discord-like demo (AutoDiscord) — servers, channels, messages, members
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
    placements: ["center", "bottom-right", "top-right", "middle-right"],
    texts: {
      title: [
        "Welcome to AutoDiscord",
        "Your Discord-style demo space",
        "Explore servers and channels",
      ],
      body: [
        "This demo mimics a Discord-like interface. Browse servers, open channels, read messages, and see members. Data is loaded from the backend and varies by seed.",
        "Use the server list on the left to switch between servers. Click a channel to view its messages. You can also check member lists and adjust settings.",
        "AutoDiscord lets you explore a seed-driven chat UI. Servers, channels, and messages are determined by your session seed for a consistent but varied experience.",
      ],
      cta: ["Get started", "Explore", "Continue", "OK"],
    },
  },
  {
    id: "servers",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center", "top-left", "top-banner"],
    texts: {
      title: [
        "Switch between servers",
        "Your server list",
        "Navigate servers easily",
      ],
      body: [
        "The left sidebar shows all servers you have access to. Click a server icon to switch to it and see its channels and members.",
        "Servers are listed with their names and icons. The active server is highlighted. You can jump between different communities from the same sidebar.",
        "Use the server list to move between different spaces. Each server has its own set of channels and members that you can browse.",
      ],
      cta: ["View servers", "Got it", "Continue", "OK"],
    },
  },
  {
    id: "channels",
    probability: 1,
    delayMs: [1200, 4500],
    placements: ["center", "banner", "top-right", "middle-left"],
    texts: {
      title: [
        "Browse channels in this server",
        "Channels and categories",
        "Find the right channel",
      ],
      body: [
        "Channels are listed under the server name. Click a channel to open it and see its message history. Categories help organise channels by topic.",
        "Each server has multiple channels. Select a channel from the list to view messages. Unread or active channels may be indicated so you know where to look.",
        "Use the channel list to jump to different conversations. General, announcements, and topic-specific channels are grouped for easy navigation.",
      ],
      cta: ["View channels", "Browse", "Got it", "Continue"],
    },
  },
  {
    id: "messages",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center", "top-banner", "bottom-left", "top-left"],
    texts: {
      title: [
        "Read and follow the conversation",
        "Message history in this channel",
        "Catch up on messages",
      ],
      body: [
        "The main area shows messages in the current channel. Messages include the author, timestamp, and content. Scroll to see older or newer messages.",
        "Channel messages are displayed in order. You can see who wrote what and when. The demo data changes with your seed so each session can show different content.",
        "Messages in this channel are listed chronologically. Use the scroll to browse the conversation and get context before replying or moving on.",
      ],
      cta: ["Read messages", "Got it", "Continue", "OK"],
    },
  },
  {
    id: "members",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right", "top-right", "middle-left"],
    texts: {
      title: [
        "See who's in the server",
        "Member list and presence",
        "Browse server members",
      ],
      body: [
        "The member list shows who is in the current server. You can see display names and roles. This helps you know who you're chatting with.",
        "Members are listed in the sidebar or in a dedicated panel. Click a member to view their profile or start a direct message in a full Discord app.",
        "Server members are visible so you can see the community. Member data is part of the demo and may vary by seed for testing and exploration.",
      ],
      cta: ["View members", "Got it", "Continue", "OK"],
    },
  },
  {
    id: "settings",
    probability: 1,
    delayMs: [700, 3500],
    placements: ["center", "bottom-right", "top-right", "middle-right"],
    texts: {
      title: [
        "Adjust your preferences",
        "Settings and appearance",
        "Customise your experience",
      ],
      body: [
        "Open settings to change theme (light/dark), notifications, or other options. Settings are saved locally so your choices persist across visits.",
        "The settings page lets you tailor the demo to your liking. Switch between light and dark mode and configure how the interface behaves.",
        "Use the settings screen to control theme and other options. Changes apply immediately so you can see the effect right away.",
      ],
      cta: ["Open settings", "Got it", "Continue", "OK"],
    },
  },
];
