// src/lib/logger.ts

export const EVENT_TYPES = {
  // Home page
  ENTER_LOCATION: "ENTER_LOCATION",
  ENTER_DESTINATION: "ENTER_DESTINATION",
  SEE_PRICES: "SEE_PRICES",
  // Ride PickupNow page
  SELECT_DATE: "SELECT_DATE",
  SELECT_TIME: "SELECT_TIME",
  NEXT_PICKUP: "NEXT_PICKUP",
  // Ride page
  SEARCH: "SEARCH",
  RIDE_ENTER_LOCATION: "RIDE_ENTER_LOCATION",
  RIDE_ENTER_DESTINATION: "RIDE_ENTER_DESTINATION",
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
