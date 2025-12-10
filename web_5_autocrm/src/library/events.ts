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
