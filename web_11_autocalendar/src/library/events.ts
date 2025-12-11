// src/lib/logger.ts

export const EVENT_TYPES = {
  SELECT_TODAY: "SELECT_TODAY",  
  SELECT_DAY: "SELECT_DAY",  
  SELECT_FIVE_DAYS: "SELECT_FIVE_DAYS",  
  SELECT_WEEK: "SELECT_WEEK",  
  SELECT_MONTH: "SELECT_MONTH",  
  CELL_CLICKED:"CELL_CLICKED",
  ADD_EVENT: "ADD_EVENT",  
  CANCEL_ADD_EVENT: "CANCEL_ADD_EVENT",
  DELETE_EVENT: "DELETE_ADDED_EVENT",
  ADD_NEW_CALENDAR: "ADD_NEW_CALENDAR",  
  CREATE_CALENDAR: "CREATE_CALENDAR", 
  CHOOSE_CALENDAR:"CHOOSE_CALENDAR", 
  EVENT_WIZARD_OPEN: "EVENT_WIZARD_OPEN",
  // EVENT_WIZARD_NEXT: "EVENT_WIZARD_NEXT", // Removed
  // EVENT_WIZARD_PREV: "EVENT_WIZARD_PREV", // Removed
  EVENT_ADD_ATTENDEE: "EVENT_ADD_ATTENDEE",
  EVENT_REMOVE_ATTENDEE: "EVENT_REMOVE_ATTENDEE",
  EVENT_ADD_REMINDER: "EVENT_ADD_REMINDER",
  EVENT_REMOVE_REMINDER: "EVENT_REMOVE_REMINDER",
  // Keep only submit for search
  SEARCH_SUBMIT: "SEARCH_SUBMIT",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent<T extends Record<string, unknown>>(
  eventType: EventType,
  data: T = {} as T,
  extra_headers: Record<string, string> = {}
) {
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
      "X-WebAgent-Id": resolvedWebAgentId,
      "X-Validator-Id": resolvedValidatorId,
      ...extra_headers,
    },
    body: JSON.stringify(backendPayload),
  }).catch((error) => {
    console.error("❌ Failed to log event:", error);
    throw error;
  });
}
