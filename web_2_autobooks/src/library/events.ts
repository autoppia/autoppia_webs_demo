// src/lib/logger.ts

export const EVENT_TYPES = {
  // Backend-validated events (must match backend parse names)
  SEARCH_BOOK: "SEARCH_BOOK",
  FILTER_BOOK: "FILTER_BOOK",
  BOOK_DETAIL: "BOOK_DETAIL",
  SHOPPING_CART: "SHOPPING_CART",
  PURCHASE_BOOK: "PURCHASE_BOOK",
  ADD_COMMENT_BOOK: "ADD_COMMENT_BOOK",
  LOGIN_BOOK: "LOGIN_BOOK",
  LOGOUT_BOOK: "LOGOUT_BOOK",
  REGISTRATION_BOOK: "REGISTRATION_BOOK",
  EDIT_BOOK: "EDIT_BOOK",
  DELETE_BOOK: "DELETE_BOOK",
  CONTACT_BOOK: "CONTACT_BOOK",
  EDIT_USER_BOOK: "EDIT_USER_BOOK",
  ADD_BOOK: "ADD_BOOK",

  // Optional UI-only events (not used by backend validators)
  OPEN_PREVIEW: "OPEN_PREVIEW",
  SHARE_BOOK: "SHARE_BOOK",
  // POST_REVIEW: "POST_REVIEW",
  // LOGIN_SUCCESS: "login.success",
  // LOGIN_FAILURE: "login.failure",
  // LOGOUT: "logout",
  // SIGNUP_SUCCESS: "signup.success",
  // SIGNUP_FAILURE: "signup.failure",
  // EDIT_BOOK: "edit.event",
  // DELETE_BOOK: "delete.event",
  // CONTACT_MESSAGE: "contact.message",
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
    data: {
      ...data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    },
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
