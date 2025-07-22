// src/lib/logger.ts

export const EVENT_TYPES = {
  SELECT_TODAY: "SELECT_TODAY",
  SELECT_DAY: "SELECT_DAY",
  SELECT_FIVE_DAYS: "SELECT_FIVE_DAYS",
  SELECT_WEEK: "SELECT_WEEK",
  SELECT_MONTH: "SELECT_MONTH",
  CELL_CLCIKED: "CELL_CLCIKED",
  ADD_EVENT: "ADD_EVENT",
  CANCEL_ADD_EVENT: "CANCEL_ADD_EVENT",
  ADD_NEW_CALENDAR: "ADD_NEW_CALENDAR",
  CREATE_CALENDAR: "CREATE_CALENDAR",
  CHOOSE_CALENDAR: "CHOOSE_CALENDAR",
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
