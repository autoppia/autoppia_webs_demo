import { getApiBaseUrl } from "@/dynamic/seed";

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
  ADD_PRODUCT_TO_WATCHLIST: "ADD_PRODUCT_TO_WATCHLIST",
  REMOVE_FROM_WATCHLIST: "REMOVE_FROM_WATCHLIST",
  RATE_FILM: "RATE_FILM",
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
    web_agent_id: resolvedWebAgentId,
    validator_id: resolvedValidatorId,
    timestamp: new Date().toISOString(),
  };

  const headers = {
    "Content-Type": "application/json",
    "X-WebAgent-Id": resolvedWebAgentId,
    "X-Validator-Id": resolvedValidatorId,
    ...extra_headers,
  };

  console.log("🎬 Logging Event:", { ...payload, headers });

  const backendUrl = `${getApiBaseUrl()}/save_events/`;
  const backendPayload = {
    web_agent_id: resolvedWebAgentId,
    web_url: window.location?.href || null,
    data: payload,
    validator_id: resolvedValidatorId,
  };

  fetch(backendUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(backendPayload),
  }).catch((error) => {
    console.warn("[autocinema] Failed to send event", error);
  });
}
