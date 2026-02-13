import type { Label } from "@/types/email";

// Predefined system labels
export const systemLabels: Label[] = [
  { id: "inbox", name: "Inbox", color: "#1a73e8", type: "system" },
  { id: "starred", name: "Starred", color: "#f9ab00", type: "system" },
  { id: "snoozed", name: "Snoozed", color: "#ea4335", type: "system" },
  { id: "sent", name: "Sent", color: "#34a853", type: "system" },
  { id: "drafts", name: "Drafts", color: "#9aa0a6", type: "system" },
  { id: "archive", name: "Archive", color: "#5f6368", type: "system" },
  { id: "spam", name: "Spam", color: "#ea4335", type: "system" },
  { id: "trash", name: "Trash", color: "#5f6368", type: "system" },
  { id: "important", name: "Important", color: "#fbbc04", type: "system" },
];

// Custom user labels - only Work and Personal by default
export const userLabels: Label[] = [
  { id: "work", name: "Work", color: "#4285f4", type: "user" },
  { id: "personal", name: "Personal", color: "#0f9d58", type: "user" },
];
