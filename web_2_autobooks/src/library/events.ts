// src/lib/logger.ts

export const EVENT_TYPES = {
  SEARCH_BOOK: "SEARCH_BOOK",
  FILTER_BOOKS: "FILTER_BOOKS",
  VIEW_BOOK_DETAIL: "VIEW_BOOK_DETAIL",
  OPEN_PREVIEW: "OPEN_PREVIEW",
  SAVE_BOOKMARK: "SAVE_BOOKMARK",
  SHARE_BOOK: "SHARE_BOOK",
  POST_REVIEW: "POST_REVIEW",
  LOGIN_SUCCESS: "login.success",
  LOGIN_FAILURE: "login.failure",
  LOGOUT: "logout",
  SIGNUP_SUCCESS: "signup.success",
  SIGNUP_FAILURE: "signup.failure",
  EDIT_BOOK: "edit.event",
  DELETE_BOOK: "delete.event",
  CONTACT_MESSAGE: "contact.message",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent(
  eventType: EventType,
  data: Record<string, unknown> = {},
  extraHeaders: Record<string, string> = {}
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

  const payload = {
    event_name: eventType,
    data,
    user_id: user,
  };

  const headers = {
    "Content-Type": "application/json",
    "X-WebAgent-Id": resolvedWebAgentId,
    "X-Validator-Id": resolvedValidatorId,
    ...extraHeaders,
  };

  console.log("📚 Logging Event:", { ...payload, headers });

  fetch("/api/log-event", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}
