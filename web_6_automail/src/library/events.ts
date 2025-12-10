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
    SEARCH_EMAIL: "SEARCH_EMAIL",

    // Pagination
    EMAILS_NEXT_PAGE: "EMAILS_NEXT_PAGE",
    EMAILS_PREV_PAGE: "EMAILS_PREV_PAGE",

    // Templates
    VIEW_TEMPLATES: "VIEW_TEMPLATES",
    TEMPLATE_SELECTED: "TEMPLATE_SELECTED",
    TEMPLATE_BODY_EDITED: "TEMPLATE_BODY_EDITED",
    TEMPLATE_SENT: "TEMPLATE_SENT",
    TEMPLATE_SAVED_DRAFT: "TEMPLATE_SAVED_DRAFT",
    TEMPLATE_CANCELED: "TEMPLATE_CANCELED",
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

  const webAgentId = localStorage.getItem("web_agent_id");
  const validatorId = localStorage.getItem("validator_id");
  const resolvedWebAgentId = webAgentId && webAgentId !== "null" ? webAgentId : "1";
  const resolvedValidatorId = validatorId && validatorId !== "null" ? validatorId : "1";

  // Construir el payload completo que espera el backend
  const eventData = {
    event_name: eventType,
    web_agent_id: resolvedWebAgentId,
    user_id: user,
    data,
    timestamp: new Date().toISOString(),
    validator_id: resolvedValidatorId,
  };

  const backendPayload = {
    web_agent_id: resolvedWebAgentId,
    web_url: window.location.origin,
    validator_id: resolvedValidatorId,
    data: eventData,
  };

  console.log("📦 Logging Event:", backendPayload);

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extra_headers,
    },
    body: JSON.stringify(backendPayload),
  }).catch((error) => {
    console.error("❌ Failed to log event:", error);
  });
}
