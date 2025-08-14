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
