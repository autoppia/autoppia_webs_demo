// src/lib/logger.ts

export const EVENT_TYPES = {
  REGISTRATION: "REGISTRATION",
  LOGIN: "LOGIN",
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
  REMOVE_FROM_WATCHLIST: "REMOVE_FROM_WATCHLIST",
  SHARE_MOVIE: "SHARE_MOVIE",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/**
 * JSON.stringify drops trailing ".0" on whole numbers. Python's json decoder then
 * yields int for "rating":5. Rewrite whole-number rating values to N.0 so the
 * wire format keeps float semantics (e.g. ADD_FILM with input "5" → 5.0).
 */
export function jsonStringifyForLogEvent(payload: object): string {
  return JSON.stringify(payload).replace(
    /"rating"\s*:\s*(-?\d+)(?=\s*[,\}\]])/g,
    '"rating":$1.0',
  );
}

export function logEvent(eventType: EventType, data: object = {}, extra_headers: Record<string, string> = {}) {
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
      "X-WebAgent-Id": resolvedWebAgentId,
      "X-Validator-Id": resolvedValidatorId,
      ...extra_headers,
    },
    body: jsonStringifyForLogEvent(backendPayload),
  }).catch((error) => {
    console.error("❌ Failed to log event:", error);
    throw error; // User wants errors to fail
  });
}
