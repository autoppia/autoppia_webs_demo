// src/lib/logger.ts

export const EVENT_TYPES = {
  // Home page
  ENTER_LOCATION: "ENTER_LOCATION",
  ENTER_DESTINATION: "ENTER_DESTINATION",
  SEARCH_LOCATION: "SEARCH_LOCATION",
  SEARCH_DESTINATION: "SEARCH_DESTINATION",
  // Ride PickupNow page
  SELECT_DATE: "SELECT_DATE",
  SELECT_TIME: "SELECT_TIME",
  NEXT_PICKUP: "NEXT_PICKUP",
  // Ride page
  SEARCH: "SEARCH",
  SELECT_CAR: "SELECT_CAR",
  RESERVE_RIDE: "RESERVE_RIDE",
  // Trip page
  TRIP_DETAILS: "TRIP_DETAILS",
  // Cancel reservation
  CANCEL_RESERVATION: "CANCEL_RESERVATION",
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

  console.log("📦 Logging Event:", backendPayload);

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WebAgent-Id": resolvedWebAgentId,
      "X-Validator-Id": resolvedValidatorId,
      ...extra_headers,
    },
    body: JSON.stringify(backendPayload),
  }).catch((error) => {
    console.error("❌ Failed to log event:", error);
    throw error;
  });
}
