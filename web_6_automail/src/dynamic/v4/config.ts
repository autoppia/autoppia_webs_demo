/**
 * V4 - Popup definitions (AutoMail: email, inbox, messages)
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
      title: ["Welcome to AutoMail", "Your email client", "Manage your inbox"],
      body: [
        "Browse your inbox, compose new messages, and organise your mail. Use the sidebar to switch between folders and the search bar to find messages quickly.",
        "We've set up your mail client so you can read, reply, and organise emails in one place. Check the folder list and search when you need to find something.",
        "Whether you're catching up on mail or writing a new message, the layout gives you quick access to inbox, sent, and other folders. Start from the sidebar.",
      ],
      cta: ["Get started", "Open inbox", "Continue", "OK"],
    },
  },
  {
    id: "inbox",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center"],
    texts: {
      title: ["Your inbox at a glance", "Read and manage messages", "Stay on top of your mail"],
      body: [
        "The inbox shows your messages with sender, subject, and preview. Click any email to read it in full and reply or forward as needed.",
        "Messages are listed with key details so you can scan quickly. Open a message to see the full thread and take action.",
        "Use the inbox list to prioritise what to read. Each message can be opened for the full content and reply options.",
      ],
      cta: ["View inbox", "Read mail", "Got it", "Continue"],
    },
  },
  {
    id: "compose",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right"],
    texts: {
      title: ["Compose new messages", "Write and send email", "Start a new message"],
      body: [
        "Use the compose button or link to start a new message. Add recipients, subject, and body, then send. Drafts are saved so you can finish later.",
        "Composing is straightforward: enter the recipient, subject, and your message. You can save as draft or send when ready.",
        "New messages can be started from the compose action. Fill in the details and send, or save as draft to continue later.",
      ],
      cta: ["Compose", "New message", "Continue", "OK"],
    },
  },
  {
    id: "search_tips",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center"],
    texts: {
      title: ["Search your mail", "Find messages quickly", "Tips for searching"],
      body: [
        "Use the search bar to find messages by sender, subject, or content. You can narrow results by folder or date if needed.",
        "Search supports keywords and partial matches. Try searching for a name or topic to pull up relevant emails.",
        "Combine search with folder filters to narrow results. You'll see matching messages with a short preview.",
      ],
      cta: ["Try search", "Search now", "Got it", "Continue"],
    },
  },
];
