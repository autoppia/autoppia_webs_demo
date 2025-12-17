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
  BACK_TO_ALL_HOTELS: "BACK_TO_ALL_HOTELS",
  EDIT_NUMBER_OF_GUESTS: "EDIT_NUMBER_OF_GUESTS",
  APPLY_FILTERS: "APPLY_FILTERS",
  SUBMIT_REVIEW: "SUBMIT_REVIEW",
  PAYMENT_METHOD_SELECTED: "PAYMENT_METHOD_SELECTED",
  HELP_VIEWED: "HELP_VIEWED",
  FAQ_OPENED: "FAQ_OPENED",
  POPULAR_HOTELS_VIEWED: "POPULAR_HOTELS_VIEWED",
  WISHLIST_OPENED: "WISHLIST_OPENED",
  BOOK_FROM_WISHLIST: "BOOK_FROM_WISHLIST",
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
