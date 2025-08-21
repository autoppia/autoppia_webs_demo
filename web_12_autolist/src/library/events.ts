// src/lib/logger.ts

export const EVENT_TYPES = {
  ADD_TASK: "AUTOLIST_ADD_TASK_CLICKED",
  ADD: "AUTOLIST_TASK_ADDED",
  CANCEL_TASK: "AUTOLIST_CANCEL_TASK_CREATION",
  SELECT_DATE: "AUTOLIST_SELECT_DATE_FOR_TASK",
  SELECT_PRIORITY: "AUTOLIST_SELECT_TASK_PRIORITY",
  EDIT_TASK_MODAL_OPENED: "AUTOLIST_EDIT_TASK_MODAL_OPENED",
  DELETE_TASK: "AUTOLIST_DELETE_TASK",
  COMPLETE_TASK: "AUTOLIST_COMPLETE_TASK",
  ADD_TEAM_CLICKED: "AUTOLIST_ADD_TEAM_CLICKED",
  TEAM_CREATED: "AUTOLIST_TEAM_CREATED",
  TEAM_MEMBERS_ADDED: "AUTOLIST_TEAM_MEMBERS_ADDED",
  TEAM_ROLE_ASSIGNED: "AUTOLIST_TEAM_ROLE_ASSIGNED",
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
