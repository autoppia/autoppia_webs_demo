export type DiscoverCategoryId =
  | "featured"
  | "gaming"
  | "music"
  | "education"
  | "science"
  | "anime";

export interface DiscoverCategory {
  id: DiscoverCategoryId;
  label: string;
}

export const DISCOVER_CATEGORIES: DiscoverCategory[] = [
  { id: "featured", label: "Featured" },
  { id: "gaming", label: "Gaming" },
  { id: "music", label: "Music" },
  { id: "education", label: "Education" },
  { id: "science", label: "Science & Tech" },
  { id: "anime", label: "Anime & Manga" },
];

export interface DiscoverableServer {
  id: string;
  name: string;
  description: string;
  /** Primary shelf / topic */
  category: DiscoverCategoryId;
  /** Shown under “Featured” as well */
  featured: boolean;
  onlineLabel: string;
  memberLabel: string;
  /** CSS gradient stops for banner mock */
  gradient: [string, string];
}

/**
 * Static mock communities (Discord Discover–style). Not loaded from API.
 */
export const DISCOVER_SERVERS: DiscoverableServer[] = [
  {
    id: "disc-midnight",
    name: "Midnight Arcade",
    description:
      "LFG, patch notes, and cozy late-night queues. PC & console welcome.",
    category: "gaming",
    featured: true,
    onlineLabel: "18.2K online",
    memberLabel: "412K members",
    gradient: ["#5865f2", "#3c45a5"],
  },
  {
    id: "disc-lofi",
    name: "Lo-Fi Study Hall",
    description:
      "Focus sessions, playlist drops, and calm vibes. Headphones on.",
    category: "music",
    featured: true,
    onlineLabel: "9.4K online",
    memberLabel: "128K members",
    gradient: ["#7c3aed", "#4c1d95"],
  },
  {
    id: "disc-pixel",
    name: "Pixel Pioneers",
    description: "Indie devs, jam games, and weekly showcase threads.",
    category: "gaming",
    featured: true,
    onlineLabel: "6.1K online",
    memberLabel: "89K members",
    gradient: ["#059669", "#064e3b"],
  },
  {
    id: "disc-open",
    name: "Open Courseware",
    description: "Free lectures, study groups, and exam prep by topic.",
    category: "education",
    featured: true,
    onlineLabel: "4.8K online",
    memberLabel: "203K members",
    gradient: ["#0ea5e9", "#1e3a8a"],
  },
  {
    id: "disc-neural",
    name: "Neural Garden",
    description: "ML papers, tooling, and hardware talk without the hype.",
    category: "science",
    featured: true,
    onlineLabel: "11.0K online",
    memberLabel: "156K members",
    gradient: ["#6366f1", "#312e81"],
  },
  {
    id: "disc-sakura",
    name: "Sakura Society",
    description: "Seasonal watches, figure photos, and spoiler-safe channels.",
    category: "anime",
    featured: true,
    onlineLabel: "22.5K online",
    memberLabel: "501K members",
    gradient: ["#ec4899", "#831843"],
  },
  {
    id: "disc-rhythm",
    name: "Rhythm Runners",
    description: "Speedrun schedules, charity marathons, and PB brags.",
    category: "gaming",
    featured: false,
    onlineLabel: "3.2K online",
    memberLabel: "54K members",
    gradient: ["#f59e0b", "#92400e"],
  },
  {
    id: "disc-vinyl",
    name: "Vinyl & Tapes",
    description: "Rare finds, listening parties, and gear swaps.",
    category: "music",
    featured: false,
    onlineLabel: "1.9K online",
    memberLabel: "31K members",
    gradient: ["#78716c", "#292524"],
  },
  {
    id: "disc-hack",
    name: "Hack Night",
    description: "Weekly builds, OSS contributions, and mentor hours.",
    category: "science",
    featured: false,
    onlineLabel: "5.6K online",
    memberLabel: "72K members",
    gradient: ["#14b8a6", "#134e4a"],
  },
  {
    id: "disc-manga",
    name: "Manga Shelf",
    description: "Release calendars, translation notes, and recs.",
    category: "anime",
    featured: false,
    onlineLabel: "8.3K online",
    memberLabel: "97K members",
    gradient: ["#a855f7", "#581c87"],
  },
  {
    id: "disc-campus",
    name: "Campus Commons",
    description: "Clubs, housing tips, and city meetups for students.",
    category: "education",
    featured: false,
    onlineLabel: "2.4K online",
    memberLabel: "44K members",
    gradient: ["#22c55e", "#14532d"],
  },
];

export function filterDiscoverServers(
  category: DiscoverCategoryId,
  query: string,
): DiscoverableServer[] {
  const q = query.trim().toLowerCase();
  const byCategory =
    category === "featured"
      ? DISCOVER_SERVERS.filter((s) => s.featured)
      : DISCOVER_SERVERS.filter((s) => s.category === category);
  if (!q) return byCategory;
  return byCategory.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q),
  );
}
