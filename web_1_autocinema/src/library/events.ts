// src/lib/logger.ts

export const EVENT_TYPES = {
  SEARCH_MOVIE: "SEARCH_MOVIE",
  FILTER_MOVIES: "FILTER_MOVIES",
  VIEW_MOVIE_DETAIL: "VIEW_MOVIE_DETAIL",
  WATCH_TRAILER: "WATCH_TRAILER",
  ADD_TO_WATCHLIST: "ADD_TO_WATCHLIST",
  SHARE_MOVIE: "SHARE_MOVIE",
  POST_COMMENT: "POST_COMMENT",
  LOGIN_SUCCESS: "login.success",
  LOGIN_FAILURE: "login.failure",
  LOGOUT: "logout",
  REGISTER_SUCCESS: "register.success",
  REGISTER_FAILURE: "register.failure",
  EDIT_MOVIE: "edit.event",
  DELETE_MOVIE: "delete.event",
  CONTACT_MESSAGE: "contact.message",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent(eventType: EventType, data: any = {}, extra_headers: Record<string, string> = {}) {
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
    ...extra_headers,
  };

  console.log("🎬 Logging Event:", { ...payload, headers });

  fetch("/api/log-event", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}
