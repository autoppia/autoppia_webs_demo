// src/lib/logger.ts

export const EVENT_TYPES = {
  ADD_TASK: "ADD_TASK_CLICKED", //done
  ADD: "TASK_ADDED", //done
  CANCEL_TASK: "CANCEL_TASK_CREATION", //done
  SELECT_DATE: "SELECT_DATE_FOR_TASK", //done
  SELECT_PRIORITY: "SELECT_TASK_PRIORITY", //done
  EDIT_TASK_MODAL_OPENED: "EDIT_TASK_MODAL_OPENED", //done
  DELETE_TASK: "DELETE_TASK", //done
  COMPLETE_TASK: "COMPLETE_TASK", //done
  PROFILE_CLICKED: "PROFILE_CLICKED",
  SETTINGS_CLICKED: "SETTINGS_CLICKED",
  LOGOUT_CLICKED: "LOGOUT_CLICKED",
  UPCOMING_CLICKED: "UPCOMING_CLICKED",
  DRAFT_CLICKED: "DRAFT_CLICKED",
  MORE_MENU_CLICKED: "MORE_MENU_CLICKED",
  ADD_TEAM_CLICKED: "ADD_TEAM_CLICKED",
  TEAM_CREATED: "TEAM_CREATED",
  TEAM_NAME_VALIDATED: "TEAM_NAME_VALIDATED",
  TEAM_DESCRIPTION_VALIDATED: "TEAM_DESCRIPTION_VALIDATED",
  TEAM_AVATAR_UPLOADED: "TEAM_AVATAR_UPLOADED",
  TEAM_MEMBERS_ADDED: "TEAM_MEMBERS_ADDED",
  TEAM_ROLE_ASSIGNED: "TEAM_ROLE_ASSIGNED",
  FORM_VALIDATION_ERROR: "FORM_VALIDATION_ERROR",
  FORM_SUBMISSION_STARTED: "FORM_SUBMISSION_STARTED",
  FORM_SUBMISSION_SUCCESS: "FORM_SUBMISSION_SUCCESS",
  FORM_SUBMISSION_FAILED: "FORM_SUBMISSION_FAILED",
  FORM_FIELD_CHANGED: "FORM_FIELD_CHANGED",
  FORM_FIELD_FOCUSED: "FORM_FIELD_FOCUSED",
  FORM_FIELD_BLURRED: "FORM_FIELD_BLURRED",
  FORM_CLEARED: "FORM_CLEARED"
  // CHECK_SIDEBAR_INBOX_CLICKED: "CHECK_SIDEBAR_INBOX_CLICKED", //done
  // CHECK_SIDEBAR_COMPLETE_CLICKED: "CHECK_SIDEBAR_COMPLETE_CLICKED", //done
  // CHECK_SIDEBAR_TODAY_CLICKED:"CHECK_SIDEBAR_TODAY_CLICKED" //done
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
