/**
 * V4 - Popup definitions and config
 * Declarative list of popups: delay, placements, and meaningful lengthy texts
 * Domain: Bittensor network explorer & analytics (AutoStats)
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
        "Welcome to AutoStats",
        "Bittensor network explorer & analytics",
        "Explore the network in real-time",
      ],
      body: [
        "AutoStats lets you explore the Bittensor network: view blocks, transactions, validators, subnets, and key statistics. Data updates as the chain progresses.",
        "Browse blocks, validators, and subnets from the Bittensor network. Use the search and filters to find specific entities and track network activity.",
        "From the homepage you can jump to subnets, validators, or blocks. Each section shows live data and links to detailed views for deeper analysis.",
      ],
      cta: ["Get started", "Explore network", "Browse", "Continue"],
    },
  },
  {
    id: "blocks",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center", "top-left", "top-banner"],
    texts: {
      title: [
        "Explore blocks and chain history",
        "View block details and transactions",
        "Browse the block explorer",
      ],
      body: [
        "The blocks section lists recent blocks with basic metadata. Click a block to see its number, timestamp, and related transactions in more detail.",
        "Use the blocks page to navigate the chain chronologically. You can step forward and backward between blocks to inspect the network state at any point.",
        "Blocks are the building blocks of the chain. Each block contains transactions and state updates; use the block detail view to see what changed.",
      ],
      cta: ["View blocks", "Browse", "See details", "OK"],
    },
  },
  {
    id: "validators",
    probability: 1,
    delayMs: [1200, 4500],
    placements: ["center", "banner", "top-right", "middle-left"],
    texts: {
      title: [
        "Discover validators and their activity",
        "Validator rankings and metrics",
        "Track validator performance",
      ],
      body: [
        "The validators section shows active validators on the network. You can see hotkeys, stakes, and other metrics to understand who is securing the chain.",
        "Click a validator to open its detail page with more statistics and history. Use the list view to compare validators and sort by different criteria.",
        "Validators are key to network security. AutoStats aggregates their data so you can see who is online, their stake, and how they contribute to subnets.",
      ],
      cta: ["View validators", "Browse", "See list", "Continue"],
    },
  },
  {
    id: "subnets",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center", "top-banner", "bottom-left", "top-left"],
    texts: {
      title: [
        "Explore subnets and their structure",
        "Subnet overview and details",
        "Navigate the subnet landscape",
      ],
      body: [
        "Subnets organise the Bittensor network into logical units. From the subnets page you can see all subnets and drill into each for validators and metrics.",
        "Each subnet has its own set of validators and specific rules. Use the subnet detail view to understand capacity, participation, and activity per subnet.",
        "The subnets section helps you see how the network is organised. Click any subnet to view its ID, validators, and related statistics in one place.",
      ],
      cta: ["View subnets", "Browse", "Explore", "Got it"],
    },
  },
  {
    id: "search",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right", "top-right", "middle-left"],
    texts: {
      title: [
        "Search blocks, validators, and subnets",
        "Find entities quickly with search",
        "Use global search to navigate",
      ],
      body: [
        "Use the search bar to find blocks by number, validators by hotkey, or subnets by ID. Results are grouped by type so you can jump straight to the right page.",
        "Search supports block numbers, validator hotkeys, and subnet identifiers. Results update as you type so you can quickly narrow down what you need.",
        "The global search modal lets you search across the whole dataset. Open it from the header to look up any block, validator, or subnet in one place.",
      ],
      cta: ["Try search", "Search now", "Got it", "OK"],
    },
  },
  {
    id: "stats",
    probability: 1,
    delayMs: [700, 3500],
    placements: ["center", "bottom-right", "top-right", "middle-right"],
    texts: {
      title: [
        "Network statistics at a glance",
        "Key metrics and live data",
        "Real-time network overview",
      ],
      body: [
        "The homepage and section headers show high-level stats such as block count, validator count, and subnet activity. Data is refreshed as the chain progresses.",
        "AutoStats aggregates live data from the Bittensor network. Use the dashboard and list views to see totals, recent activity, and trends over time.",
        "Statistics help you understand network health and usage. Check the landing page for a summary and dive into blocks, validators, or subnets for more detail.",
      ],
      cta: ["View stats", "See overview", "Got it", "Continue"],
    },
  },
];
