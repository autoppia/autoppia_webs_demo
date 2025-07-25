// src/lib/logger.ts

export const EVENT_TYPES = {
  // DASHBOARD_SIDEBAR_CLICKED: "DASHBOARD_SIDEBAR_CLICKED",
  // MATTERS_SIDEBAR_CLICKED: "MATTERS_SIDEBAR_CLICKED",
  // CLIENTS_SIDEBAR_CLICKED: "CLIENTS_SIDEBAR_CLICKED",
  // DOCUMENTS_SIDEBAR_CLICKED: "DOCUMENTS_SIDEBAR_CLICKED",
  // CALENDAR_SIDEBAR_CLICKED: "CALENDAR_SIDEBAR_CLICKED",
  // TIME_AND_BILLING_SIDEBAR_CLICKED: "TIME_AND_BILLING_SIDEBAR_CLICKED",
  // SETTINGS_SIDEBAR_CLICKED: "SETTINGS_SIDEBAR_CLICKED",
  ADD_NEW_MATTER: "ADD_NEW_MATTER",
  DELETE_MATTER: "DELETE_MATTER",
  ARCHIVE_MATTER: "ARCHIVE_MATTER",
  VIEW_MATTER_DETAILS: "VIEW_MATTER_DETAILS",
  SEARCH_CLIENT: "SEARCH_CLIENT",
  VIEW_CLIENT_DETAILS: "VIEW_CLIENT_DETAILS",
  DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
  DOCUMENT_DELETED: "DOCUMENT_DELETED",
  // TIMER_STARTED: "TIMER_STARTED",
  // TIMER_STOPPED: "TIMER_STOPPED",
  NEW_LOG_ADDED: "NEW_LOG_ADDED",
  LOG_DELETE: "LOG_DELETE",
  NEW_CALENDAR_EVENT_ADDED: "NEW_CALENDAR_EVENT_ADDED",
  CHANGE_USER_NAME: "CHANGE_USER_NAME",
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
    data,
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
