/**
 * V4 - Popup definitions (AutoCRM: matters, clients, documents)
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
    placements: ["center", "bottom-right"],
    texts: {
      title: ["Welcome to AutoCRM", "Manage clients and matters", "Your CRM dashboard"],
      body: [
        "Manage clients, matters, and documents in one place. Navigate from the sidebar to clients, matters, billing, or documents. New data is loaded based on your session.",
        "We've organised your workspace so you can quickly access clients, cases, and documents. Use the menu to switch between sections and stay on top of your pipeline.",
        "Whether you're updating a matter or adding a client, the dashboard gives you quick access to all key areas. Start with the sidebar or the main content.",
      ],
      cta: ["Get started", "Go to dashboard", "Continue", "OK"],
    },
  },
  {
    id: "clients",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center"],
    texts: {
      title: ["Manage your clients", "Client list and details", "Access client information"],
      body: [
        "The clients section lists all your contacts. Open any client to view details, matters, and related documents. You can add or edit clients from there.",
        "Client records are central to your CRM. Use the client list to find contacts, then drill into details and linked matters for a full picture.",
        "From the clients page you can search, filter, and open client profiles. Each profile shows contact info and associated matters and documents.",
      ],
      cta: ["View clients", "Open list", "Got it", "Continue"],
    },
  },
  {
    id: "matters",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right"],
    texts: {
      title: ["Track matters and cases", "Matters at a glance", "Manage your matters"],
      body: [
        "The matters section shows all your cases or projects. Open a matter to see its status, linked clients, and related documents.",
        "Keep matters organised by status and client. Use the matters list to prioritise and update case progress as you go.",
        "Each matter has its own page with details and links to clients and documents. Navigate from the matters list to stay on top of your workload.",
      ],
      cta: ["View matters", "Open list", "Continue", "OK"],
    },
  },
  {
    id: "documents",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center"],
    texts: {
      title: ["Documents and files", "Access your documents", "Document management"],
      body: [
        "The documents section lets you browse and manage files linked to clients and matters. Use filters to find the right document quickly.",
        "Documents are organised so you can find them by matter or client. Open any document to view or download as needed.",
        "From the documents page you can see all uploaded files and their associations. Use search or filters to narrow down the list.",
      ],
      cta: ["View documents", "Open", "Got it", "Continue"],
    },
  },
];
