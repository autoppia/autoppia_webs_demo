// src/lib/logger.ts

export const EVENT_TYPES = {
    VIEW_EMAIL: "VIEW_EMAIL",

    // Email Actions
    MARK_AS_SPAM: "MARK_AS_SPAM", 
    MARK_AS_UNREAD: "MARK_AS_UNREAD", 
    DELETE_EMAIL: "DELETE_EMAIL", 
    ARCHIVE_EMAIL: "ARCHIVE_EMAIL",
    STAR_AN_EMAIL: "STAR_AN_EMAIL", 
    MARK_EMAIL_AS_IMPORTANT: "MARK_EMAIL_AS_IMPORTANT", 
    ADD_LABEL: "ADD_LABEL", 
    CREATE_LABEL: "CREATE_LABEL",
    SEND_EMAIL: "SEND_EMAIL",
    EMAIL_SAVE_AS_DRAFT: "EMAIL_SAVE_AS_DRAFT",
    EDIT_DRAFT_EMAIL: "EDIT_DRAFT_EMAIL",
    REPLY_EMAIL: "REPLY_EMAIL",
    FORWARD_EMAIL: "FORWARD_EMAIL",

    // Selection/Filtering
    CLEAR_SELECTION: "CLEAR_SELECTION",

    // Theme/Preferences
    THEME_CHANGED: "THEME_CHANGED",
    SEARCH_EMAIL: "SEARCH_EMAIL"
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent<T extends Record<string, unknown>>(
  eventType: EventType,
  data: T = {} as T,
  extra_headers: Record<string, string> = {}
)
{
  if (typeof window === "undefined") return;

  let user = localStorage.getItem("user");
  if (user === "null") {
    user = null;
  }

  const payload = {
    event_name: eventType,
    data: {
      ...data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    },
    user_id: user,
  };

  console.log("📦 Logging Event:", { ...payload, headers: extra_headers });

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extra_headers,
    },
    body: JSON.stringify(payload),
  });
}
