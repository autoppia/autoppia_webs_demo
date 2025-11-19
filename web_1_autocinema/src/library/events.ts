// src/lib/logger.ts

export const EVENT_TYPES = {
  REGISTRATION: "REGISTRATION",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  LOGIN: "LOGIN",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  EDIT_USER: "EDIT_USER",
  FILM_DETAIL: "FILM_DETAIL",
  ADD_FILM: "ADD_FILM",
  EDIT_FILM: "EDIT_FILM",
  DELETE_FILM: "DELETE_FILM",
  SEARCH_FILM: "SEARCH_FILM",
  FILTER_FILM: "FILTER_FILM",
  ADD_COMMENT: "ADD_COMMENT",
  CONTACT: "CONTACT",
  WATCH_TRAILER: "WATCH_TRAILER",
  ADD_TO_WATCHLIST: "ADD_TO_WATCHLIST",
  SHARE_MOVIE: "SHARE_MOVIE",
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
