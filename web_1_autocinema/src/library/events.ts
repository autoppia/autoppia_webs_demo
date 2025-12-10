// src/lib/logger.ts

export const EVENT_TYPES = {
  REGISTRATION: "REGISTRATION",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  LOGIN: "LOGIN",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
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

  console.log("🎬 Logging Event:", backendPayload);

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extra_headers,
    },
    body: JSON.stringify(backendPayload),
  }).catch((error) => {
    console.error("❌ Failed to log event:", error);
  });
}
