// src/lib/logger.ts

export const EVENT_TYPES = {
  SEARCH_HOTEL: "SEARCH_HOTEL",
  VIEW_HOTEL: "VIEW_HOTEL",
  RESERVE_HOTEL: "RESERVE_HOTEL",
  INCREASE_NUMBER_OF_GUESTS: "INCREASE_NUMBER_OF_GUESTS",
  EDIT_CHECK_IN_OUT_DATES: "EDIT_CHECK_IN_OUT_DATES",
  MESSAGE_HOST: "MESSAGE_HOST",
  CONFIRM_AND_PAY: "CONFIRM_AND_PAY",
  ADD_TO_WISHLIST: "ADD_TO_WISHLIST",
  REMOVE_FROM_WISHLIST: "REMOVE_FROM_WISHLIST",
  SHARE_HOTEL: "SHARE_HOTEL",
  // DECREASE_NUMBER_OF_GUESTS: "DECREASE_NUMBER_OF_GUESTS",
  // SEARCH_CLEARED: "SEARCH_CLEARED",
  // EDIT_NUMBER_OF_GUESTS: "EDIT_NUMBER_OF_GUESTS",
  // BACK_TO_ALL_HOTELS: "BACK_TO_ALL_HOTELS",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
type JsonPayload = Record<string, unknown>;

export function logEvent(
  eventType: EventType,
  data: JsonPayload = {},
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
