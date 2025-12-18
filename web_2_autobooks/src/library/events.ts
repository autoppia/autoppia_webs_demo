// src/lib/logger.ts

export const EVENT_TYPES = {
  // Backend-validated events (must match backend parse names)
  SEARCH_BOOK: "SEARCH_BOOK",
  FILTER_BOOK: "FILTER_BOOK",
  BOOK_DETAIL: "BOOK_DETAIL",
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
  ADD_TO_READING_LIST: "ADD_TO_READING_LIST",
  REMOVE_FROM_READING_LIST: "REMOVE_FROM_READING_LIST",
  VIEW_CART_BOOK: "VIEW_CART_BOOK",
  ADD_TO_CART_BOOK: "ADD_TO_CART_BOOK",
  REMOVE_FROM_CART_BOOK: "REMOVE_FROM_CART_BOOK",
  // POST_REVIEW: "POST_REVIEW",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent(
  eventType: EventType,
  // Accept any object payload (some callers pass typed payloads like BookDetailPayload)
  data: object = {},
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

  console.log("📚 Logging Event:", backendPayload);

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WebAgent-Id": resolvedWebAgentId,
      "X-Validator-Id": resolvedValidatorId,
      ...extraHeaders,
    },
    body: JSON.stringify(backendPayload),
  }).catch((error) => {
    console.error("❌ Failed to log event:", error);
    throw error;
  });
}
