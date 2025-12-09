export const EVENT_TYPES = {
  ADD_NEW_MATTER: "ADD_NEW_MATTER",
  DELETE_MATTER: "DELETE_MATTER",
  ARCHIVE_MATTER: "ARCHIVE_MATTER",
  VIEW_MATTER_DETAILS: "VIEW_MATTER_DETAILS",
  SEARCH_CLIENT: "SEARCH_CLIENT",
  VIEW_CLIENT_DETAILS: "VIEW_CLIENT_DETAILS",
  DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
  DOCUMENT_DELETED: "DOCUMENT_DELETED",
  DOCUMENT_RENAMED: "DOCUMENT_RENAMED",
  BILLING_SEARCH: "BILLING_SEARCH",
  ADD_CLIENT: "ADD_CLIENT",
  DELETE_CLIENT: "DELETE_CLIENT",
  FILTER_CLIENTS: "FILTER_CLIENTS",
  HELP_VIEWED: "HELP_VIEWED",
  NEW_LOG_ADDED: "NEW_LOG_ADDED",
  LOG_DELETE: "LOG_DELETE",
  LOG_EDITED: "LOG_EDITED",
  NEW_CALENDAR_EVENT_ADDED: "NEW_CALENDAR_EVENT_ADDED",
  CHANGE_USER_NAME: "CHANGE_USER_NAME",
  VIEW_PENDING_EVENTS: "VIEW_PENDING_EVENTS",
  SEARCH_MATTER: "SEARCH_MATTER",
  FILTER_MATTER_STATUS: "FILTER_MATTER_STATUS",
  SORT_MATTER_BY_CREATED_AT: "SORT_MATTER_BY_CREATED_AT",
  UPDATE_MATTER: "UPDATE_MATTER",
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
